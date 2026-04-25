
/**
 * VisualForge AI — Visualization Engine v2
 */
const Visualizer = (() => {

  // ─── SVG Defs ────────────────────────────────────────────────────────────────
  function svgDefs(id = '') {
    return `<defs>
      <marker id="arr${id}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0,10 3.5,0 7" fill="#6c63ff"/>
      </marker>
      <marker id="arr-gray${id}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0,10 3.5,0 7" fill="#333360"/>
      </marker>
      <marker id="arr-green${id}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0,10 3.5,0 7" fill="#00d4aa"/>
      </marker>
      <filter id="glow${id}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-strong${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="7" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
  }

  // ─── DSA: Binary Tree — Reingold-Tilford Layout ──────────────────────────────
  function renderBinaryTree(canvas, stepData) {
    const { nodes, edges, highlighted = [], newNode } = stepData;
    if (!nodes || !nodes.length) { canvas.innerHTML = emptyMsg('No tree data'); return; }

    const nodeR = 26, levelGap = 90, minSep = nodeR * 2.8;

    // Build adjacency: id → node object with left/right children
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = { ...n, left: null, right: null, x: 0, mod: 0 }; });

    // Wire children (first child = left, second = right)
    nodes.forEach(n => {
      const kids = n.children || [];
      if (kids[0] != null) nodeMap[n.id].left  = nodeMap[kids[0]];
      if (kids[1] != null) nodeMap[n.id].right = nodeMap[kids[1]];
    });

    const root = nodeMap[nodes[0].id];

    // ── Reingold-Tilford: first walk ──
    function firstWalk(node, depth) {
      node.depth = depth;
      if (!node.left && !node.right) {
        node.x = 0;
        return;
      }
      if (node.left)  firstWalk(node.left,  depth + 1);
      if (node.right) firstWalk(node.right, depth + 1);

      if (node.left && node.right) {
        node.x = (node.left.x + node.right.x) / 2;
      } else if (node.left) {
        node.x = node.left.x;
      } else {
        node.x = node.right.x;
      }
    }

    // ── Assign x positions level by level (cleaner approach) ──
    function assignX(node, depth, counter) {
      if (!node) return counter;
      counter = assignX(node.left, depth + 1, counter);
      node.x = counter * minSep;
      node.depth = depth;
      counter++;
      counter = assignX(node.right, depth + 1, counter);
      return counter;
    }
    assignX(root, 0, 0);

    // Collect all positions
    const positions = {};
    const maxDepth = { v: 0 };
    function collectPos(node) {
      if (!node) return;
      positions[node.id] = { x: node.x, y: node.depth };
      if (node.depth > maxDepth.v) maxDepth.v = node.depth;
      collectPos(node.left);
      collectPos(node.right);
    }
    collectPos(root);

    // Center horizontally
    const xs = Object.values(positions).map(p => p.x);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const treeW = maxX - minX || 1;
    const W = Math.max(680, treeW + nodeR * 4);
    const H = Math.max(360, (maxDepth.v + 1) * levelGap + nodeR * 3 + 40);
    const offsetX = (W - treeW) / 2 - minX;

    Object.keys(positions).forEach(id => {
      positions[id] = {
        x: positions[id].x + offsetX,
        y: nodeR + 30 + positions[id].y * levelGap
      };
    });

    // ── Draw edges ──
    let edgeSVG = '';
    (edges || []).forEach(e => {
      const f = positions[e.from], t = positions[e.to];
      if (!f || !t) return;
      const active = highlighted.includes(e.from) && highlighted.includes(e.to);
      edgeSVG += `<line x1="${f.x}" y1="${f.y}" x2="${t.x}" y2="${t.y}"
        stroke="${active ? '#6c63ff' : '#252545'}" stroke-width="${active ? 2.5 : 1.5}"
        opacity="${active ? 1 : 0.6}" stroke-linecap="round"/>`;
    });

    // ── Draw nodes ──
    let nodeSVG = '';
    nodes.forEach((node, i) => {
      const pos = positions[node.id];
      if (!pos) return;
      const isHL = highlighted.includes(node.id);
      const isNew = node.id === newNode;
      const fill   = isNew ? 'rgba(0,212,170,0.22)' : isHL ? 'rgba(108,99,255,0.22)' : 'rgba(19,19,42,0.96)';
      const stroke = isNew ? '#00d4aa' : isHL ? '#6c63ff' : '#2a2a50';
      const tc     = isNew ? '#00ffcc' : isHL ? '#b0a8ff' : '#eeeef8';
      const glow   = (isHL || isNew) ? `filter="url(#glow)"` : '';
      nodeSVG += `
        <g style="animation:nodeAppear 0.35s ease ${i * 0.05}s both">
          ${(isHL || isNew) ? `<circle cx="${pos.x}" cy="${pos.y}" r="${nodeR + 8}" fill="${stroke}" opacity="0.12"/>` : ''}
          <circle cx="${pos.x}" cy="${pos.y}" r="${nodeR}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${glow}/>
          <text x="${pos.x}" y="${pos.y}" fill="${tc}" font-family="JetBrains Mono,monospace"
            font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="central">${node.value}</text>
        </g>`;
    });

    canvas.innerHTML = `
      <div class="viz-tree-container step-enter" style="overflow-x:auto">
        <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}"
          style="min-width:${Math.min(W,400)}px;max-width:${W}px;display:block;margin:0 auto;overflow:visible">
          ${svgDefs()}
          ${edgeSVG}${nodeSVG}
        </svg>
      </div>`;
    canvas.style.minHeight = `${H + 20}px`;
  }

  // ─── DSA: Array / Sorting ────────────────────────────────────────────────────
  function renderArray(canvas, stepData) {
    const { array, highlighted = [], active = [], sorted = [], comparing = [], pointers = {} } = stepData;
    if (!array?.length) { canvas.innerHTML = emptyMsg('No array data'); return; }

    const cells = array.map((val, i) => {
      let cls = 'array-cell';
      if (comparing.includes(i)) cls += ' comparing';
      else if (active.includes(i)) cls += ' active';
      else if (sorted.includes(i)) cls += ' sorted';
      else if (highlighted.includes(i)) cls += ' highlight';
      const ptr = Object.entries(pointers).find(([, idx]) => idx === i);
      const ptrHtml = ptr ? `<div style="position:absolute;top:-24px;font-size:0.62rem;color:var(--accent3);font-family:var(--mono);white-space:nowrap">${ptr[0]}</div>` : '';
      return `<div class="${cls}" style="animation:nodeAppear 0.3s ease ${i * 0.04}s both">
        ${ptrHtml}${val}<span class="array-index">${i}</span>
      </div>`;
    }).join('');

    canvas.innerHTML = `<div class="viz-array step-enter">${cells}</div>`;
  }

  // ─── DSA: Graph ──────────────────────────────────────────────────────────────
  function renderGraph(canvas, stepData) {
    const { nodes, edges, highlighted = [], visited = [], current } = stepData;
    if (!nodes?.length) { canvas.innerHTML = emptyMsg('No graph data'); return; }

    const W = 700, H = 320, nodeR = 24;
    const positions = autoLayout(nodes, W, H);

    let edgeSVG = '';
    (edges || []).forEach(e => {
      const f = positions[e.from], t = positions[e.to];
      if (!f || !t) return;
      const active = highlighted.includes(e.from) && highlighted.includes(e.to);
      const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx*dx+dy*dy);
      const ux = dx/len, uy = dy/len;
      const x1 = f.x + ux*nodeR, y1 = f.y + uy*nodeR;
      const x2 = t.x - ux*(nodeR+9), y2 = t.y - uy*(nodeR+9);
      const color = active ? '#6c63ff' : '#252545';
      edgeSVG += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="${color}" stroke-width="${active ? 2.5 : 1.5}"
        marker-end="url(#arr${active ? '' : '-gray'})" opacity="${active ? 1 : 0.65}"/>`;
      if (e.weight !== undefined) {
        edgeSVG += `<text x="${(f.x+t.x)/2}" y="${(f.y+t.y)/2 - 7}"
          fill="var(--text3)" font-size="10" font-family="JetBrains Mono,monospace" text-anchor="middle">${e.weight}</text>`;
      }
    });

    let nodeSVG = '';
    nodes.forEach((node, i) => {
      const pos = positions[node.id];
      const isCur = node.id === current;
      const isVis = visited.includes(node.id);
      const isHL = highlighted.includes(node.id);
      const fill = isCur ? 'rgba(0,212,170,0.22)' : isVis ? 'rgba(108,99,255,0.14)' : 'rgba(19,19,42,0.95)';
      const stroke = isCur ? '#00d4aa' : isHL ? '#6c63ff' : '#333360';
      const tc = isCur ? '#00ffcc' : isHL ? '#b0a8ff' : '#eeeef8';
      const filter = (isCur || isHL) ? `filter="url(#glow)"` : '';
      nodeSVG += `
        <g style="animation:nodeAppear 0.4s ease ${i*0.06}s both">
          <circle cx="${pos.x}" cy="${pos.y}" r="${nodeR}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${filter}/>
          <text x="${pos.x}" y="${pos.y}" fill="${tc}" font-family="JetBrains Mono,monospace"
            font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="central">${node.label || node.id}</text>
        </g>`;
    });

    canvas.innerHTML = `
      <div class="viz-tree-container step-enter" style="display:flex;align-items:center;justify-content:center">
        <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:${W}px;overflow:visible">
          ${svgDefs()}${edgeSVG}${nodeSVG}
        </svg>
      </div>`;
  }

  // ─── TOC: State Machine ──────────────────────────────────────────────────────
  function renderStateMachine(canvas, stepData) {
    const { states, transitions, currentState, inputSymbol, tape = [], headPos } = stepData;
    if (!states?.length) { canvas.innerHTML = emptyMsg('No state data'); return; }

    const W = 720, nodeR = 30;
    const hasTape = tape.length > 0;
    const H = hasTape ? 320 : 260;

    // Always auto-layout for clean diagrams — ignore AI coords
    const positions = layoutStates(states, W, H, nodeR, hasTape);

    // ── Transitions ──
    let transSVG = '';
    // Group transitions between same pair to offset parallel arrows
    const pairMap = {};
    (transitions || []).forEach(t => {
      const key = [t.from, t.to].sort().join('|');
      pairMap[key] = (pairMap[key] || 0) + 1;
    });
    const pairIdx = {};

    (transitions || []).forEach(t => {
      const f = positions[t.from], to = positions[t.to];
      if (!f || !to) return;
      const isActive = t.from === currentState && (t.symbol === inputSymbol || !inputSymbol);
      const color = isActive ? '#6c63ff' : '#2a2a50';
      const labelColor = isActive ? '#b0a8ff' : '#555580';
      const markerSuffix = isActive ? '' : '-gray';

      if (t.from === t.to) {
        // Self-loop — clean arc above node
        const lx = f.x, ly = f.y - nodeR;
        transSVG += `
          <path d="M ${f.x - 14} ${f.y - nodeR + 4} C ${f.x - 28} ${f.y - nodeR - 44} ${f.x + 28} ${f.y - nodeR - 44} ${f.x + 14} ${f.y - nodeR + 4}"
            stroke="${color}" stroke-width="${isActive ? 2.5 : 1.5}" fill="none"
            marker-end="url(#arr${markerSuffix})" ${isActive ? `filter="url(#glow)"` : ''}/>
          <text x="${lx}" y="${ly - 46}" fill="${labelColor}"
            font-family="JetBrains Mono,monospace" font-size="12" font-weight="600" text-anchor="middle">${escHtml(t.symbol)}</text>`;
      } else {
        const key = [t.from, t.to].sort().join('|');
        pairIdx[key] = (pairIdx[key] || 0);
        const offset = pairIdx[key] * 28 - (pairMap[key] - 1) * 14;
        pairIdx[key]++;

        const dx = to.x - f.x, dy = to.y - f.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const ux = dx/len, uy = dy/len;
        const x1 = f.x + ux*nodeR, y1 = f.y + uy*nodeR;
        const x2 = to.x - ux*(nodeR + 10), y2 = to.y - uy*(nodeR + 10);
        // Perpendicular offset for curve
        const mx = (x1+x2)/2 - uy*offset, my = (y1+y2)/2 + ux*offset;
        transSVG += `
          <path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}"
            stroke="${color}" stroke-width="${isActive ? 2.5 : 1.5}" fill="none"
            marker-end="url(#arr${markerSuffix})" ${isActive ? `filter="url(#glow)"` : ''}/>
          <text x="${mx}" y="${my - 9}" fill="${labelColor}"
            font-family="JetBrains Mono,monospace" font-size="12" font-weight="600" text-anchor="middle">${escHtml(t.symbol)}</text>`;
      }
    });

    // ── States ──
    let stateSVG = '';
    states.forEach((s, i) => {
      const pos = positions[s.id];
      if (!pos) return;
      const isActive = s.id === currentState;
      const fill = isActive
        ? (s.accepting ? 'rgba(0,212,170,0.22)' : 'rgba(108,99,255,0.22)')
        : 'rgba(19,19,42,0.95)';
      const stroke = isActive ? (s.accepting ? '#00d4aa' : '#6c63ff') : '#2a2a50';
      const tc = isActive ? (s.accepting ? '#00ffcc' : '#b0a8ff') : '#eeeef8';
      const filter = isActive ? `filter="url(#glow-strong)"` : '';

      stateSVG += `
        <g style="animation:nodeAppear 0.4s ease ${i*0.09}s both">
          ${s.start ? `<polygon points="${pos.x - nodeR - 22},${pos.y} ${pos.x - nodeR - 6},${pos.y - 9} ${pos.x - nodeR - 6},${pos.y + 9}"
            fill="${isActive ? '#6c63ff' : '#333360'}" opacity="${isActive ? 1 : 0.7}"/>` : ''}
          <circle cx="${pos.x}" cy="${pos.y}" r="${nodeR}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${filter}/>
          ${s.accepting ? `<circle cx="${pos.x}" cy="${pos.y}" r="${nodeR - 6}" fill="none" stroke="${stroke}" stroke-width="1.8" opacity="0.7"/>` : ''}
          <text x="${pos.x}" y="${pos.y}" fill="${tc}" font-family="JetBrains Mono,monospace"
            font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="central">${escHtml(s.label || s.id)}</text>
        </g>`;
    });

    // ── Tape ──
    let tapeSVG = '';
    if (hasTape) {
      const cellW = 32, cellH = 28;
      const tapeY = H - 44;
      const startX = W/2 - (tape.length * cellW)/2;
      // Tape label
      tapeSVG += `<text x="${startX - 10}" y="${tapeY + cellH/2}" fill="var(--text3)" font-size="10" font-family="JetBrains Mono,monospace" text-anchor="end" dominant-baseline="central">Tape</text>`;
      tape.forEach((sym, i) => {
        const isHead = i === headPos;
        tapeSVG += `
          <rect x="${startX + i*cellW}" y="${tapeY}" width="${cellW}" height="${cellH}"
            fill="${isHead ? 'rgba(108,99,255,0.2)' : 'rgba(19,19,42,0.8)'}"
            stroke="${isHead ? '#6c63ff' : '#252545'}" stroke-width="${isHead ? 2 : 1}" rx="3"/>
          <text x="${startX + i*cellW + cellW/2}" y="${tapeY + cellH/2}"
            fill="${isHead ? '#b0a8ff' : 'var(--text2)'}" font-family="JetBrains Mono,monospace"
            font-size="12" font-weight="600" text-anchor="middle" dominant-baseline="central">${escHtml(String(sym))}</text>
          ${isHead ? `<text x="${startX + i*cellW + cellW/2}" y="${tapeY - 8}" fill="#6c63ff" font-size="10" text-anchor="middle">▼</text>` : ''}`;
      });
    }

    canvas.innerHTML = `
      <div class="viz-states step-enter" style="width:100%;display:flex;align-items:center;justify-content:center;padding:12px">
        <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:${W}px;overflow:visible">
          ${svgDefs()}
          ${transSVG}${stateSVG}${tapeSVG}
        </svg>
      </div>`;
  }

  // ─── DBMS: Live Query + Table ────────────────────────────────────────────────
  function renderTable(canvas, stepData) {
    const { tables, highlightRows = [], highlightCells = [], changedCells = [], query } = stepData;
    if (!tables?.length) { canvas.innerHTML = emptyMsg('No table data'); return; }

    let html = '<div class="viz-query-container step-enter">';

    // Live SQL query display
    if (query) {
      html += `<div class="query-display">${highlightSQL(query)}</div>`;
    }

    tables.forEach(table => {
      html += `<div style="margin-bottom:18px">`;
      if (table.name) {
        html += `<div style="font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
          color:var(--accent3);margin-bottom:8px;font-family:var(--mono);display:flex;align-items:center;gap:6px">
          <span style="color:var(--cyan)">▶</span> ${escHtml(table.name)}</div>`;
      }
      html += `<table class="viz-table"><thead><tr>`;
      (table.columns || []).forEach(col => { html += `<th>${escHtml(col)}</th>`; });
      html += `</tr></thead><tbody>`;
      (table.rows || []).forEach((row, ri) => {
        const isHL = highlightRows.includes(ri);
        html += `<tr class="${isHL ? 'highlight' : ''}">`;
        row.forEach((cell, ci) => {
          const isHLCell = highlightCells.some(c => c.row === ri && c.col === ci);
          const isChanged = changedCells.some(c => c.row === ri && c.col === ci);
          let cls = isChanged ? 'changed' : isHLCell ? 'highlight-cell' : '';
          html += `<td class="${cls}" style="animation:${isChanged ? 'cellPulse 0.5s ease' : 'none'}">${escHtml(String(cell))}</td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody></table></div>`;
    });
    html += '</div>';
    canvas.innerHTML = html;
  }

  // ─── Text Step ───────────────────────────────────────────────────────────────
  function renderTextStep(canvas, stepData) {
    const { title, points = [], code } = stepData;
    let html = `<div class="step-enter" style="padding:28px;width:100%;max-width:640px">`;
    if (title) html += `<div style="font-size:1.05rem;font-weight:700;color:var(--text);margin-bottom:16px;letter-spacing:-0.01em">${escHtml(title)}</div>`;
    if (points.length) {
      html += `<ul style="list-style:none;display:flex;flex-direction:column;gap:11px">`;
      points.forEach((p, i) => {
        html += `<li style="display:flex;gap:10px;align-items:flex-start;animation:fadeInUp 0.3s ease ${i*0.07}s both">
          <span style="color:var(--accent);font-weight:700;flex-shrink:0;margin-top:1px">→</span>
          <span style="color:var(--text2);font-size:0.93rem;line-height:1.65">${p}</span>
        </li>`;
      });
      html += `</ul>`;
    }
    if (code) {
      html += `<pre style="margin-top:16px;background:var(--bg3);border:1px solid var(--border);border-radius:9px;
        padding:14px;font-family:var(--mono);font-size:0.82rem;color:var(--accent3);overflow-x:auto;line-height:1.65">${escHtml(code)}</pre>`;
    }
    html += `</div>`;
    canvas.innerHTML = html;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function autoLayout(nodes, W, H) {
    const positions = {};
    const hasCoords = nodes.every(n => n.x !== undefined && n.y !== undefined);
    const maxX = hasCoords ? Math.max(...nodes.map(n => n.x)) : 0;
    const isPercent = hasCoords && maxX <= 100;
    nodes.forEach((node, i) => {
      if (isPercent) {
        positions[node.id] = {
          x: 50 + (node.x / 100) * (W - 100),
          y: 40 + (node.y / 100) * (H - 80)
        };
      } else {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        positions[node.id] = { x: W/2 + W*0.34*Math.cos(angle), y: H/2 + H*0.36*Math.sin(angle) };
      }
    });
    return positions;
  }

  function layoutStates(states, W, H, nodeR, hasTape) {
    // Always compute clean layout — ignore AI-provided coords
    const positions = {};
    const n = states.length;
    const usableH = hasTape ? H - 80 : H;
    const centerY = usableH / 2;

    if (n <= 4) {
      // Horizontal line
      const spacing = W / (n + 1);
      states.forEach((s, i) => {
        positions[s.id] = { x: spacing * (i + 1), y: centerY };
      });
    } else if (n <= 6) {
      // Two rows
      const half = Math.ceil(n / 2);
      states.forEach((s, i) => {
        const row = i < half ? 0 : 1;
        const col = i < half ? i : i - half;
        const rowCount = row === 0 ? half : n - half;
        const spacing = W / (rowCount + 1);
        positions[s.id] = { x: spacing * (col + 1), y: centerY - 55 + row * 110 };
      });
    } else {
      // Circle
      states.forEach((s, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        positions[s.id] = { x: W/2 + (W*0.36)*Math.cos(angle), y: usableH/2 + (usableH*0.36)*Math.sin(angle) };
      });
    }
    return positions;
  }

  function highlightSQL(sql) {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'ON', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'GROUP', 'BY', 'ORDER', 'HAVING', 'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'NULL', 'IS', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'UNION', 'ALL', 'LIMIT', 'OFFSET'];
    let result = escHtml(sql);
    keywords.forEach(kw => {
      result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `<span class="query-keyword">${kw}</span>`);
    });
    // Highlight strings
    result = result.replace(/'([^']*)'/g, `<span class="query-value">'$1'</span>`);
    // Highlight numbers
    result = result.replace(/\b(\d+)\b/g, `<span class="query-value">$1</span>`);
    // Highlight table/column names (words after FROM, JOIN, SELECT)
    return result;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function emptyMsg(msg) {
    return `<div style="color:var(--text3);font-size:0.9rem;padding:20px">${msg}</div>`;
  }

  // ─── Dispatcher ──────────────────────────────────────────────────────────────
  function render(canvas, stepData, subject) {
    if (!stepData) return;
    const type = stepData.type || inferType(subject, stepData);
    switch (type) {
      case 'binary_tree': case 'bst': case 'tree': case 'heap':
        renderBinaryTree(canvas, stepData); break;
      case 'array': case 'sorting': case 'stack': case 'queue':
        renderArray(canvas, stepData); break;
      case 'graph': case 'linked_list':
        renderGraph(canvas, stepData); break;
      case 'state_machine': case 'dfa': case 'nfa': case 'toc': case 'turing':
        renderStateMachine(canvas, stepData); break;
      case 'table': case 'dbms': case 'query': case 'join': case 'normalization':
        renderTable(canvas, stepData); break;
      default:
        renderTextStep(canvas, stepData);
    }
  }

  function inferType(subject, stepData) {
    if (subject === 'TOC') return 'state_machine';
    if (subject === 'DBMS') return 'table';
    if (stepData.array) return 'array';
    if (stepData.states) return 'state_machine';
    if (stepData.tables) return 'table';
    if (stepData.nodes && stepData.edges) return 'graph';
    if (stepData.nodes) return 'binary_tree';
    return 'text';
  }

  return { render };
})();
