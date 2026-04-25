
/**
 * VisualForge AI — In-Browser SQL Engine
 * Supports: CREATE TABLE, INSERT, SELECT (WHERE, JOIN, GROUP BY, ORDER BY, LIMIT),
 *           UPDATE, DELETE, DROP TABLE
 */
const SQLEngine = (() => {

  // ── Database (in-memory) ────────────────────────────────────────────────────
  const db = {};        // { tableName: { columns: [...], rows: [[...]] } }
  const history = [];   // executed queries log

  // ── Tokenizer ───────────────────────────────────────────────────────────────
  function tokenize(sql) {
    const tokens = [];
    const re = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b\w+\b|[(),;*=<>!]+|[^\s])/g;
    let m;
    while ((m = re.exec(sql)) !== null) tokens.push(m[1]);
    return tokens;
  }

  function upper(t) { return (t || '').toUpperCase(); }

  // ── Parser / Executor ───────────────────────────────────────────────────────
  function execute(sql) {
    const lines = sql.split(';').map(s => s.trim()).filter(Boolean);
    const results = [];
    for (const line of lines) {
      if (!line) continue;
      try {
        const r = executeOne(line);
        history.push({ sql: line, ok: true });
        results.push(r);
      } catch (e) {
        history.push({ sql: line, ok: false, error: e.message });
        results.push({ error: e.message, sql: line });
      }
    }
    return results;
  }

  function executeOne(sql) {
    const tokens = tokenize(sql);
    const cmd = upper(tokens[0]);
    switch (cmd) {
      case 'CREATE': return execCreate(tokens, sql);
      case 'INSERT': return execInsert(tokens, sql);
      case 'SELECT': return execSelect(tokens, sql);
      case 'UPDATE': return execUpdate(tokens, sql);
      case 'DELETE': return execDelete(tokens, sql);
      case 'DROP':   return execDrop(tokens, sql);
      case 'SHOW':   return execShow(tokens, sql);
      default: throw new Error(`Unknown command: ${cmd}`);
    }
  }

  // ── CREATE TABLE ────────────────────────────────────────────────────────────
  function execCreate(tokens, sql) {
    if (upper(tokens[1]) !== 'TABLE') throw new Error('Expected TABLE after CREATE');
    const name = tokens[2].toLowerCase();

    // Extract everything inside the outermost parens
    const parenStart = sql.indexOf('(');
    const parenEnd = sql.lastIndexOf(')');
    if (parenStart < 0 || parenEnd < 0) throw new Error('Missing column definitions');
    const inner = sql.slice(parenStart + 1, parenEnd);

    // Split by comma but not inside parens (handles FOREIGN KEY etc.)
    const colDefs = splitByComma(inner);
    const columns = [];
    colDefs.forEach(def => {
      const trimmed = def.trim();
      if (!trimmed) return;
      const u = trimmed.toUpperCase();
      // Skip constraints
      if (u.startsWith('PRIMARY KEY') || u.startsWith('FOREIGN KEY') ||
          u.startsWith('UNIQUE') || u.startsWith('CHECK') || u.startsWith('INDEX')) return;
      // Column name is the first token
      const firstToken = trimmed.split(/\s+/)[0];
      if (firstToken) columns.push(firstToken); // preserve original case
    });

    if (!columns.length) throw new Error('No columns defined');
    if (db[name]) throw new Error(`Table '${name}' already exists`);
    db[name] = { columns, rows: [] };
    return { type: 'ddl', message: `Table '${name}' created with columns: ${columns.join(', ')}`, table: name, columns };
  }

  // ── INSERT ──────────────────────────────────────────────────────────────────
  function execInsert(tokens, sql) {
    if (upper(tokens[1]) !== 'INTO') throw new Error('Expected INTO after INSERT');
    const name = tokens[2].toLowerCase();
    const tbl = getTable(name);

    // Check if explicit column list is provided: INSERT INTO t (c1, c2) VALUES ...
    const colListMatch = sql.match(/INTO\s+\w+\s*\(([^)]+)\)\s*VALUES/i);
    let insertCols; // array of column names in insert order (original case)
    if (colListMatch) {
      const specifiedCols = colListMatch[1].split(',').map(s => s.trim());
      // Map specified names to actual table column names (case-insensitive)
      insertCols = specifiedCols.map(sc => {
        const found = tbl.columns.find(tc => tc.toLowerCase() === sc.toLowerCase());
        return found || sc;
      });
    } else {
      // No column list → positional, use table column order
      insertCols = tbl.columns;
    }

    // Extract VALUES section — everything after VALUES keyword
    const valuesKeywordIdx = sql.toUpperCase().indexOf('VALUES');
    if (valuesKeywordIdx < 0) throw new Error('Missing VALUES keyword');
    const valuesSection = sql.slice(valuesKeywordIdx + 6);

    // Parse all value groups (handles multiple rows)
    const valueGroups = parseAllValueGroups(valuesSection);
    if (!valueGroups.length) throw new Error('No VALUES found');

    const highlightRows = [];
    valueGroups.forEach(vals => {
      // Build row in table column order
      const row = tbl.columns.map((col, ci) => {
        const insertIdx = insertCols.findIndex(ic => ic.toLowerCase() === col.toLowerCase());
        if (insertIdx >= 0 && insertIdx < vals.length) {
          return vals[insertIdx];
        }
        return null;
      });
      tbl.rows.push(row);
      highlightRows.push(tbl.rows.length - 1);
    });

    return {
      type: 'dml',
      message: `${valueGroups.length} row(s) inserted into '${name}'`,
      table: name,
      columns: tbl.columns,
      rows: tbl.rows,
      highlightRows
    };
  }

  // ── SELECT ──────────────────────────────────────────────────────────────────
  function execSelect(tokens, sql) {
    const sqlU = sql.toUpperCase();

    // Detect JOIN
    if (sqlU.includes(' JOIN ')) return execJoin(tokens, sql);

    // FROM table
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (!fromMatch) throw new Error('Missing FROM clause');
    const name = fromMatch[1].toLowerCase();
    const tbl = getTable(name);

    // SELECT columns
    const selectPart = sql.match(/SELECT\s+(.*?)\s+FROM/i)?.[1] || '*';
    const selectCols = selectPart.trim() === '*'
      ? tbl.columns
      : selectPart.split(',').map(s => s.trim().replace(/.*\s+AS\s+/i, '').trim());

    // WHERE
    let rows = tbl.rows.map((r, i) => ({ row: r, idx: i }));
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i);
    const highlightRows = [];
    if (whereMatch) {
      rows = rows.filter(({ row, idx }) => {
        const pass = evalWhere(whereMatch[1], tbl.columns, row);
        if (pass) highlightRows.push(idx);
        return pass;
      });
    }

    // GROUP BY
    const groupMatch = sql.match(/GROUP\s+BY\s+(\w+)/i);
    let resultRows = rows.map(r => r.row);
    let resultCols = tbl.columns;

    if (groupMatch) {
      const groupCol = groupMatch[1].toLowerCase();
      const groupIdx = tbl.columns.findIndex(c => c.toLowerCase() === groupCol);
      const groups = {};
      rows.forEach(({ row }) => {
        const key = row[groupIdx];
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      // Build aggregate columns from SELECT
      const aggCols = selectPart.split(',').map(s => s.trim());
      resultCols = aggCols.map(c => c.replace(/\(.*\)/, '').trim() + (c.includes('(') ? `(${c.match(/\(([^)]+)\)/)?.[1] || ''})` : ''));
      resultRows = Object.entries(groups).map(([key, groupRows]) => {
        return aggCols.map(col => {
          const colU = col.toUpperCase();
          if (colU.startsWith('COUNT')) return groupRows.length;
          if (colU.startsWith('SUM')) {
            const c = col.match(/\((\w+)\)/)?.[1];
            const ci = tbl.columns.findIndex(x => x.toLowerCase() === c?.toLowerCase());
            return groupRows.reduce((s, r) => s + (parseFloat(r[ci]) || 0), 0);
          }
          if (colU.startsWith('AVG')) {
            const c = col.match(/\((\w+)\)/)?.[1];
            const ci = tbl.columns.findIndex(x => x.toLowerCase() === c?.toLowerCase());
            const sum = groupRows.reduce((s, r) => s + (parseFloat(r[ci]) || 0), 0);
            return (sum / groupRows.length).toFixed(2);
          }
          if (colU.startsWith('MAX')) {
            const c = col.match(/\((\w+)\)/)?.[1];
            const ci = tbl.columns.findIndex(x => x.toLowerCase() === c?.toLowerCase());
            return Math.max(...groupRows.map(r => parseFloat(r[ci]) || 0));
          }
          if (colU.startsWith('MIN')) {
            const c = col.match(/\((\w+)\)/)?.[1];
            const ci = tbl.columns.findIndex(x => x.toLowerCase() === c?.toLowerCase());
            return Math.min(...groupRows.map(r => parseFloat(r[ci]) || 0));
          }
          // Regular column
          const ci = tbl.columns.findIndex(x => x.toLowerCase() === col.toLowerCase());
          return ci >= 0 ? groupRows[0][ci] : key;
        });
      });
      resultCols = aggCols;
    }

    // ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const orderCol = orderMatch[1].toLowerCase();
      const dir = upper(orderMatch[2]) === 'DESC' ? -1 : 1;
      const ci = resultCols.findIndex(c => c.toLowerCase().includes(orderCol));
      if (ci >= 0) resultRows.sort((a, b) => {
        const av = isNaN(a[ci]) ? a[ci] : parseFloat(a[ci]);
        const bv = isNaN(b[ci]) ? b[ci] : parseFloat(b[ci]);
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    // LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) resultRows = resultRows.slice(0, parseInt(limitMatch[1]));

    // Project columns
    if (selectPart.trim() !== '*' && !groupMatch) {
      const colIndices = selectCols.map(sc => tbl.columns.findIndex(c => c.toLowerCase() === sc.toLowerCase()));
      resultRows = resultRows.map(row => colIndices.map(i => i >= 0 ? row[i] : '?'));
      resultCols = selectCols;
    }

    return {
      type: 'select', message: `${resultRows.length} row(s) returned`,
      table: name, columns: resultCols, rows: resultRows,
      highlightRows: whereMatch ? highlightRows : resultRows.map((_, i) => i),
      sourceTable: { name, columns: tbl.columns, rows: tbl.rows }
    };
  }

  // ── JOIN ────────────────────────────────────────────────────────────────────
  function execJoin(tokens, sql) {
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    const joinMatch = sql.match(/(INNER|LEFT|RIGHT|FULL)?\s*JOIN\s+(\w+)\s+ON\s+(\w+\.\w+)\s*=\s*(\w+\.\w+)/i);
    if (!fromMatch || !joinMatch) throw new Error('Invalid JOIN syntax');

    const t1name = fromMatch[1].toLowerCase();
    const t2name = joinMatch[2].toLowerCase();
    const t1 = getTable(t1name);
    const t2 = getTable(t2name);
    const joinType = upper(joinMatch[1] || 'INNER');

    // Parse ON condition
    const left = joinMatch[3].split('.');
    const right = joinMatch[4].split('.');
    const lTable = left[0].toLowerCase(), lCol = left[1].toLowerCase();
    const rTable = right[0].toLowerCase(), rCol = right[1].toLowerCase();

    const lIdx = (lTable === t1name ? t1 : t2).columns.findIndex(c => c.toLowerCase() === lCol);
    const rIdx = (rTable === t2name ? t2 : t1).columns.findIndex(c => c.toLowerCase() === rCol);

    const resultCols = [...t1.columns.map(c => `${t1name}.${c}`), ...t2.columns.map(c => `${t2name}.${c}`)];
    const resultRows = [];
    const highlightRows = [];

    t1.rows.forEach(r1 => {
      let matched = false;
      t2.rows.forEach(r2 => {
        if (String(r1[lIdx]) === String(r2[rIdx])) {
          resultRows.push([...r1, ...r2]);
          highlightRows.push(resultRows.length - 1);
          matched = true;
        }
      });
      if (!matched && (joinType === 'LEFT' || joinType === 'FULL')) {
        resultRows.push([...r1, ...t2.columns.map(() => 'NULL')]);
      }
    });

    return {
      type: 'join', joinType, message: `${joinType} JOIN: ${resultRows.length} row(s) matched`,
      table: `${t1name} ⋈ ${t2name}`,
      columns: resultCols, rows: resultRows, highlightRows,
      table1: { name: t1name, columns: t1.columns, rows: t1.rows },
      table2: { name: t2name, columns: t2.columns, rows: t2.rows },
    };
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  function execUpdate(tokens, sql) {
    const name = tokens[1].toLowerCase();
    const tbl = getTable(name);
    const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
    if (!setMatch) throw new Error('Missing SET clause');

    const assignments = setMatch[1].split(',').map(s => {
      const [col, val] = s.split('=').map(x => x.trim());
      return { col: col.toLowerCase(), val: stripQuotes(val) };
    });

    const whereMatch = sql.match(/WHERE\s+(.+)$/i);
    const changedCells = [];
    let count = 0;

    tbl.rows.forEach((row, ri) => {
      if (!whereMatch || evalWhere(whereMatch[1], tbl.columns, row)) {
        assignments.forEach(({ col, val }) => {
          const ci = tbl.columns.findIndex(c => c.toLowerCase() === col);
          if (ci >= 0) { row[ci] = val; changedCells.push({ row: ri, col: ci }); }
        });
        count++;
      }
    });

    return { type: 'dml', message: `${count} row(s) updated in '${name}'`, table: name, columns: tbl.columns, rows: tbl.rows, changedCells };
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  function execDelete(tokens, sql) {
    if (upper(tokens[1]) !== 'FROM') throw new Error('Expected FROM after DELETE');
    const name = tokens[2].toLowerCase();
    const tbl = getTable(name);
    const whereMatch = sql.match(/WHERE\s+(.+)$/i);
    const before = tbl.rows.length;
    if (whereMatch) {
      tbl.rows = tbl.rows.filter(row => !evalWhere(whereMatch[1], tbl.columns, row));
    } else {
      tbl.rows = [];
    }
    const deleted = before - tbl.rows.length;
    return { type: 'dml', message: `${deleted} row(s) deleted from '${name}'`, table: name, columns: tbl.columns, rows: tbl.rows };
  }

  // ── DROP ────────────────────────────────────────────────────────────────────
  function execDrop(tokens) {
    if (upper(tokens[1]) !== 'TABLE') throw new Error('Expected TABLE after DROP');
    const name = tokens[2].toLowerCase();
    if (!db[name]) throw new Error(`Table '${name}' does not exist`);
    delete db[name];
    return { type: 'ddl', message: `Table '${name}' dropped` };
  }

  // ── SHOW ────────────────────────────────────────────────────────────────────
  function execShow(tokens) {
    if (upper(tokens[1]) === 'TABLES') {
      const tables = Object.keys(db);
      return { type: 'show', message: `${tables.length} table(s) in database`, tables };
    }
    throw new Error('Unknown SHOW command');
  }

  // ── WHERE evaluator ─────────────────────────────────────────────────────────
  function evalWhere(expr, columns, row) {
    // Handle AND / OR
    if (/\bAND\b/i.test(expr)) {
      return expr.split(/\bAND\b/i).every(part => evalWhere(part.trim(), columns, row));
    }
    if (/\bOR\b/i.test(expr)) {
      return expr.split(/\bOR\b/i).some(part => evalWhere(part.trim(), columns, row));
    }

    // Single condition: col OP value
    const m = expr.match(/(\w+)\s*(>=|<=|!=|<>|=|>|<|LIKE|IN)\s*(.+)/i);
    if (!m) return true;
    const col = m[1].toLowerCase(), op = upper(m[2]), rawVal = m[3].trim();
    const ci = columns.findIndex(c => c.toLowerCase() === col);
    if (ci < 0) return false;
    const cellVal = row[ci];

    if (op === 'LIKE') {
      const pattern = stripQuotes(rawVal).replace(/%/g, '.*').replace(/_/g, '.');
      return new RegExp(`^${pattern}$`, 'i').test(String(cellVal));
    }
    if (op === 'IN') {
      const vals = rawVal.replace(/[()]/g, '').split(',').map(v => stripQuotes(v.trim()));
      return vals.includes(String(cellVal));
    }

    const a = isNaN(cellVal) ? String(cellVal) : parseFloat(cellVal);
    const b = isNaN(rawVal) ? stripQuotes(rawVal) : parseFloat(rawVal);
    switch (op) {
      case '=':  return a == b;
      case '!=': case '<>': return a != b;
      case '>':  return a > b;
      case '<':  return a < b;
      case '>=': return a >= b;
      case '<=': return a <= b;
    }
    return false;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function getTable(name) {
    if (!db[name]) throw new Error(`Table '${name}' does not exist. Use CREATE TABLE first.`);
    return db[name];
  }

  function stripQuotes(val) {
    if (val === undefined || val === null) return val;
    const s = String(val).trim();
    if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
      return s.slice(1, -1);
    }
    return s;
  }

  // Split a comma-separated string but respect nested parens
  function splitByComma(str) {
    const parts = [];
    let depth = 0, current = '';
    for (const ch of str) {
      if (ch === '(') { depth++; current += ch; }
      else if (ch === ')') { depth--; current += ch; }
      else if (ch === ',' && depth === 0) { parts.push(current); current = ''; }
      else { current += ch; }
    }
    if (current.trim()) parts.push(current);
    return parts;
  }

  // Parse all (val, val, ...) groups from a VALUES section
  function parseAllValueGroups(valuesSection) {
    const groups = [];
    let i = 0;
    const s = valuesSection.trim();
    while (i < s.length) {
      if (s[i] === '(') {
        // Find matching closing paren, respecting quoted strings
        let j = i + 1, depth = 1, inStr = false, strChar = '';
        while (j < s.length && depth > 0) {
          const c = s[j];
          if (inStr) {
            if (c === strChar && s[j-1] !== '\\') inStr = false;
          } else if (c === "'" || c === '"') {
            inStr = true; strChar = c;
          } else if (c === '(') depth++;
          else if (c === ')') depth--;
          j++;
        }
        const inner = s.slice(i + 1, j - 1);
        groups.push(parseValueList(inner));
        i = j;
      } else {
        i++;
      }
    }
    return groups;
  }

  // Parse a single value list: 1, 'hello', NULL, 3.14
  function parseValueList(str) {
    const vals = [];
    let current = '', inStr = false, strChar = '';
    for (let i = 0; i <= str.length; i++) {
      const c = i < str.length ? str[i] : ','; // sentinel comma at end
      if (inStr) {
        if (c === strChar) { inStr = false; current += c; }
        else { current += c; }
      } else if (c === "'" || c === '"') {
        inStr = true; strChar = c; current += c;
      } else if (c === ',') {
        const v = current.trim();
        if (v.toUpperCase() === 'NULL') vals.push(null);
        else vals.push(stripQuotes(v));
        current = '';
      } else {
        current += c;
      }
    }
    return vals;
  }

  function getTables() { return db; }
  function getHistory() { return history; }
  function reset() { Object.keys(db).forEach(k => delete db[k]); history.length = 0; }

  return { execute, getTables, getHistory, reset };
})();
