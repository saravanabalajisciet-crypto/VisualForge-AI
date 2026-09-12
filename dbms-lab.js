/**
 * VisualForge AI — DBMS Live SQL Engineering Lab
 * Pre-loaded sample DB, live execution, query visualization, AI explanation,
 * flashcards, and practice test. Integrates with existing SQLEngine.
 */
const DBMSLab = (() => {

  // ─── Sample Database Schema & Seed Data ────────────────────────────────────
  const SEED_SQL = `
CREATE TABLE students (id INT, name VARCHAR, age INT, grade VARCHAR, dept_id INT);
INSERT INTO students VALUES (1, 'Arjun', 20, 'A', 1);
INSERT INTO students VALUES (2, 'Priya', 21, 'B', 2);
INSERT INTO students VALUES (3, 'Karthik', 19, 'A', 1);
INSERT INTO students VALUES (4, 'Divya', 22, 'C', 3);
INSERT INTO students VALUES (5, 'Rahul', 20, 'B', 2);
INSERT INTO students VALUES (6, 'Sneha', 23, 'A', 3);
INSERT INTO students VALUES (7, 'Vikram', 21, 'D', 1);
INSERT INTO students VALUES (8, 'Ananya', 19, 'B', 2);

CREATE TABLE departments (dept_id INT, dept_name VARCHAR, hod VARCHAR, budget INT);
INSERT INTO departments VALUES (1, 'Computer Science', 'Dr. Sharma', 500000);
INSERT INTO departments VALUES (2, 'Electronics', 'Dr. Patel', 350000);
INSERT INTO departments VALUES (3, 'Mechanical', 'Dr. Rao', 400000);
INSERT INTO departments VALUES (4, 'Civil', 'Dr. Nair', 300000);

CREATE TABLE courses (course_id INT, course_name VARCHAR, credits INT, dept_id INT);
INSERT INTO courses VALUES (101, 'Data Structures', 4, 1);
INSERT INTO courses VALUES (102, 'Database Systems', 3, 1);
INSERT INTO courses VALUES (103, 'Digital Circuits', 4, 2);
INSERT INTO courses VALUES (104, 'Thermodynamics', 3, 3);
INSERT INTO courses VALUES (105, 'Machine Learning', 4, 1);

CREATE TABLE enrollments (student_id INT, course_id INT, marks INT, semester INT);
INSERT INTO enrollments VALUES (1, 101, 92, 1);
INSERT INTO enrollments VALUES (1, 102, 88, 2);
INSERT INTO enrollments VALUES (2, 103, 78, 1);
INSERT INTO enrollments VALUES (3, 101, 95, 1);
INSERT INTO enrollments VALUES (3, 105, 91, 3);
INSERT INTO enrollments VALUES (4, 104, 65, 2);
INSERT INTO enrollments VALUES (5, 103, 82, 1);
INSERT INTO enrollments VALUES (5, 102, 77, 2);
INSERT INTO enrollments VALUES (6, 105, 90, 3);
INSERT INTO enrollments VALUES (7, 101, 55, 1);

CREATE TABLE employees (emp_id INT, name VARCHAR, dept_id INT, salary INT, role VARCHAR);
INSERT INTO employees VALUES (1, 'Dr. Sharma', 1, 95000, 'HOD');
INSERT INTO employees VALUES (2, 'Dr. Patel', 2, 90000, 'HOD');
INSERT INTO employees VALUES (3, 'Dr. Rao', 3, 88000, 'HOD');
INSERT INTO employees VALUES (4, 'Prof. Kumar', 1, 72000, 'Professor');
INSERT INTO employees VALUES (5, 'Prof. Mehta', 2, 68000, 'Professor');
INSERT INTO employees VALUES (6, 'Dr. Singh', 1, 75000, 'Assoc. Professor');
INSERT INTO employees VALUES (7, 'Dr. Nair', 4, 85000, 'HOD');
INSERT INTO employees VALUES (8, 'Prof. Joshi', 3, 65000, 'Assistant Professor');

CREATE TABLE orders (order_id INT, product VARCHAR, amount INT, customer VARCHAR, status VARCHAR);
INSERT INTO orders VALUES (1, 'Laptop', 75000, 'Arjun', 'Delivered');
INSERT INTO orders VALUES (2, 'Phone', 25000, 'Priya', 'Shipped');
INSERT INTO orders VALUES (3, 'Tablet', 35000, 'Karthik', 'Pending');
INSERT INTO orders VALUES (4, 'Monitor', 18000, 'Divya', 'Delivered');
INSERT INTO orders VALUES (5, 'Keyboard', 3500, 'Rahul', 'Delivered');
INSERT INTO orders VALUES (6, 'Mouse', 1200, 'Sneha', 'Cancelled');
INSERT INTO orders VALUES (7, 'Headset', 5500, 'Arjun', 'Shipped');
INSERT INTO orders VALUES (8, 'Webcam', 4200, 'Priya', 'Pending');
`;

  // ─── Example Query Templates ────────────────────────────────────────────────
  const QUERY_EXAMPLES = [
    {
      label: 'SELECT All',
      category: 'Basic',
      sql: 'SELECT * FROM students;',
      desc: 'Retrieve every row and column from the students table',
    },
    {
      label: 'SELECT Columns',
      category: 'Basic',
      sql: 'SELECT name, age, grade FROM students;',
      desc: 'Retrieve only specific columns',
    },
    {
      label: 'WHERE Filter',
      category: 'Filter',
      sql: "SELECT * FROM students WHERE grade = 'A';",
      desc: 'Filter rows matching a condition',
    },
    {
      label: 'WHERE age > 20',
      category: 'Filter',
      sql: 'SELECT name, age FROM students WHERE age > 20;',
      desc: 'Filter with numeric comparison',
    },
    {
      label: 'ORDER BY',
      category: 'Sort',
      sql: 'SELECT name, age, grade FROM students ORDER BY age DESC;',
      desc: 'Sort results by a column',
    },
    {
      label: 'COUNT + GROUP BY',
      category: 'Aggregate',
      sql: 'SELECT grade, COUNT(id) FROM students GROUP BY grade;',
      desc: 'Count students per grade',
    },
    {
      label: 'AVG Salary',
      category: 'Aggregate',
      sql: 'SELECT role, AVG(salary) FROM employees GROUP BY role;',
      desc: 'Average salary by role',
    },
    {
      label: 'INNER JOIN',
      category: 'Join',
      sql: 'SELECT * FROM students INNER JOIN departments ON students.dept_id = departments.dept_id;',
      desc: 'Combine students with their department info',
    },
    {
      label: 'LEFT JOIN',
      category: 'Join',
      sql: 'SELECT * FROM students LEFT JOIN enrollments ON students.id = enrollments.student_id;',
      desc: 'All students, with enrollment data where available',
    },
    {
      label: 'UPDATE',
      category: 'Modify',
      sql: "UPDATE students SET grade = 'A+' WHERE name = 'Arjun';",
      desc: 'Update a specific row',
    },
    {
      label: 'DELETE',
      category: 'Modify',
      sql: "DELETE FROM students WHERE grade = 'D';",
      desc: 'Remove rows matching condition',
    },
    {
      label: 'SHOW TABLES',
      category: 'Meta',
      sql: 'SHOW TABLES;',
      desc: 'List all tables in the database',
    },
  ];

  // ─── Flashcards ─────────────────────────────────────────────────────────────
  const FLASHCARDS = [
    { front: 'What does SELECT do?', back: 'SELECT retrieves data from one or more tables. You specify which columns to return (or * for all). It does NOT modify data — it is a read-only operation. Example: SELECT name, age FROM students;' },
    { front: 'What does WHERE do?', back: 'WHERE filters rows based on a condition. Only rows satisfying the condition are included in the result. Example: WHERE age > 20 returns only rows where the age column value is greater than 20.' },
    { front: 'What is an INNER JOIN?', back: 'INNER JOIN combines rows from two tables where a matching key exists in BOTH tables. Rows with no match in either table are excluded. It is the most common type of join.' },
    { front: 'What is a LEFT JOIN?', back: 'LEFT JOIN returns ALL rows from the left (first) table, plus matched rows from the right table. If there is no match in the right table, NULL values fill those columns. No left-table rows are dropped.' },
    { front: 'What does GROUP BY do?', back: 'GROUP BY groups rows sharing the same value in a column, then applies aggregate functions (COUNT, SUM, AVG, MAX, MIN) to each group. Example: GROUP BY grade counts how many students have each grade.' },
    { front: 'What does ORDER BY do?', back: 'ORDER BY sorts the result set by one or more columns. Use ASC for ascending order (default) or DESC for descending. Example: ORDER BY age DESC lists oldest students first.' },
    { front: 'What is a PRIMARY KEY?', back: 'A primary key uniquely identifies each row in a table. It must be unique and NOT NULL. A table can have only one primary key. Example: id INT PRIMARY KEY ensures no two students share an id.' },
    { front: 'What does COUNT() do?', back: 'COUNT() is an aggregate function that counts the number of rows (or non-NULL values in a column). COUNT(*) counts all rows including NULLs. COUNT(column) counts only non-NULL values in that column.' },
    { front: 'What is the difference between WHERE and HAVING?', back: 'WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER GROUP BY has been applied. You cannot use aggregate functions (like COUNT, AVG) in a WHERE clause — use HAVING instead.' },
    { front: 'What does UPDATE do?', back: 'UPDATE modifies existing rows in a table. Always use a WHERE clause to specify which rows to update — without WHERE, ALL rows are updated! Example: UPDATE students SET grade="A" WHERE id=1;' },
    { front: 'What is normalization?', back: 'Normalization is the process of organizing a database to reduce redundancy and improve data integrity. The normal forms (1NF, 2NF, 3NF, BCNF) progressively eliminate different types of data anomalies.' },
    { front: 'What is a FOREIGN KEY?', back: 'A foreign key is a column (or set of columns) in one table that references the primary key of another table. It enforces referential integrity — you cannot insert a foreign key value that does not exist in the referenced table.' },
    { front: 'What does AVG() return?', back: 'AVG() returns the arithmetic mean (average) of numeric values in a column. It ignores NULL values. Example: SELECT AVG(salary) FROM employees; returns the average salary across all employee rows.' },
    { front: 'What is a NULL value in SQL?', back: 'NULL represents the absence of a value — it is not zero, not an empty string, but truly unknown or missing. NULL comparisons behave specially: NULL = NULL is FALSE. Use IS NULL or IS NOT NULL to check for NULL values.' },
  ];

  // ─── Practice Test Questions ─────────────────────────────────────────────────
  const PRACTICE_QUESTIONS = [
    {
      question: 'Which SQL clause is used to filter rows AFTER GROUP BY?',
      options: ['WHERE', 'FILTER', 'HAVING', 'ORDER BY'],
      answer: 2,
      explanation: 'HAVING filters groups after GROUP BY. WHERE filters individual rows before grouping. Example: SELECT grade, COUNT(*) FROM students GROUP BY grade HAVING COUNT(*) > 2;',
    },
    {
      question: 'What does SELECT * FROM students WHERE age > 20 return?',
      options: [
        'All columns for students whose age is exactly 20',
        'All columns for students whose age is greater than 20',
        'Only the age column for all students',
        'The first 20 student rows',
      ],
      answer: 1,
      explanation: 'SELECT * retrieves all columns. WHERE age > 20 keeps only rows where the age value is strictly greater than 20 (not 20 itself). The > operator is exclusive.',
    },
    {
      question: 'Which JOIN type returns ALL rows from the LEFT table even if there is no match in the right table?',
      options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
      answer: 2,
      explanation: 'LEFT JOIN (also called LEFT OUTER JOIN) keeps all rows from the left table. For right-table columns where no match exists, NULL values are placed. INNER JOIN discards unmatched rows from both sides.',
    },
    {
      question: 'What happens if you run UPDATE students SET grade = "A" without a WHERE clause?',
      options: [
        'Nothing happens',
        'Only the first row is updated',
        'ALL rows in the students table get grade = "A"',
        'An error is thrown',
      ],
      answer: 2,
      explanation: 'Without a WHERE clause, UPDATE affects every single row in the table. This is a common and dangerous mistake. Always use WHERE to target specific rows when updating.',
    },
    {
      question: 'Which aggregate function returns the number of rows in a group?',
      options: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'],
      answer: 2,
      explanation: 'COUNT() counts the number of rows (or non-NULL values). Use COUNT(*) to count all rows including NULLs. Use COUNT(column) to count non-NULL values in a specific column.',
    },
    {
      question: 'What does an INNER JOIN between "students" and "departments" ON students.dept_id = departments.dept_id produce?',
      options: [
        'All students, with NULL for students with no department',
        'All departments, even those with no students',
        'Only students whose dept_id matches a dept_id in departments',
        'A Cartesian product of both tables',
      ],
      answer: 2,
      explanation: 'INNER JOIN returns only rows where the join condition is true in BOTH tables. Students with a dept_id that does not exist in departments are excluded, and departments with no students are also excluded.',
    },
    {
      question: 'Which SQL statement is used to remove rows that match a condition from a table?',
      options: ['DROP', 'REMOVE', 'DELETE', 'TRUNCATE'],
      answer: 2,
      explanation: 'DELETE FROM table WHERE condition removes specific rows matching the condition. DROP removes the entire table structure. TRUNCATE removes all rows but keeps the table. REMOVE is not standard SQL.',
    },
    {
      question: 'Given SELECT grade, COUNT(id) FROM students GROUP BY grade — what does each row in the result represent?',
      options: [
        'One individual student',
        'One unique grade value and the count of students with that grade',
        'The total count of all students',
        'The id of each student grouped alphabetically',
      ],
      answer: 1,
      explanation: 'GROUP BY grade groups all students sharing the same grade together. COUNT(id) counts how many students are in each group. Each result row represents one distinct grade value and its student count.',
    },
  ];

  // ─── Lab State ──────────────────────────────────────────────────────────────
  const LabState = {
    isDBSeeded: false,
    queryHistory: [],
    flashcardIndex: 0,
    flashcardFlipped: false,
    lastResult: null,
    aiLoading: false,
    aiAbortController: null,
  };

  let testStarted = false;
  let currentQIndex = 0;
  let testAnswers = [];

  // ─── DOM helpers ────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Open / Close ───────────────────────────────────────────────────────────
  function open() {
    $('dbmsLabModal').classList.remove('hidden');
    $('dbmsLabBackdrop').classList.remove('hidden');
    if (!LabState.isDBSeeded) seedDatabase();
    renderExampleChips();
    updateDbInfoBadge();
  }

  function close() {
    $('dbmsLabModal').classList.add('hidden');
    $('dbmsLabBackdrop').classList.add('hidden');
  }

  // ─── Seed Database ──────────────────────────────────────────────────────────
  function seedDatabase() {
    // Use the existing SQLEngine but reset first
    SQLEngine.reset();
    SQLEngine.execute(SEED_SQL);
    LabState.isDBSeeded = true;
    updateDbInfoBadge();
    const statusEl = $('dbmsLabSeedStatus');
    if (statusEl) {
      statusEl.innerHTML = '✓ Sample DB loaded: students · departments · courses · enrollments · employees · orders';
      statusEl.style.color = 'var(--green)';
    }
  }

  function resetDatabase() {
    seedDatabase();
    // Clear editor and output
    const editor = $('dbmsLabEditor');
    if (editor) editor.value = '';
    const output = $('dbmsLabOutput');
    if (output) output.innerHTML = '<div class="dbms-output-empty">Database reset. Write a query and click Run.</div>';
    const viz = $('dbmsVizPanel');
    if (viz) viz.innerHTML = '<div class="dbms-viz-empty">Query visualization will appear here</div>';
    const aiPanel = $('dbmsAiPanel');
    if (aiPanel) aiPanel.classList.add('hidden');
    updateDbInfoBadge();
    showLabToast('Database reset to sample data ✓', 'success');
  }

  // ─── Tab Switch ─────────────────────────────────────────────────────────────
  function switchTab(tab) {
    document.querySelectorAll('.dbms-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dbms-tab-panel').forEach(p => p.classList.add('hidden'));
    const btn = document.querySelector(`.dbms-tab-btn[data-tab="${tab}"]`);
    const panel = $(`dbmsTab_${tab}`);
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.remove('hidden');
    if (tab === 'schema') renderSchemaPanel();
    if (tab === 'flashcards') renderFlashcard();
    if (tab === 'test') renderTestQuestion();
  }

  // ─── Render Schema Panel ────────────────────────────────────────────────────
  function renderSchemaPanel() {
    const el = $('dbmsSchemaPanel');
    if (!el) return;
    const tables = SQLEngine.getTables();
    if (!Object.keys(tables).length) {
      el.innerHTML = '<div class="dbms-schema-empty">No tables loaded.</div>';
      return;
    }
    el.innerHTML = Object.entries(tables).map(([name, tbl]) => `
      <div class="dbms-schema-table">
        <div class="dbms-schema-name">
          <span class="dbms-schema-icon">▶</span>
          <b>${escHtml(name)}</b>
          <span class="dbms-schema-count">${tbl.rows.length} rows</span>
        </div>
        <div class="dbms-schema-cols">
          ${tbl.columns.map(c => `<span class="dbms-schema-col">${escHtml(c)}</span>`).join('')}
        </div>
        <div class="dbms-schema-preview">
          <table class="dbms-preview-table">
            <thead><tr>${tbl.columns.map(c => `<th>${escHtml(c)}</th>`).join('')}</tr></thead>
            <tbody>
              ${tbl.rows.slice(0, 3).map(row => `<tr>${row.map(cell => `<td>${escHtml(String(cell ?? 'NULL'))}</td>`).join('')}</tr>`).join('')}
              ${tbl.rows.length > 3 ? `<tr><td colspan="${tbl.columns.length}" class="dbms-preview-more">... ${tbl.rows.length - 3} more rows</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>`).join('');
  }

  // ─── Render Example Chips ───────────────────────────────────────────────────
  function renderExampleChips() {
    const container = $('dbmsExampleChips');
    if (!container) return;
    // Group by category
    const categories = [...new Set(QUERY_EXAMPLES.map(q => q.category))];
    container.innerHTML = categories.map(cat => `
      <div class="dbms-chip-group">
        <span class="dbms-chip-cat">${cat}</span>
        ${QUERY_EXAMPLES.filter(q => q.category === cat).map((q, i) => `
          <button class="dbms-chip" onclick="DBMSLab.loadExample(${QUERY_EXAMPLES.indexOf(q)})" title="${escHtml(q.desc)}">
            ${escHtml(q.label)}
          </button>`).join('')}
      </div>`).join('');
  }

  function loadExample(idx) {
    const q = QUERY_EXAMPLES[idx];
    if (!q) return;
    const editor = $('dbmsLabEditor');
    if (editor) {
      editor.value = q.sql;
      editor.focus();
    }
    runQuery(q.sql);
  }

  // ─── Update DB Info Badge ───────────────────────────────────────────────────
  function updateDbInfoBadge() {
    const el = $('dbmsLabDbInfo');
    if (!el) return;
    const tables = SQLEngine.getTables();
    const names = Object.keys(tables);
    if (!names.length) { el.textContent = 'DB: empty'; return; }
    el.textContent = `${names.length} tables · ${names.map(n => tables[n].rows.length).reduce((a,b)=>a+b,0)} total rows`;
  }

  // ─── Run Query ──────────────────────────────────────────────────────────────
  function runQuery(sqlOverride) {
    const editor = $('dbmsLabEditor');
    const sql = sqlOverride || (editor ? editor.value.trim() : '');
    if (!sql) return;

    // Ensure DB is seeded
    if (!LabState.isDBSeeded) seedDatabase();

    // Reset to seed before running to prevent drift from repeated runs
    // But only reset if we're running fresh — if user just added data, keep it
    // Strategy: re-seed only if an error happens from table-not-found
    SQLEngine.reset();
    SQLEngine.execute(SEED_SQL);

    const results = SQLEngine.execute(sql);
    LabState.lastResult = { sql, results };

    // Add to history
    const hasError = results.some(r => r.error);
    LabState.queryHistory.unshift({ sql, ok: !hasError, ts: Date.now() });
    if (LabState.queryHistory.length > 20) LabState.queryHistory.pop();
    renderQueryHistory();

    // Render output
    renderQueryOutput(results);

    // Render visualization
    renderQueryVisualization(sql, results);

    // Update DB info
    updateDbInfoBadge();

    // Trigger AI explanation
    const apiKey = localStorage.getItem('vf_api_key');
    if (apiKey) {
      fetchAiExplanation(sql, results);
    }
  }

  // ─── Render Query Output ─────────────────────────────────────────────────────
  function renderQueryOutput(results) {
    const output = $('dbmsLabOutput');
    if (!output) return;

    if (!results || !results.length) {
      output.innerHTML = '<div class="dbms-output-empty">No results</div>';
      return;
    }

    output.innerHTML = results.map(r => {
      if (r.error) {
        return `<div class="dbms-result-block">
          <div class="dbms-result-badge err">✗ Error</div>
          <div class="dbms-err-msg">${escHtml(r.error)}</div>
          <div class="dbms-err-sql">${escHtml(r.sql || '')}</div>
          <div class="dbms-err-hint">💡 Check spelling, table names, and syntax. Use SHOW TABLES to see available tables.</div>
        </div>`;
      }

      if (r.type === 'ddl') {
        return `<div class="dbms-result-block">
          <div class="dbms-result-badge ok">✓ Success</div>
          <div class="dbms-result-msg">${escHtml(r.message)}</div>
          ${r.columns ? `<div class="dbms-col-preview">Columns: ${r.columns.map(c => `<span class="dbms-col-chip">${escHtml(c)}</span>`).join('')}</div>` : ''}
        </div>`;
      }

      if (r.type === 'show') {
        const tables = SQLEngine.getTables();
        let html = `<div class="dbms-result-block">
          <div class="dbms-result-badge info">ℹ ${escHtml(r.message)}</div>`;
        (r.tables || []).forEach(tname => {
          const t = tables[tname];
          html += `<div class="dbms-tbl-label">▶ <b>${escHtml(tname)}</b> — ${t ? t.rows.length : 0} row(s)</div>`;
          if (t) html += renderResultTable(t.columns, t.rows.slice(0,3), [], []);
        });
        html += `</div>`;
        return html;
      }

      if (r.type === 'join') {
        return `<div class="dbms-result-block">
          <div class="dbms-result-badge ok">✓ ${escHtml(r.message)}</div>
          <div class="dbms-tbl-label">Table 1: <b>${escHtml(r.table1?.name || '')}</b></div>
          ${renderResultTable(r.table1?.columns||[], r.table1?.rows||[], [], [])}
          <div class="dbms-tbl-label">Table 2: <b>${escHtml(r.table2?.name || '')}</b></div>
          ${renderResultTable(r.table2?.columns||[], r.table2?.rows||[], [], [])}
          <div class="dbms-tbl-label join-label">⋈ ${escHtml(r.joinType)} JOIN Result — ${r.rows.length} row(s)</div>
          ${renderResultTable(r.columns, r.rows, r.highlightRows||[], [])}
        </div>`;
      }

      if (r.type === 'select') {
        let html = `<div class="dbms-result-block">
          <div class="dbms-result-badge ok">✓ ${escHtml(r.message)}</div>`;
        if (r.sourceTable && r.sourceTable.rows.length > r.rows.length) {
          html += `<div class="dbms-tbl-label">Source: <b>${escHtml(r.sourceTable.name)}</b> (${r.sourceTable.rows.length} rows total — highlighted = matched)</div>`;
          html += renderResultTable(r.sourceTable.columns, r.sourceTable.rows, r.highlightRows||[], []);
          html += `<div class="dbms-tbl-label" style="color:var(--green)">→ Filtered Result (${r.rows.length} rows)</div>`;
        }
        html += renderResultTable(r.columns, r.rows, r.rows.map((_,i)=>i), []);
        html += `</div>`;
        return html;
      }

      if (r.type === 'dml') {
        let html = `<div class="dbms-result-block">
          <div class="dbms-result-badge ok">✓ ${escHtml(r.message)}</div>`;
        if (r.rows?.length) {
          html += `<div class="dbms-tbl-label">Current state of <b>${escHtml(r.table)}</b></div>`;
          html += renderResultTable(r.columns, r.rows, r.highlightRows||[], r.changedCells||[]);
        }
        html += `</div>`;
        return html;
      }

      return '';
    }).join('');
  }

  function renderResultTable(columns, rows, highlightRows, changedCells) {
    if (!columns?.length) return '';
    let html = `<div class="dbms-tbl-wrap"><table class="dbms-result-table"><thead><tr>`;
    columns.forEach(c => { html += `<th>${escHtml(String(c))}</th>`; });
    html += `</tr></thead><tbody>`;
    if (!rows?.length) {
      html += `<tr><td colspan="${columns.length}" class="dbms-no-rows">No rows returned</td></tr>`;
    } else {
      rows.forEach((row, ri) => {
        const isHL = highlightRows.includes(ri);
        html += `<tr class="${isHL ? 'hl' : ''}">`;
        row.forEach((cell, ci) => {
          const isChanged = changedCells.some(c => c.row === ri && c.col === ci);
          html += `<td class="${isChanged ? 'changed' : ''}">${escHtml(String(cell ?? 'NULL'))}</td>`;
        });
        html += `</tr>`;
      });
    }
    html += `</tbody></table></div>`;
    return html;
  }

  // ─── Query Visualization ────────────────────────────────────────────────────
  function renderQueryVisualization(sql, results) {
    const el = $('dbmsVizPanel');
    if (!el) return;

    const sqlU = sql.toUpperCase().trim();
    const hasError = results.some(r => r.error);
    if (hasError) {
      el.innerHTML = buildVizError(results.find(r => r.error));
      return;
    }

    // Determine operation type for visualization
    if (sqlU.startsWith('SELECT') && sqlU.includes('JOIN')) {
      el.innerHTML = buildJoinViz(sql, results);
    } else if (sqlU.startsWith('SELECT') && sqlU.includes('GROUP BY')) {
      el.innerHTML = buildGroupByViz(sql, results);
    } else if (sqlU.startsWith('SELECT') && sqlU.includes('WHERE')) {
      el.innerHTML = buildWhereViz(sql, results);
    } else if (sqlU.startsWith('SELECT')) {
      el.innerHTML = buildSelectViz(sql, results);
    } else if (sqlU.startsWith('UPDATE')) {
      el.innerHTML = buildUpdateViz(sql, results);
    } else if (sqlU.startsWith('DELETE')) {
      el.innerHTML = buildDeleteViz(sql, results);
    } else if (sqlU.startsWith('INSERT')) {
      el.innerHTML = buildInsertViz(sql, results);
    } else if (sqlU.startsWith('CREATE')) {
      el.innerHTML = buildCreateViz(sql, results);
    } else if (sqlU.startsWith('SHOW')) {
      el.innerHTML = buildShowViz(results);
    } else {
      el.innerHTML = `<div class="dbms-viz-generic"><span class="dbms-viz-icon">✓</span><span>${escHtml(results[0]?.message || 'Query executed.')}</span></div>`;
    }
  }

  function buildSelectViz(sql, results) {
    const r = results[0];
    const cols = r?.columns || [];
    const rowCount = r?.rows?.length || 0;
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    const tableName = fromMatch ? fromMatch[1] : '?';
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node table">
            <span class="dvn-icon">🗄️</span>
            <span class="dvn-title">Table</span>
            <span class="dvn-sub">${escHtml(tableName)}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node select">
            <span class="dvn-icon">🔬</span>
            <span class="dvn-title">SELECT</span>
            <span class="dvn-sub">${cols.length} column(s)</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node result">
            <span class="dvn-icon">📋</span>
            <span class="dvn-title">Result</span>
            <span class="dvn-sub">${rowCount} row(s)</span>
          </div>
        </div>
      </div>
      <div class="dbms-viz-cols">
        ${cols.map(c => `<span class="dbms-viz-col-chip">${escHtml(c)}</span>`).join('')}
      </div>`;
  }

  function buildWhereViz(sql, results) {
    const r = results[0];
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/i);
    const cond = whereMatch ? whereMatch[1] : '';
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    const tableName = fromMatch ? fromMatch[1] : '?';
    const sourceRows = r?.sourceTable?.rows?.length || '?';
    const resultRows = r?.rows?.length || 0;
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node table">
            <span class="dvn-icon">🗄️</span>
            <span class="dvn-title">Table</span>
            <span class="dvn-sub">${escHtml(tableName)} · ${sourceRows} rows</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node filter">
            <span class="dvn-icon">🔽</span>
            <span class="dvn-title">WHERE</span>
            <span class="dvn-sub">${escHtml(cond)}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node result">
            <span class="dvn-icon">📋</span>
            <span class="dvn-title">Result</span>
            <span class="dvn-sub">${resultRows} row(s) matched</span>
          </div>
        </div>
      </div>
      <div class="dbms-viz-stat">
        <span class="dbms-viz-stat-item filtered">${sourceRows - resultRows} rows filtered out</span>
        <span class="dbms-viz-stat-item kept">${resultRows} rows kept</span>
      </div>`;
  }

  function buildJoinViz(sql, results) {
    const r = results[0];
    const joinTypeMatch = sql.match(/(INNER|LEFT|RIGHT|FULL)?\s*JOIN/i);
    const joinType = joinTypeMatch ? (joinTypeMatch[1] || 'INNER').toUpperCase() : 'INNER';
    const t1 = r?.table1?.name || 'Table 1';
    const t2 = r?.table2?.name || 'Table 2';
    const onMatch = sql.match(/ON\s+(.+?)(?:\s+WHERE|\s+ORDER|$)/i);
    const onCond = onMatch ? onMatch[1] : '';
    const resultRows = r?.rows?.length || 0;
    const joinIcons = { INNER: '⋈', LEFT: '⟕', RIGHT: '⟖', FULL: '⟗' };
    return `
      <div class="dbms-viz-join-flow">
        <div class="dbms-viz-node table-a">
          <span class="dvn-icon">🗄️</span>
          <span class="dvn-title">${escHtml(t1)}</span>
          <span class="dvn-sub">${r?.table1?.rows?.length || 0} rows</span>
        </div>
        <div class="dbms-viz-join-center">
          <div class="dbms-viz-join-icon">${joinIcons[joinType] || '⋈'}</div>
          <div class="dbms-viz-join-type">${escHtml(joinType)} JOIN</div>
          <div class="dbms-viz-join-on">ON ${escHtml(onCond)}</div>
        </div>
        <div class="dbms-viz-node table-b">
          <span class="dvn-icon">🗄️</span>
          <span class="dvn-title">${escHtml(t2)}</span>
          <span class="dvn-sub">${r?.table2?.rows?.length || 0} rows</span>
        </div>
      </div>
      <div class="dbms-viz-arrow-down">↓</div>
      <div class="dbms-viz-node result-wide">
        <span class="dvn-icon">📋</span>
        <span class="dvn-title">Joined Result</span>
        <span class="dvn-sub">${resultRows} row(s) · ${r?.columns?.length || 0} columns</span>
      </div>`;
  }

  function buildGroupByViz(sql, results) {
    const r = results[0];
    const groupMatch = sql.match(/GROUP\s+BY\s+(\w+)/i);
    const groupCol = groupMatch ? groupMatch[1] : '?';
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    const tableName = fromMatch ? fromMatch[1] : '?';
    const groups = r?.rows?.length || 0;
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node table">
            <span class="dvn-icon">🗄️</span>
            <span class="dvn-title">Table</span>
            <span class="dvn-sub">${escHtml(tableName)}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node group">
            <span class="dvn-icon">🗂️</span>
            <span class="dvn-title">GROUP BY</span>
            <span class="dvn-sub">${escHtml(groupCol)}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node agg">
            <span class="dvn-icon">📊</span>
            <span class="dvn-title">Aggregate</span>
            <span class="dvn-sub">COUNT / SUM / AVG</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node result">
            <span class="dvn-icon">📋</span>
            <span class="dvn-title">Result</span>
            <span class="dvn-sub">${groups} group(s)</span>
          </div>
        </div>
      </div>
      <div class="dbms-viz-groups">
        ${(r?.rows || []).map(row => `<div class="dbms-viz-group-chip">
          <span class="dvgc-key">${escHtml(String(row[0] ?? 'NULL'))}</span>
          <span class="dvgc-val">${escHtml(String(row[1] ?? ''))}</span>
        </div>`).join('')}
      </div>`;
  }

  function buildUpdateViz(sql, results) {
    const r = results[0];
    const whereMatch = sql.match(/WHERE\s+(.+?)$/i);
    const cond = whereMatch ? whereMatch[1] : 'all rows';
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node table">
            <span class="dvn-icon">🗄️</span>
            <span class="dvn-title">Table</span>
            <span class="dvn-sub">${escHtml(r?.table || '?')}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node filter">
            <span class="dvn-icon">🎯</span>
            <span class="dvn-title">WHERE</span>
            <span class="dvn-sub">${escHtml(cond)}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node update">
            <span class="dvn-icon">✏️</span>
            <span class="dvn-title">UPDATE</span>
            <span class="dvn-sub">${escHtml(r?.message || '')}</span>
          </div>
        </div>
      </div>`;
  }

  function buildDeleteViz(sql, results) {
    const r = results[0];
    const whereMatch = sql.match(/WHERE\s+(.+?)$/i);
    const cond = whereMatch ? whereMatch[1] : 'all rows';
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node table">
            <span class="dvn-icon">🗄️</span>
            <span class="dvn-title">Table</span>
            <span class="dvn-sub">${escHtml(r?.table || '?')}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node filter">
            <span class="dvn-icon">🔽</span>
            <span class="dvn-title">WHERE</span>
            <span class="dvn-sub">${escHtml(cond)}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node delete">
            <span class="dvn-icon">🗑️</span>
            <span class="dvn-title">DELETE</span>
            <span class="dvn-sub">${escHtml(r?.message || '')}</span>
          </div>
        </div>
      </div>`;
  }

  function buildInsertViz(sql, results) {
    const r = results[0];
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node insert">
            <span class="dvn-icon">➕</span>
            <span class="dvn-title">INSERT</span>
            <span class="dvn-sub">New row(s)</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node table">
            <span class="dvn-icon">🗄️</span>
            <span class="dvn-title">Table</span>
            <span class="dvn-sub">${escHtml(r?.table || '?')}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node result">
            <span class="dvn-icon">✓</span>
            <span class="dvn-title">Success</span>
            <span class="dvn-sub">${escHtml(r?.message || '')}</span>
          </div>
        </div>
      </div>`;
  }

  function buildCreateViz(sql, results) {
    const r = results[0];
    return `
      <div class="dbms-viz-flow">
        <div class="dbms-viz-step">
          <div class="dbms-viz-node create">
            <span class="dvn-icon">🏗️</span>
            <span class="dvn-title">CREATE TABLE</span>
            <span class="dvn-sub">${escHtml(r?.table || '?')}</span>
          </div>
        </div>
        <div class="dbms-viz-arrow">→</div>
        <div class="dbms-viz-step">
          <div class="dbms-viz-node result">
            <span class="dvn-icon">✓</span>
            <span class="dvn-title">Table Created</span>
            <span class="dvn-sub">${r?.columns?.length || 0} columns</span>
          </div>
        </div>
      </div>
      ${r?.columns ? `<div class="dbms-viz-cols">${r.columns.map(c=>`<span class="dbms-viz-col-chip">${escHtml(c)}</span>`).join('')}</div>` : ''}`;
  }

  function buildShowViz(results) {
    const r = results[0];
    const tables = r?.tables || [];
    return `
      <div class="dbms-viz-generic">
        <span class="dbms-viz-icon">🗃️</span>
        <div class="dbms-viz-table-list">
          ${tables.map(t => `<span class="dbms-viz-tbl-chip">${escHtml(t)}</span>`).join('')}
        </div>
      </div>`;
  }

  function buildVizError(r) {
    return `
      <div class="dbms-viz-error">
        <span class="dbms-viz-icon">⚠️</span>
        <div>
          <div class="dbms-viz-err-title">Query Error</div>
          <div class="dbms-viz-err-msg">${escHtml(r?.error || 'Unknown error')}</div>
        </div>
      </div>`;
  }

  // ─── AI Explanation ──────────────────────────────────────────────────────────
  async function fetchAiExplanation(sql, results) {
    const panel = $('dbmsAiPanel');
    const content = $('dbmsAiContent');
    if (!panel || !content) return;

    // Don't explain DDL-only or trivial results
    const hasSelect = sql.trim().toUpperCase().startsWith('SELECT');
    const hasModify = /^(UPDATE|DELETE|INSERT)/i.test(sql.trim());
    if (!hasSelect && !hasModify) { panel.classList.add('hidden'); return; }

    panel.classList.remove('hidden');
    content.innerHTML = `<span class="ai-hint-loading">✦ Analyzing query...</span>`;
    LabState.aiLoading = true;

    const resultSummary = results.map(r => {
      if (r.error) return `Error: ${r.error}`;
      if (r.type === 'select') return `SELECT returned ${r.rows?.length} row(s) with columns: ${r.columns?.join(', ')}`;
      if (r.type === 'join') return `${r.joinType} JOIN returned ${r.rows?.length} row(s)`;
      return r.message || '';
    }).join('\n');

    try {
      // Access callGemini from the global app scope
      const prompt = `You are a DBMS tutor for beginners. A student ran this SQL query:

\`\`\`sql
${sql}
\`\`\`

Execution result:
${resultSummary}

In 2-4 clear sentences (no markdown, no bullet points), explain:
1. What this query does step by step
2. Which table(s) were accessed and what condition was applied  
3. What the result means and why it contains those rows

If there was an error, explain what went wrong and suggest the correct syntax.
Be beginner-friendly and specific. Use the actual column names and table names from the query.`;

      const response = await callGemini(prompt);
      content.innerHTML = `<span class="ai-hint-icon">✦</span> ${response.trim().replace(/\n/g, '<br>')}`;
    } catch (err) {
      content.innerHTML = `<span style="color:var(--text3)">AI explanation unavailable. ${err.message}</span>`;
    } finally {
      LabState.aiLoading = false;
    }
  }

  // ─── Query History ───────────────────────────────────────────────────────────
  function renderQueryHistory() {
    const el = $('dbmsQueryHistory');
    if (!el) return;
    el.innerHTML = LabState.queryHistory.slice(0, 15).map(h => `
      <div class="dbms-hist-item ${h.ok ? 'ok' : 'err'}" onclick="DBMSLab.loadHistory(${JSON.stringify(h.sql).replace(/"/g,'&quot;')})" title="${escHtml(h.sql)}">
        <span class="dbms-hist-icon">${h.ok ? '✓' : '✗'}</span>
        <span class="dbms-hist-sql">${escHtml(h.sql.substring(0, 55))}${h.sql.length > 55 ? '…' : ''}</span>
      </div>`).join('');
  }

  function loadHistory(sql) {
    const editor = $('dbmsLabEditor');
    if (editor) {
      editor.value = sql;
      editor.focus();
    }
    runQuery(sql);
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function showLabToast(msg, type) {
    // Reuse existing showToast from app.js if available
    if (typeof showToast === 'function') {
      showToast(msg, type);
    }
  }

  // ─── Flashcards ─────────────────────────────────────────────────────────────
  function renderFlashcard() {
    LabState.flashcardFlipped = false;
    const card = FLASHCARDS[LabState.flashcardIndex];
    const el = $('dbmsFlashcard');
    if (!el || !card) return;
    el.classList.remove('flipped');
    const front = $('dbmsFlashFront');
    const back = $('dbmsFlashBack');
    const counter = $('dbmsFlashCounter');
    if (front) front.textContent = card.front;
    if (back) back.textContent = card.back;
    if (counter) counter.textContent = `${LabState.flashcardIndex + 1} / ${FLASHCARDS.length}`;
  }

  function flipFlashcard() {
    LabState.flashcardFlipped = !LabState.flashcardFlipped;
    const el = $('dbmsFlashcard');
    if (el) el.classList.toggle('flipped');
  }

  function nextFlashcard() {
    LabState.flashcardIndex = (LabState.flashcardIndex + 1) % FLASHCARDS.length;
    renderFlashcard();
  }

  function prevFlashcard() {
    LabState.flashcardIndex = (LabState.flashcardIndex - 1 + FLASHCARDS.length) % FLASHCARDS.length;
    renderFlashcard();
  }

  // ─── Practice Test ──────────────────────────────────────────────────────────
  function renderTestQuestion() {
    if (!testStarted) {
      currentQIndex = 0;
      testAnswers = new Array(PRACTICE_QUESTIONS.length).fill(null);
      testStarted = true;
    }
    const q = PRACTICE_QUESTIONS[currentQIndex];
    const el = $('dbmsTestPanel');
    if (!el || !q) return;

    const answered = testAnswers[currentQIndex];
    el.innerHTML = `
      <div class="toc-test-progress">
        <div class="toc-test-bar">
          <div class="toc-test-fill" style="width:${(currentQIndex/PRACTICE_QUESTIONS.length)*100}%"></div>
        </div>
        <span class="toc-test-counter">Question ${currentQIndex + 1} of ${PRACTICE_QUESTIONS.length}</span>
      </div>
      <div class="toc-test-question">${q.question}</div>
      <div class="toc-test-options">
        ${q.options.map((opt, i) => {
          let cls = 'toc-test-opt';
          if (answered !== null) {
            if (i === q.answer) cls += ' correct';
            else if (i === answered && i !== q.answer) cls += ' wrong';
          }
          return `<button class="${cls}" onclick="DBMSLab.answerQuestion(${i})" ${answered !== null ? 'disabled' : ''}>
            <span class="toc-opt-letter">${String.fromCharCode(65+i)}</span>
            <span>${escHtml(opt)}</span>
          </button>`;
        }).join('')}
      </div>
      ${answered !== null ? `
        <div class="toc-test-feedback ${answered === q.answer ? 'correct' : 'wrong'}">
          <span>${answered === q.answer ? '✓ Correct!' : '✗ Incorrect'}</span>
          <p>${escHtml(q.explanation)}</p>
        </div>
        <div class="toc-test-nav">
          ${currentQIndex < PRACTICE_QUESTIONS.length - 1
            ? `<button class="toc-test-next-btn" onclick="DBMSLab.nextTestQuestion()">Next Question →</button>`
            : `<button class="toc-test-next-btn" onclick="DBMSLab.showTestScore()">See Score →</button>`}
        </div>` : ''}`;
  }

  function answerQuestion(idx) {
    if (testAnswers[currentQIndex] !== null) return;
    testAnswers[currentQIndex] = idx;
    renderTestQuestion();
  }

  function nextTestQuestion() {
    if (currentQIndex < PRACTICE_QUESTIONS.length - 1) {
      currentQIndex++;
      renderTestQuestion();
    }
  }

  function showTestScore() {
    const correct = testAnswers.filter((a, i) => a === PRACTICE_QUESTIONS[i].answer).length;
    const total = PRACTICE_QUESTIONS.length;
    const pct = Math.round((correct / total) * 100);
    const el = $('dbmsTestPanel');
    if (!el) return;
    testStarted = false;
    el.innerHTML = `
      <div class="toc-score-card">
        <div class="toc-score-circle" style="--pct:${pct}">
          <span class="toc-score-num">${pct}%</span>
        </div>
        <div class="toc-score-label">${correct} / ${total} Correct</div>
        <div class="toc-score-msg">${pct >= 80 ? '🎉 Excellent! You have a strong understanding of SQL.' : pct >= 60 ? '👍 Good job! Review the explanations to solidify your knowledge.' : '📚 Keep practicing — try the Live SQL Lab to see queries in action.'}</div>
        <div class="toc-score-review">
          ${PRACTICE_QUESTIONS.map((q, i) => `
            <div class="toc-score-item ${testAnswers[i] === q.answer ? 'correct' : 'wrong'}">
              <span class="toc-score-icon">${testAnswers[i] === q.answer ? '✓' : '✗'}</span>
              <span class="toc-score-qtext">${escHtml(q.question)}</span>
            </div>`).join('')}
        </div>
        <button class="toc-test-next-btn" onclick="DBMSLab.retryTest()">Retry Test ↺</button>
      </div>`;
  }

  function retryTest() {
    testStarted = false;
    renderTestQuestion();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  return {
    open, close,
    switchTab,
    runQuery,
    loadExample,
    loadHistory,
    resetDatabase,
    flipFlashcard,
    nextFlashcard,
    prevFlashcard,
    answerQuestion,
    nextTestQuestion,
    showTestScore,
    retryTest,
  };
})();
