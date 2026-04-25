
/**
 * VisualForge AI — Core Application v2
 */

// ─── State ────────────────────────────────────────────────────────────────────
const State = {
  apiKey: localStorage.getItem('vf_api_key') || 'AIzaSyBOUyeYNwxj875puDkgZXO0bpzvSC7lV_0',
  subject: 'DSA',
  steps: [],
  currentStep: 0,
  understanding: 0,
  interactionCount: 0,
  realWorldApps: [],
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const inputPanel      = $('inputPanel');
const vizStage        = $('vizStage');
const conceptInput    = $('conceptInput');
const forgeBtn        = $('forgeBtn');
const apiKeyInput     = $('apiKeyInput');
const apiSaveBtn      = $('apiSaveBtn');
const apiSetup        = $('apiSetup');
const backBtn         = $('backBtn');
const nextBtn         = $('nextBtn');
const prevBtn         = $('prevBtn');
const replayBtn       = $('replayBtn');
const explainMoreBtn  = $('explainMoreBtn');
const vizCanvas       = $('vizCanvas');
const vizLoading      = $('vizLoading');
const stepIndicator   = $('stepIndicator');
const explanationText = $('explanationText');
const stageTitle      = $('stageTitle');
const stageBadge      = $('stageBadge');
const understandingFill  = $('understandingFill');
const understandingScore = $('understandingScore');
const simplifiedPanel    = $('simplifiedPanel');
const simplifiedContent  = $('simplifiedContent');
const realworldPanel     = $('realworldPanel');
const realworldCards     = $('realworldCards');
const toast = $('toast');

// ─── Concept Suggestions ──────────────────────────────────────────────────────
const CONCEPTS = {
  DSA: [
    { label: 'BST Insertion', q: 'How does Binary Search Tree insertion work with values 50, 30, 70, 20, 40?' },
    { label: 'Bubble Sort', q: 'Show Bubble Sort on array [64, 34, 25, 12, 22, 11, 90]' },
    { label: 'DFS Traversal', q: 'Depth First Search on a graph with 6 nodes' },
    { label: 'Min Heap', q: 'How does a Min Heap insertion and deletion work?' },
    { label: 'Merge Sort', q: 'Show Merge Sort on [38, 27, 43, 3, 9, 82, 10]' },
    { label: 'Dijkstra', q: "Dijkstra's shortest path algorithm on a weighted graph" },
    { label: 'AVL Tree', q: 'AVL Tree rotations with insertions causing imbalance' },
    { label: 'Quick Sort', q: 'Quick Sort with pivot selection on [10, 7, 8, 9, 1, 5]' },
    { label: '▶ Live DSA', q: '__LIVE_DSA__' },
  ],
  TOC: [
    { label: 'DFA: ends in 01', q: 'Build a DFA that accepts binary strings ending in 01' },
    { label: 'NFA → DFA', q: 'Convert NFA to DFA with epsilon transitions' },
    { label: 'Even 0s DFA', q: 'DFA that accepts strings with even number of 0s' },
    { label: 'Turing Machine', q: 'Turing Machine that increments a binary number by 1' },
    { label: 'Regex to NFA', q: 'Convert regular expression (a|b)*abb to NFA' },
    { label: 'Mealy Machine', q: 'Mealy machine that outputs 1 when last two inputs are 01' },
  ],
  DBMS: [
    { label: 'CREATE TABLE', q: 'CREATE TABLE Students with columns and INSERT rows' },
    { label: 'SELECT + WHERE', q: 'Show SELECT query with WHERE clause on a Students table' },
    { label: 'INNER JOIN', q: 'INNER JOIN between Students and Courses tables step by step' },
    { label: '1NF → 2NF', q: 'Normalize a table from 1NF to 2NF with example' },
    { label: '2NF → 3NF', q: 'Normalize from 2NF to 3NF removing transitive dependencies' },
    { label: 'GROUP BY', q: 'GROUP BY with COUNT and HAVING clause on Orders table' },
    { label: 'LEFT JOIN', q: 'LEFT JOIN between Employees and Departments tables' },
    { label: 'BCNF', q: 'Convert a relation to BCNF with a real example' },
    { label: 'Transactions', q: 'Show ACID properties with a bank transfer transaction' },
    { label: '▶ Live SQL', q: '__LIVE_SQL__' },
  ],
};

// ─── Real World Apps Data ─────────────────────────────────────────────────────
const REALWORLD = {
  DSA: {
    'bst': [
      { icon: '🔍', title: 'Database Indexing', desc: 'MySQL B-Trees use BST principles to find records in milliseconds across millions of rows.', tag: 'Databases' },
      { icon: '📁', title: 'File Systems', desc: 'Linux ext4 filesystem uses tree structures to organize directory entries.', tag: 'OS' },
      { icon: '🎮', title: 'Game Engines', desc: 'Unity uses BSP trees for spatial partitioning in 3D game worlds.', tag: 'Gaming' },
    ],
    'sorting': [
      { icon: '🛒', title: 'E-Commerce', desc: 'Amazon sorts millions of products by price, rating, relevance in real-time.', tag: 'Web' },
      { icon: '📊', title: 'Data Analytics', desc: 'Pandas uses TimSort (merge+insertion) to sort DataFrames efficiently.', tag: 'Data Science' },
      { icon: '🏦', title: 'Banking', desc: 'Transaction logs are sorted by timestamp for fraud detection algorithms.', tag: 'Finance' },
    ],
    'graph': [
      { icon: '🗺️', title: 'Google Maps', desc: 'Dijkstra + A* finds shortest routes across billions of road segments.', tag: 'Navigation' },
      { icon: '👥', title: 'Social Networks', desc: 'Facebook uses BFS to find "People You May Know" within 6 degrees.', tag: 'Social' },
      { icon: '📦', title: 'Package Managers', desc: 'npm resolves dependency graphs using topological sort (DFS).', tag: 'DevTools' },
    ],
    'heap': [
      { icon: '⚙️', title: 'OS Scheduler', desc: 'Linux kernel uses a min-heap (priority queue) for CPU task scheduling.', tag: 'OS' },
      { icon: '🏥', title: 'Hospital Triage', desc: 'Emergency rooms use priority queues to treat critical patients first.', tag: 'Healthcare' },
      { icon: '📡', title: 'Network Routing', desc: 'Dijkstra\'s algorithm uses a min-heap to find shortest network paths.', tag: 'Networking' },
    ],
  },
  TOC: {
    default: [
      { icon: '🔐', title: 'Password Validators', desc: 'Regex engines (DFAs) validate password patterns — must have uppercase, digit, symbol.', tag: 'Security' },
      { icon: '🌐', title: 'Web Crawlers', desc: 'Google\'s crawler uses finite automata to parse and tokenize HTML/CSS.', tag: 'Search' },
      { icon: '💬', title: 'Compilers', desc: 'GCC\'s lexer is a DFA that tokenizes your C code before parsing.', tag: 'Compilers' },
      { icon: '📱', title: 'Input Validation', desc: 'Phone number, email, and credit card validators are all DFAs in disguise.', tag: 'UX' },
    ],
  },
  DBMS: {
    default: [
      { icon: '🛍️', title: 'Amazon Orders', desc: 'Every "Your Orders" page runs a JOIN between users, orders, and products tables.', tag: 'E-Commerce' },
      { icon: '🏦', title: 'Banking Systems', desc: 'Fund transfers use ACID transactions — if debit fails, credit is rolled back.', tag: 'Finance' },
      { icon: '🎵', title: 'Spotify', desc: 'Playlist queries JOIN songs, artists, albums across normalized tables in real-time.', tag: 'Streaming' },
      { icon: '🏥', title: 'Hospital Records', desc: 'Patient data is normalized to 3NF to avoid update anomalies in medical records.', tag: 'Healthcare' },
    ],
  },
};

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Show API setup only if no key saved
  if (State.apiKey) {
    apiKeyInput.value = '••••••••••••••••';
  }

  // Settings gear toggles API panel
  $('settingsBtn').addEventListener('click', () => {
    apiSetup.classList.toggle('hidden');
    if (!apiSetup.classList.contains('hidden')) apiKeyInput.focus();
  });

  document.querySelectorAll('.subject-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.subject = btn.dataset.subject;
      renderConceptChips();
      updateInputHint();
    });
  });

  apiSaveBtn.addEventListener('click', saveApiKey);
  apiKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveApiKey(); });
  forgeBtn.addEventListener('click', forge);
  conceptInput.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) forge(); });
  nextBtn.addEventListener('click', nextStep);
  prevBtn.addEventListener('click', prevStep);
  replayBtn.addEventListener('click', replayStep);
  explainMoreBtn.addEventListener('click', explainMore);
  backBtn.addEventListener('click', goBack);

  renderConceptChips();
  updateInputHint();
}

// ─── Concept Chips ────────────────────────────────────────────────────────────
function renderConceptChips() {
  let container = $('conceptChips');
  if (!container) {
    container = document.createElement('div');
    container.id = 'conceptChips';
    container.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px';
    const inputGroup = document.querySelector('.input-group');
    inputGroup.parentNode.insertBefore(container, inputGroup);
  }
  const concepts = CONCEPTS[State.subject] || [];
  container.innerHTML = concepts.map(c => `
    <button class="chip-btn" onclick="fillConcept(${JSON.stringify(c.q).replace(/"/g, '&quot;')})">
      ${c.label}
    </button>`).join('');

  // Add chip styles if not present
  if (!$('chipStyles')) {
    const style = document.createElement('style');
    style.id = 'chipStyles';
    style.textContent = `.chip-btn{background:var(--surface);border:1px solid var(--border);border-radius:20px;
      padding:6px 14px;color:var(--text2);font-size:0.75rem;font-weight:500;cursor:pointer;
      transition:var(--transition);font-family:var(--sans);white-space:nowrap}
      .chip-btn:hover{border-color:var(--accent);color:var(--accent3);background:rgba(108,99,255,0.08);transform:translateY(-1px)}`;
    document.head.appendChild(style);
  }
}

function fillConcept(q) {
  if (q === '__LIVE_SQL__') { openLiveSQL(); return; }
  if (q === '__LIVE_DSA__') { openLiveDSA(); return; }
  conceptInput.value = q;
  conceptInput.focus();
}

function updateInputHint() {
  const hints = {
    DSA: 'Ctrl+Enter to forge · or click a concept above',
    TOC: 'Ctrl+Enter to forge · or click a concept above',
    DBMS: 'Ctrl+Enter to forge · or click a concept above',
  };
  $('inputHint').textContent = hints[State.subject];
}

// ─── API Key ──────────────────────────────────────────────────────────────────
function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key || key.startsWith('•')) return;
  State.apiKey = key;
  localStorage.setItem('vf_api_key', key);
  apiKeyInput.value = '••••••••••••••••';
  apiSetup.classList.add('hidden');
  showToast('API key saved ✓', 'success');
}

// ─── Gemini API ───────────────────────────────────────────────────────────────
const MODELS = [
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.0-flash-lite',
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callGemini(prompt, modelIndex = 0, retries = 2) {
  if (!State.apiKey) throw new Error('No API key set.');
  if (modelIndex >= MODELS.length) {
    showToast('Rate limit — auto-retrying in 60s...', '');
    await sleep(60000);
    return callGemini(prompt, 0, retries);
  }

  const model = MODELS[modelIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${State.apiKey}`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
      })
    });
  } catch {
    throw new Error('Network error. Check your connection.');
  }

  // 429 = quota exceeded, 503 = overloaded → try next model
  if (res.status === 429 || res.status === 503) {
    console.warn(`[VisualForge] ${model} busy (${res.status}), trying ${MODELS[modelIndex+1] || 'waiting 60s...'}...`);
    if (modelIndex < MODELS.length - 1) {
      showToast(`Switching model...`, '');
      await sleep(1000);
      return callGemini(prompt, modelIndex + 1, retries);
    } else {
      // All models hit — wait 60s then retry from start (per-minute quota reset)
      showToast(`Rate limit — auto-retrying in 60s...`, '');
      await sleep(60000);
      return callGemini(prompt, 0, retries);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `API error ${res.status}`;
    // High demand / overload in response body → retry same model once, then fallback
    if (msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('overload') || msg.toLowerCase().includes('temporarily')) {
      if (retries > 0) {
        console.warn(`[VisualForge] ${model} overloaded, retrying in 2s... (${retries} left)`);
        showToast(`Model busy, retrying...`, '');
        await sleep(2000);
        return callGemini(prompt, modelIndex, retries - 1);
      }
      showToast(`Switching to fallback model...`, '');
      await sleep(800);
      return callGemini(prompt, modelIndex + 1, 2);
    }
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(subject, concept) {
  const vizGuide = {
    DSA: `Visualization types for DSA:
- "binary_tree" / "bst" / "heap": { type, nodes:[{id,value,children:[id,...]}], edges:[{from,to}], highlighted:[ids], newNode:id, explanation }
  → Use 8-12 nodes minimum. Show realistic values like 45, 23, 67, 12, 34, 56, 78, 9, 28, 50, 72, 90
- "array" / "sorting": { type:"array", array:[values], highlighted:[idx], active:[idx], sorted:[idx], comparing:[idx], pointers:{name:idx}, explanation }
  → Use 8-10 elements. Show the FULL array every step, just change highlighted/comparing/sorted indices.
- "graph": { type:"graph", nodes:[{id,label}], edges:[{from,to,weight}], highlighted:[ids], visited:[ids], current:id, explanation }
  → Use 6-8 nodes with meaningful labels like A,B,C,D,E,F or city names.`,

    TOC: `Visualization type for TOC:
- "state_machine": { type:"state_machine", states:[{id,label,start:bool,accepting:bool}], transitions:[{from,to,symbol}], currentState:id, inputSymbol:str, tape:[chars], headPos:int, explanation }
  → State labels MUST be clean: use q0, q1, q2 OR descriptive names like "Start", "Even", "Odd", "Accept"
  → DO NOT provide x,y coordinates — layout is handled automatically
  → For DFA/NFA: show the automaton processing an example input string step by step
  → Each step should advance currentState and inputSymbol to show the transition happening`,

    DBMS: `Visualization type for DBMS:
- "table": { type:"table", query:"SQL query string", tables:[{name, columns:[], rows:[[]]}], highlightRows:[idx], highlightCells:[{row,col}], changedCells:[{row,col}], explanation }
  → ALWAYS include a "query" field with the actual SQL being executed
  → Use realistic data: real names, real values, not "John Doe" or "value1"
  → For JOINs: show both tables first, then the result table
  → For normalization: show the original table, then decomposed tables
  → Highlight the rows/cells being affected by the current operation`,
  };

  return `You are VisualForge AI — a visual learning simulator for CS students.
Subject: ${subject}
Concept: "${concept}"

${vizGuide[subject]}

Return ONLY this JSON structure (no markdown, no explanation outside JSON):
{
  "title": "Concise title under 55 chars",
  "simplified": "2-3 sentence plain English explanation of the concept",
  "topic": "one of: bst|sorting|graph|heap|state_machine|table|text",
  "steps": [
    { ...visualization fields..., "explanation": "1-2 sentence step description" }
  ]
}

CRITICAL RULES:
1. Generate 5-8 steps that build progressively — each step must show something NEW happening
2. For DSA trees: use 8-12 nodes with realistic numbers (not just 1,2,3)
3. For sorting: show the COMPLETE array every step, only change state indices
4. For TOC: state labels must be clean (q0/q1/q2 or descriptive words). NO x,y coords.
5. For DBMS: every step must have a "query" field with real SQL
6. Make it feel like watching an algorithm execute live, not reading slides
7. Return ONLY valid JSON`;
}

// ─── Forge ────────────────────────────────────────────────────────────────────
async function forge() {
  const concept = conceptInput.value.trim();
  if (!concept) { showToast('Enter a concept first', 'error'); conceptInput.focus(); return; }
  if (!State.apiKey) { showToast('No API key set', 'error'); return; }

  forgeBtn.disabled = true;
  forgeBtn.querySelector('.forge-btn-text').textContent = 'Forging...';

  try {
    const raw = await callGemini(buildPrompt(State.subject, concept));
    const parsed = parseResponse(raw);

    State.steps = parsed.steps || [];
    State.currentStep = 0;
    State.understanding = 0;
    State.interactionCount = 0;
    State.topic = parsed.topic || '';

    if (!State.steps.length) throw new Error('No steps generated. Try rephrasing.');

    stageTitle.textContent = parsed.title || concept;
    stageBadge.textContent = State.subject;
    simplifiedPanel.classList.add('hidden');
    simplifiedContent.innerHTML = '';
    realworldPanel.classList.add('hidden');

    // Pre-load real world apps
    State.realWorldApps = getRealWorldApps(State.subject, State.topic, concept);

    inputPanel.classList.add('hidden');
    vizStage.classList.remove('hidden');

    renderCurrentStep();
    updateControls();
    updateUnderstanding(10);

  } catch (err) {
    showToast(err.message, 'error');
    console.error(err);
  } finally {
    forgeBtn.disabled = false;
    forgeBtn.querySelector('.forge-btn-text').textContent = 'Forge Visualization';
  }
}

function parseResponse(raw) {
  let s = raw.trim();
  // Strip markdown fences
  s = s.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  // Try direct parse first
  try { return JSON.parse(s); } catch {}

  // Extract the outermost { ... } block
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const extracted = s.slice(start, end + 1);
    try { return JSON.parse(extracted); } catch {}

    // Fix common issues: trailing commas, single quotes, unescaped chars
    const fixed = extracted
      .replace(/,\s*([}\]])/g, '$1')           // trailing commas
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"')      // single-quoted values
      .replace(/[\x00-\x1F\x7F]/g, ' ');        // control characters
    try { return JSON.parse(fixed); } catch {}
  }

  throw new Error('Could not parse AI response. Please try again.');
}

// ─── Real World Apps ──────────────────────────────────────────────────────────
function getRealWorldApps(subject, topic, concept) {
  const c = concept.toLowerCase();
  if (subject === 'DSA') {
    if (c.includes('sort') || topic === 'sorting') return REALWORLD.DSA.sorting;
    if (c.includes('graph') || c.includes('dfs') || c.includes('bfs') || c.includes('dijkstra') || topic === 'graph') return REALWORLD.DSA.graph;
    if (c.includes('heap') || topic === 'heap') return REALWORLD.DSA.heap;
    return REALWORLD.DSA.bst; // default DSA
  }
  if (subject === 'TOC') return REALWORLD.TOC.default;
  return REALWORLD.DBMS.default;
}

function showRealWorldApps() {
  if (!State.realWorldApps.length) return;
  realworldCards.innerHTML = State.realWorldApps.map((app, i) => `
    <div class="rw-card" style="animation:fadeInUp 0.4s ease ${i * 0.08}s both">
      <span class="rw-card-icon">${app.icon}</span>
      <div class="rw-card-title">${app.title}</div>
      <div class="rw-card-desc">${app.desc}</div>
      <span class="rw-card-tag">${app.tag}</span>
    </div>`).join('');
  realworldPanel.classList.remove('hidden');
}

// ─── Step Navigation ──────────────────────────────────────────────────────────
function renderCurrentStep() {
  const step = State.steps[State.currentStep];
  if (!step) return;

  vizCanvas.innerHTML = '';
  vizCanvas.appendChild(vizLoading);
  vizLoading.style.display = 'flex';

  setTimeout(() => {
    vizLoading.style.display = 'none';
    vizCanvas.style.minHeight = '360px'; // reset before each render
    Visualizer.render(vizCanvas, step, State.subject);
    explanationText.style.opacity = '0';
    setTimeout(() => {
      explanationText.textContent = step.explanation || 'Observe the visualization.';
      explanationText.style.opacity = '1';
    }, 120);
  }, 280);

  stepIndicator.textContent = `Step ${State.currentStep + 1} of ${State.steps.length}`;
}

function nextStep() {
  if (State.currentStep < State.steps.length - 1) {
    State.currentStep++;
    State.interactionCount++;
    renderCurrentStep();
    updateControls();
    updateUnderstanding(Math.min(100, State.understanding + 12));
    // Show real world apps after step 2
    if (State.currentStep >= 1) showRealWorldApps();
  } else {
    showToast('Last step reached — try "Explain More" for deeper insight', '');
    updateUnderstanding(Math.min(100, State.understanding + 5));
    showRealWorldApps();
  }
}

function prevStep() {
  if (State.currentStep > 0) {
    State.currentStep--;
    renderCurrentStep();
    updateControls();
  }
}

function replayStep() {
  State.interactionCount++;
  renderCurrentStep();
  updateUnderstanding(Math.min(100, State.understanding + 4));
}

function updateControls() {
  prevBtn.disabled = State.currentStep === 0;
  nextBtn.disabled = State.currentStep === State.steps.length - 1;
  replayBtn.disabled = false;
  explainMoreBtn.disabled = false;
}

// ─── Explain More ─────────────────────────────────────────────────────────────
async function explainMore() {
  explainMoreBtn.disabled = true;
  explainMoreBtn.innerHTML = '<span>⟳</span> Loading...';
  try {
    const step = State.steps[State.currentStep];
    const prompt = `You are VisualForge AI. Student is learning "${stageTitle.textContent}" in ${State.subject}.
Current step: "${step.explanation}"

Give a deeper explanation (3-4 sentences) covering:
1. WHY this works this way (the intuition)
2. A real-world analogy that makes it click
3. One common mistake students make here

Be conversational, direct, no markdown, no bullet points. Just flowing text.`;
    const response = await callGemini(prompt);
    simplifiedContent.innerHTML = `<p>${response.trim()}</p>`;
    simplifiedPanel.classList.remove('hidden');
    simplifiedPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateUnderstanding(Math.min(100, State.understanding + 15));
    State.interactionCount++;
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    explainMoreBtn.disabled = false;
    explainMoreBtn.innerHTML = '<span>✦</span> Explain More';
  }
}

// ─── Understanding Meter ──────────────────────────────────────────────────────
function updateUnderstanding(val) {
  State.understanding = Math.round(val);
  understandingFill.style.width = `${State.understanding}%`;
  understandingScore.textContent = `${State.understanding}%`;
  understandingScore.style.color = State.understanding >= 80 ? 'var(--green2)' : State.understanding >= 50 ? 'var(--accent3)' : 'var(--text2)';
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function goBack() {
  vizStage.classList.add('hidden');
  inputPanel.classList.remove('hidden');
  conceptInput.value = '';
  simplifiedPanel.classList.add('hidden');
  realworldPanel.classList.add('hidden');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3800);
}

document.addEventListener('DOMContentLoaded', init);

// ─── Live SQL Modal ───────────────────────────────────────────────────────────
const SQL_TEMPLATES = [
  { label: 'CREATE + INSERT', sql: `CREATE TABLE Students (id INT, name VARCHAR, age INT, grade VARCHAR);\nINSERT INTO Students VALUES (1, 'Arjun', 20, 'A');\nINSERT INTO Students VALUES (2, 'Priya', 21, 'B');\nINSERT INTO Students VALUES (3, 'Karthik', 19, 'A');\nINSERT INTO Students VALUES (4, 'Divya', 22, 'C');\nINSERT INTO Students VALUES (5, 'Rahul', 20, 'B');` },
  { label: 'SELECT *', sql: `SELECT * FROM Students;` },
  { label: 'WHERE Filter', sql: `SELECT * FROM Students WHERE grade = 'A';` },
  { label: 'ORDER BY', sql: `SELECT * FROM Students ORDER BY age DESC;` },
  { label: 'GROUP BY + COUNT', sql: `SELECT grade, COUNT(id) FROM Students GROUP BY grade;` },
  { label: 'UPDATE', sql: `UPDATE Students SET grade = 'A+' WHERE name = 'Arjun';` },
  { label: 'DELETE', sql: `DELETE FROM Students WHERE grade = 'C';` },
  { label: 'INNER JOIN', sql: `CREATE TABLE Courses (student_id INT, course VARCHAR, marks INT);\nINSERT INTO Courses VALUES (1, 'DBMS', 92);\nINSERT INTO Courses VALUES (2, 'DSA', 85);\nINSERT INTO Courses VALUES (3, 'TOC', 78);\nINSERT INTO Courses VALUES (1, 'DSA', 88);\nSELECT * FROM Students INNER JOIN Courses ON Students.id = Courses.student_id;` },
  { label: 'LEFT JOIN', sql: `SELECT * FROM Students LEFT JOIN Courses ON Students.id = Courses.student_id;` },
  { label: 'SHOW TABLES', sql: `SHOW TABLES;` },
];

// Live execution state
const LiveSQL = {
  lastExecuted: '',       // last SQL string that was fully executed
  debounceTimer: null,
  aiHintTimer: null,
  isAiLoading: false,
};

function openLiveSQL() {
  $('sqlModal').classList.remove('hidden');
  $('sqlModalBackdrop').classList.remove('hidden');
  renderSqlTemplateChips();
  updateSqlDbInfo();
  const editor = $('sqlEditor');
  editor.focus();
  // Run whatever is already in the editor
  if (editor.value.trim()) liveExecute(editor.value);
}

function closeLiveSQL() {
  $('sqlModal').classList.add('hidden');
  $('sqlModalBackdrop').classList.add('hidden');
}

function renderSqlTemplateChips() {
  const container = $('sqlTemplateChips');
  container.innerHTML = SQL_TEMPLATES.map((t, i) =>
    `<button class="sql-tpl-chip" onclick="loadSqlTemplate(${i})">${t.label}</button>`
  ).join('');
}

function loadSqlTemplate(idx) {
  const editor = $('sqlEditor');
  const current = editor.value.trim();
  if (current && !current.startsWith('--')) {
    editor.value = current + '\n' + SQL_TEMPLATES[idx].sql;
  } else {
    editor.value = SQL_TEMPLATES[idx].sql;
  }
  editor.focus();
  liveExecute(editor.value);
}

// ── Live Execute: runs on every keystroke (debounced) ─────────────────────────
function liveExecute(sql) {
  clearTimeout(LiveSQL.debounceTimer);
  LiveSQL.debounceTimer = setTimeout(() => {
    const trimmed = sql.trim();
    if (!trimmed) {
      $('sqlOutput').innerHTML = '<div class="sql-output-empty">Start typing SQL — results appear live</div>';
      updateSqlDbInfo();
      return;
    }

    // Only re-execute if content changed
    if (trimmed === LiveSQL.lastExecuted) return;
    LiveSQL.lastExecuted = trimmed;

    // Reset DB state and re-run everything from scratch for consistency
    SQLEngine.reset();
    const results = SQLEngine.execute(trimmed);
    renderSqlResults(results);
    updateSqlDbInfo();
    updateSqlHistory();

    // Trigger AI hint after 1.5s of no typing (only for SELECT/incomplete queries)
    clearTimeout(LiveSQL.aiHintTimer);
    if (State.apiKey && shouldShowAiHint(trimmed)) {
      LiveSQL.aiHintTimer = setTimeout(() => fetchAiHint(trimmed), 1500);
    }
  }, 180); // 180ms debounce — fast enough to feel live
}

function shouldShowAiHint(sql) {
  const u = sql.toUpperCase();
  // Show hint for SELECT queries or when there's an error
  return u.includes('SELECT') || u.includes('JOIN') || u.includes('WHERE');
}

// ── AI Hint: Gemini explains what the query does ──────────────────────────────
async function fetchAiHint(sql) {
  if (LiveSQL.isAiLoading) return;
  LiveSQL.isAiLoading = true;
  const hintBox = $('sqlAiHint');
  if (!hintBox) return;
  hintBox.innerHTML = `<span class="ai-hint-loading">✦ Analyzing...</span>`;
  hintBox.classList.remove('hidden');

  try {
    const prompt = `You are a DBMS tutor. A student wrote this SQL:
\`\`\`sql
${sql}
\`\`\`
In 1-2 sentences, explain what this query does in plain English. Be specific about what data it returns or modifies. No markdown, no bullet points.`;
    const response = await callGemini(prompt);
    hintBox.innerHTML = `<span class="ai-hint-icon">✦</span> ${escHtml(response.trim())}`;
  } catch {
    hintBox.classList.add('hidden');
  } finally {
    LiveSQL.isAiLoading = false;
  }
}

// ── Manual Run (button / Ctrl+Enter) ─────────────────────────────────────────
function runSQL() {
  const sql = $('sqlEditor').value.trim();
  if (!sql) return;
  LiveSQL.lastExecuted = ''; // force re-execute
  liveExecute(sql);
}

// ── Render Results ────────────────────────────────────────────────────────────
function renderSqlResults(results) {
  const output = $('sqlOutput');
  if (!results.length) {
    output.innerHTML = '<div class="sql-output-empty">No results</div>';
    return;
  }

  output.innerHTML = results.map(result => {
    if (result.error) {
      return `<div class="sql-result">
        <div class="sql-result-msg err">✗ ${escHtml(result.error)}</div>
        <div class="sql-err-hint">${escHtml(result.sql || '')}</div>
      </div>`;
    }

    if (result.type === 'ddl') {
      let html = `<div class="sql-result">
        <div class="sql-result-msg ok">✓ ${escHtml(result.message)}</div>`;
      if (result.columns) {
        html += `<div class="sql-col-list">Columns: ${result.columns.map(c =>
          `<span class="sql-col-name">${escHtml(c)}</span>`).join('')}</div>`;
      }
      html += `</div>`;
      return html;
    }

    if (result.type === 'dml') {
      let html = `<div class="sql-result">
        <div class="sql-result-msg ok">✓ ${escHtml(result.message)}</div>`;
      if (result.rows?.length) {
        html += `<div class="sql-table-label">Current state of <b>${escHtml(result.table)}</b></div>`;
        html += renderResultTable(result.columns, result.rows, result.highlightRows || [], result.changedCells || []);
      }
      html += `</div>`;
      return html;
    }

    if (result.type === 'show') {
      const tables = SQLEngine.getTables();
      let html = `<div class="sql-result"><div class="sql-result-msg info">ℹ ${escHtml(result.message)}</div>`;
      (result.tables || []).forEach(tname => {
        const t = tables[tname];
        html += `<div class="sql-table-label">▶ <b>${escHtml(tname)}</b> — ${t.rows.length} row(s)</div>`;
        html += renderResultTable(t.columns, t.rows, [], []);
      });
      html += `</div>`;
      return html;
    }

    if (result.type === 'join') {
      let html = `<div class="sql-result">
        <div class="sql-result-msg ok">✓ ${escHtml(result.message)}</div>`;
      if (result.table1) {
        html += `<div class="sql-table-label">Table: <b>${escHtml(result.table1.name)}</b></div>`;
        html += renderResultTable(result.table1.columns, result.table1.rows, [], []);
      }
      if (result.table2) {
        html += `<div class="sql-table-label">Table: <b>${escHtml(result.table2.name)}</b></div>`;
        html += renderResultTable(result.table2.columns, result.table2.rows, [], []);
      }
      html += `<div class="sql-table-label join-label">⋈ ${escHtml(result.joinType)} JOIN Result</div>`;
      html += renderResultTable(result.columns, result.rows, result.highlightRows || [], []);
      html += `</div>`;
      return html;
    }

    if (result.type === 'select') {
      let html = `<div class="sql-result">
        <div class="sql-result-msg ok">✓ ${escHtml(result.message)}</div>`;
      // Show source table if WHERE filtered rows
      if (result.sourceTable && result.sourceTable.rows.length > result.rows.length) {
        html += `<div class="sql-table-label">Source: <b>${escHtml(result.sourceTable.name)}</b> (${result.sourceTable.rows.length} rows, highlighted = matched)</div>`;
        html += renderResultTable(result.sourceTable.columns, result.sourceTable.rows, result.highlightRows || [], []);
        html += `<div class="sql-table-label" style="color:var(--green)">→ Filtered Result (${result.rows.length} rows)</div>`;
      }
      html += renderResultTable(result.columns, result.rows, result.rows.map((_, i) => i), []);
      html += `</div>`;
      return html;
    }

    return '';
  }).join('');
}

function renderResultTable(columns, rows, highlightRows, changedCells) {
  if (!columns?.length) return '';
  let html = `<div class="sql-tbl-wrap"><table class="sql-result-table"><thead><tr>`;
  columns.forEach(c => { html += `<th>${escHtml(String(c))}</th>`; });
  html += `</tr></thead><tbody>`;
  if (!rows?.length) {
    html += `<tr><td colspan="${columns.length}" style="text-align:center;color:var(--text3);font-style:italic">No rows</td></tr>`;
  } else {
    rows.forEach((row, ri) => {
      const isHL = highlightRows.includes(ri);
      html += `<tr class="${isHL ? 'hl' : ''}">`;
      row.forEach((cell, ci) => {
        const isChanged = changedCells.some(c => c.row === ri && c.col === ci);
        html += `<td class="${isChanged ? 'hl-cell' : ''}">${escHtml(String(cell ?? 'NULL'))}</td>`;
      });
      html += `</tr>`;
    });
  }
  html += `</tbody></table></div>`;
  return html;
}

function updateSqlDbInfo() {
  const tables = SQLEngine.getTables();
  const names = Object.keys(tables);
  const info = $('sqlDbInfo');
  if (!names.length) { info.textContent = 'DB: empty'; return; }
  info.textContent = `DB: ${names.map(n => `${n}(${tables[n].rows.length})`).join(' · ')}`;
}

function updateSqlHistory() {
  const hist = SQLEngine.getHistory();
  const container = $('sqlHistory');
  // Show only unique successful statements
  const unique = [...new Map(hist.filter(h => h.ok).map(h => [h.sql, h])).values()].reverse().slice(0, 15);
  container.innerHTML = unique.map((h, i) => `
    <div class="sql-hist-item ok" onclick="appendSql(${JSON.stringify(h.sql).replace(/"/g,'&quot;')})" title="${escHtml(h.sql)}">
      ✓ ${escHtml(h.sql.substring(0, 70))}${h.sql.length > 70 ? '…' : ''}
    </div>`).join('');
}

function appendSql(sql) {
  const editor = $('sqlEditor');
  editor.value = sql;
  editor.focus();
  liveExecute(sql);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Wire up events ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  $('sqlModalClose').addEventListener('click', closeLiveSQL);
  $('sqlModalBackdrop').addEventListener('click', closeLiveSQL);
  $('sqlRunBtn').addEventListener('click', runSQL);

  $('sqlClearBtn').addEventListener('click', () => {
    $('sqlEditor').value = '';
    SQLEngine.reset();
    $('sqlOutput').innerHTML = '<div class="sql-output-empty">Start typing SQL — results appear live</div>';
    const hint = $('sqlAiHint');
    if (hint) hint.classList.add('hidden');
    updateSqlDbInfo();
  });

  $('sqlResetBtn').addEventListener('click', () => {
    SQLEngine.reset();
    LiveSQL.lastExecuted = '';
    // Re-run current editor content with fresh DB
    const sql = $('sqlEditor').value.trim();
    if (sql) liveExecute(sql);
    else $('sqlOutput').innerHTML = '<div class="sql-output-empty">Database reset.</div>';
    updateSqlDbInfo();
    showToast('Database reset ✓', 'success');
  });

  const editor = $('sqlEditor');

  // LIVE: execute on every input change
  editor.addEventListener('input', () => liveExecute(editor.value));

  // Keyboard shortcuts
  editor.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runSQL();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target, start = s.selectionStart, end = s.selectionEnd;
      s.value = s.value.substring(0, start) + '  ' + s.value.substring(end);
      s.selectionStart = s.selectionEnd = start + 2;
      liveExecute(s.value);
    }
  });
});

// ─── Live DSA Modal ───────────────────────────────────────────────────────────
const DSA_TEMPLATES = [
  { label: 'BST Insert 45', text: 'Insert 45 into a BST that already has nodes: 50, 30, 70, 20, 40, 60, 80' },
  { label: 'BST Delete 30', text: 'Delete node 30 from BST with nodes: 50, 30, 70, 20, 40, 60, 80' },
  { label: 'Bubble Sort', text: 'Bubble sort the array [64, 34, 25, 12, 22, 11, 90]' },
  { label: 'Selection Sort', text: 'Selection sort on [29, 10, 14, 37, 13]' },
  { label: 'BFS Graph', text: 'BFS traversal on graph: A connects to B,C; B connects to D,E; C connects to F' },
  { label: 'DFS Graph', text: 'DFS traversal on graph: A connects to B,C; B connects to D,E; C connects to F' },
  { label: 'Min Heap Insert', text: 'Insert 5 into min heap [10, 15, 20, 17, 25]' },
  { label: 'Merge Sort', text: 'Merge sort the array [38, 27, 43, 3, 9, 82, 10]' },
  { label: 'Inorder BST', text: 'Show inorder traversal of BST with nodes 50, 30, 70, 20, 40, 60, 80' },
  { label: 'Quick Sort', text: 'Quick sort with pivot on [10, 7, 8, 9, 1, 5]' },
];

const LiveDSA = {
  steps: [],
  currentStep: 0,
  debounceTimer: null,
  history: [],
};

function openLiveDSA() {
  $('dsaModal').classList.remove('hidden');
  $('dsaModalBackdrop').classList.remove('hidden');
  $('dsaEditor').focus();
}

function closeLiveDSA() {
  $('dsaModal').classList.add('hidden');
  $('dsaModalBackdrop').classList.add('hidden');
}

function renderDsaTemplateChips() {} // removed — no templates

function loadDsaTemplate(idx) {
  $('dsaEditor').value = DSA_TEMPLATES[idx].text;
  $('dsaEditor').focus();
  triggerDsaVisualize();
}

function triggerDsaVisualize() {
  clearTimeout(LiveDSA.debounceTimer);
  // Show "typing..." hint immediately
  const text = $('dsaEditor').value.trim();
  if (text.length > 8) {
    const hintBox = $('dsaAiHint');
    hintBox.innerHTML = `<span class="ai-hint-loading">✦ Waiting for you to finish typing...</span>`;
    hintBox.classList.remove('hidden');
  }
  // 800ms after user stops typing → fire
  LiveDSA.debounceTimer = setTimeout(runDsaVisualize, 800);
}

async function runDsaVisualize() {
  const text = $('dsaEditor').value.trim();
  if (!text || text.length < 8) return;

  const hintBox = $('dsaAiHint');
  hintBox.innerHTML = `<span class="ai-hint-loading">✦ Gemini is visualizing...</span>`;
  hintBox.classList.remove('hidden');
  $('dsaVizOutput').innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;gap:14px;color:var(--text3)"><div class="loading-spinner"></div><span>Building visualization...</span></div>`;
  $('dsaStepControls').classList.add('hidden');

  try {
    const prompt = `You are VisualForge AI. A student typed this DSA operation:
"${text}"

Generate a step-by-step visualization. Return ONLY valid JSON:
{
  "title": "short title",
  "steps": [
    {
      "type": "binary_tree" | "array" | "graph",
      "explanation": "what is happening in this step",
      // For binary_tree: nodes:[{id,value,children:[]}], edges:[{from,to}], highlighted:[], newNode:id
      // For array: array:[values], highlighted:[], comparing:[], sorted:[], active:[], pointers:{}
      // For graph: nodes:[{id,label}], edges:[{from,to}], highlighted:[], visited:[], current:id
    }
  ]
}

Rules:
- 3-6 steps showing the operation progressing
- For trees: use string ids like "n1","n2" etc, children array has ids
- For arrays: repeat full array every step, change only state indices
- Return ONLY JSON, no markdown`;

    const raw = await callGemini(prompt);
    const parsed = parseResponse(raw);
    LiveDSA.steps = parsed.steps || [];
    LiveDSA.currentStep = 0;

    if (!LiveDSA.steps.length) throw new Error('No steps returned');

    LiveDSA.history.unshift({ text, title: parsed.title || text });
    if (LiveDSA.history.length > 10) LiveDSA.history.pop();
    updateDsaHistory();

    hintBox.innerHTML = `<span class="ai-hint-icon">✦</span> ${escHtml(parsed.title || text)}`;
    renderDsaStep();

    if (LiveDSA.steps.length > 1) {
      $('dsaStepControls').classList.remove('hidden');
    }

  } catch (err) {
    hintBox.innerHTML = `<span style="color:var(--red)">✗ ${escHtml(err.message)}</span>`;
    $('dsaVizOutput').innerHTML = `<div class="sql-output-empty" style="color:var(--red)">${escHtml(err.message)}</div>`;
  }
}

function renderDsaStep() {
  const step = LiveDSA.steps[LiveDSA.currentStep];
  if (!step) return;

  const output = $('dsaVizOutput');
  output.innerHTML = '';
  output.style.minHeight = '300px';

  // Use the Visualizer engine directly
  Visualizer.render(output, step, 'DSA');

  // Explanation
  const expEl = $('dsaExplanation');
  expEl.textContent = step.explanation || '';
  expEl.classList.remove('hidden');

  // Step counter
  $('dsaStepLabel').textContent = `Step ${LiveDSA.currentStep + 1} of ${LiveDSA.steps.length}`;
  $('dsaStepInfo').textContent = `${LiveDSA.currentStep + 1}/${LiveDSA.steps.length}`;
  $('dsaPrevBtn').disabled = LiveDSA.currentStep === 0;
  $('dsaNextBtn').disabled = LiveDSA.currentStep === LiveDSA.steps.length - 1;
}

function updateDsaHistory() {
  $('dsaHistory').innerHTML = LiveDSA.history.map((h, i) =>
    `<div class="sql-hist-item ok" onclick="loadDsaHistory(${i})" title="${escHtml(h.text)}">
      ✓ ${escHtml(h.text.substring(0, 55))}${h.text.length > 55 ? '…' : ''}
    </div>`
  ).join('');
}

function loadDsaHistory(idx) {
  $('dsaEditor').value = LiveDSA.history[idx].text;
  $('dsaEditor').focus();
  clearTimeout(LiveDSA.debounceTimer);
  runDsaVisualize();
}

// Wire up DSA modal
document.addEventListener('DOMContentLoaded', () => {
  $('dsaModalClose').addEventListener('click', closeLiveDSA);
  $('dsaModalBackdrop').addEventListener('click', closeLiveDSA);

  $('dsaRunBtn').addEventListener('click', () => {
    clearTimeout(LiveDSA.debounceTimer);
    runDsaVisualize();
  });

  $('dsaClearBtn').addEventListener('click', () => {
    $('dsaEditor').value = '';
    $('dsaVizOutput').innerHTML = '<div class="sql-output-empty">Describe a DSA operation above</div>';
    $('dsaAiHint').classList.add('hidden');
    $('dsaExplanation').classList.add('hidden');
    $('dsaStepControls').classList.add('hidden');
  });

  $('dsaEditor').addEventListener('input', triggerDsaVisualize);
  $('dsaEditor').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      clearTimeout(LiveDSA.debounceTimer);
      runDsaVisualize();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target, st = s.selectionStart;
      s.value = s.value.substring(0, st) + '  ' + s.value.substring(s.selectionEnd);
      s.selectionStart = s.selectionEnd = st + 2;
    }
  });

  $('dsaNextBtn').addEventListener('click', () => {
    if (LiveDSA.currentStep < LiveDSA.steps.length - 1) {
      LiveDSA.currentStep++;
      renderDsaStep();
    }
  });

  $('dsaPrevBtn').addEventListener('click', () => {
    if (LiveDSA.currentStep > 0) {
      LiveDSA.currentStep--;
      renderDsaStep();
    }
  });
});
