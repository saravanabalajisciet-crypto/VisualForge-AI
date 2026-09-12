/**
 * VisualForge AI — TOC Interactive Automata Lab
 * Real-time DFA/NFA with virtual keyboard, animated transitions, flashcards, practice test
 */
const TOCLab = (() => {

  // ─── Built-in Automata Definitions ─────────────────────────────────────────
  const AUTOMATA = {
    dfa_ends01: {
      id: 'dfa_ends01',
      name: 'DFA: Accepts strings ending in "01"',
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', start: true,  accepting: false },
        { id: 'q1', label: 'q1', start: false, accepting: false },
        { id: 'q2', label: 'q2', start: false, accepting: true  },
      ],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
        { from: 'q2', to: 'q1', symbol: '0' },
        { from: 'q2', to: 'q0', symbol: '1' },
      ],
      description: 'A DFA that accepts binary strings whose last two characters are "01". The DFA tracks whether the last symbol was 0, and whether we just saw 0 followed by 1.',
      examples: { accept: ['01', '001', '101', '1101'], reject: ['10', '00', '11', '110'] },
    },

    dfa_even0s: {
      id: 'dfa_even0s',
      name: 'DFA: Accepts strings with even number of 0s',
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'Even', start: true,  accepting: true  },
        { id: 'q1', label: 'Odd',  start: false, accepting: false },
      ],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q1', to: 'q0', symbol: '0' },
        { from: 'q1', to: 'q1', symbol: '1' },
      ],
      description: 'A DFA that accepts binary strings containing an even number of 0s (0 counts as even). It has two states: "Even" (currently seen an even count of 0s) and "Odd" (odd count).',
      examples: { accept: ['', '00', '11', '1001', '0011'], reject: ['0', '010', '100', '0001'] },
    },

    dfa_div3: {
      id: 'dfa_div3',
      name: 'DFA: Accepts binary numbers divisible by 3',
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'r=0', start: true,  accepting: true  },
        { id: 'q1', label: 'r=1', start: false, accepting: false },
        { id: 'q2', label: 'r=2', start: false, accepting: false },
      ],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q1', symbol: '1' },
        { from: 'q1', to: 'q2', symbol: '0' },
        { from: 'q1', to: 'q0', symbol: '1' },
        { from: 'q2', to: 'q1', symbol: '0' },
        { from: 'q2', to: 'q2', symbol: '1' },
      ],
      description: 'A DFA that accepts binary strings representing numbers divisible by 3. States track the current remainder when dividing by 3. Reading a new bit shifts the number left (×2) and adds the bit.',
      examples: { accept: ['0', '11', '110', '1001', '1100'], reject: ['1', '10', '100', '111'] },
    },

    nfa_ends_in_1: {
      id: 'nfa_ends_in_1',
      name: 'NFA: Accepts strings ending in "1"',
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', start: true,  accepting: false },
        { id: 'q1', label: 'q1', start: false, accepting: true  },
      ],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q0', to: 'q1', symbol: '1' },
      ],
      description: 'An NFA that accepts binary strings ending in "1". When reading "1" from q0, the NFA non-deterministically splits: one path stays in q0, another moves to the accepting state q1.',
      examples: { accept: ['1', '01', '11', '101', '001'], reject: ['0', '10', '00', '100'] },
    },

    nfa_contains01: {
      id: 'nfa_contains01',
      name: 'NFA: Accepts strings containing "01"',
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', start: true,  accepting: false },
        { id: 'q1', label: 'q1', start: false, accepting: false },
        { id: 'q2', label: 'q2', start: false, accepting: true  },
      ],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
        { from: 'q2', to: 'q2', symbol: '0' },
        { from: 'q2', to: 'q2', symbol: '1' },
      ],
      description: 'An NFA that accepts binary strings that contain "01" as a substring. The NFA non-deterministically guesses when the "01" pattern starts.',
      examples: { accept: ['01', '001', '010', '101', '0011'], reject: ['0', '1', '10', '11', '00'] },
    },
  };

  // ─── Flashcard Data ─────────────────────────────────────────────────────────
  const FLASHCARDS = [
    { front: 'What is a DFA?', back: 'A Deterministic Finite Automaton (DFA) is a machine that reads input symbols one at a time and follows exactly ONE transition per symbol per state. There is no ambiguity — each state has exactly one transition for each symbol in the alphabet.' },
    { front: 'What is an NFA?', back: 'A Non-deterministic Finite Automaton (NFA) can follow MULTIPLE transitions for the same input symbol, or even follow transitions without reading any input (ε-transitions). It "accepts" if at least one path leads to an accepting state.' },
    { front: 'What is a "state" in automata theory?', back: 'A state represents a configuration or "memory" of the machine at a given point. The machine is always in exactly one state (DFA) or a set of states (NFA) at any time.' },
    { front: 'What is the start state?', back: 'The start state (also called the initial state) is where the automaton begins before reading any input. It is typically marked with an arrow pointing into the state (→). Every DFA/NFA has exactly one start state.' },
    { front: 'What is an accepting (final) state?', back: 'An accepting state is a state where, if the machine halts (finishes reading the entire input), the string is considered ACCEPTED. It is drawn as a double circle. A DFA may have multiple accepting states.' },
    { front: 'What is a transition function δ(q, a)?', back: 'The transition function δ maps a state q and an input symbol a to the next state. For a DFA, δ(q, a) = exactly one state. For an NFA, δ(q, a) = a set of states (possibly empty).' },
    { front: 'What does it mean for a DFA to "accept" a string?', back: 'A DFA accepts a string if, after reading all symbols from left to right starting at the start state, the machine ends in an accepting (final) state. If it ends in a non-accepting state, the string is rejected.' },
    { front: 'What is the difference between DFA and NFA?', back: 'A DFA has exactly one transition per symbol per state. An NFA can have zero, one, or many transitions per symbol. Every NFA can be converted to an equivalent DFA, but the DFA may have exponentially more states.' },
    { front: 'What is a "dead state" (trap state)?', back: 'A dead state (or trap state) is a non-accepting state that transitions to itself on all inputs. Once the machine enters a dead state, it can never reach an accepting state. It represents strings that are definitively rejected.' },
    { front: 'What language does a DFA for "even number of 0s" accept?', back: 'It accepts all binary strings containing an even count of the symbol "0" (including zero 0s, which counts as even). The DFA has two states: one for even count and one for odd count of 0s seen so far.' },
    { front: 'What is an ε-transition?', back: 'An epsilon (ε) transition allows an NFA to move from one state to another without reading any input symbol. This makes NFAs more expressive to describe, though they recognize the same class of languages as DFAs.' },
    { front: 'What class of languages do DFAs and NFAs recognize?', back: 'Both DFAs and NFAs recognize exactly the class of REGULAR LANGUAGES. This is a fundamental result: every NFA can be simulated by a DFA (subset construction), so they have equal expressive power.' },
  ];

  // ─── Practice Test Questions ─────────────────────────────────────────────────
  const PRACTICE_QUESTIONS = [
    {
      question: 'In a DFA, how many transitions can a state have for a single input symbol?',
      options: ['Zero', 'Exactly one', 'One or more', 'Any number'],
      answer: 1,
      explanation: 'In a DFA (Deterministic Finite Automaton), each state must have exactly one transition for each symbol in the alphabet. This is what makes it "deterministic" — there is no ambiguity in choosing the next state.',
    },
    {
      question: 'A DFA has 3 states. The start state is q0. After reading "101", the DFA is in state q2. If q2 is an accepting state, what is the result?',
      options: ['Rejected — the string is too short', 'Accepted — the machine ended in an accepting state', 'Neither — DFAs do not accept or reject', 'Error — transitions not specified'],
      answer: 1,
      explanation: 'A DFA accepts a string if and only if it ends in an accepting state after reading the entire input. Since the machine ended in q2 (an accepting state), the string "101" is accepted.',
    },
    {
      question: 'Which symbol represents an "accepting state" in an automaton diagram?',
      options: ['A single circle', 'A double circle', 'A square', 'An arrow pointing in'],
      answer: 1,
      explanation: 'Accepting (final) states are represented by double circles in automaton diagrams. The outer circle distinguishes them from regular states (single circles). An arrow pointing in represents the start state.',
    },
    {
      question: 'An NFA processes input "01" with states {q0, q1} active simultaneously. When reading "1", q0→q0 and q1→q2 (accepting). What is the result?',
      options: ['Rejected — q0 is not accepting', 'Accepted — q2 is accepting', 'Error — multiple states not allowed', 'Undefined'],
      answer: 1,
      explanation: 'An NFA accepts a string if AT LEAST ONE active state is an accepting state after reading the entire input. Since q2 is an accepting state and is active, the string is accepted, even though q0 (also active) is not accepting.',
    },
    {
      question: 'What does δ(q1, 0) = q2 mean?',
      options: [
        'State q1 leads to q0 on input 2',
        'Reading symbol "0" from state q1 takes the machine to state q2',
        'State q2 goes to q1 on input 0',
        'There are 2 transitions from q1',
      ],
      answer: 1,
      explanation: 'δ(q1, 0) = q2 means: the transition function δ, applied to current state q1 and input symbol "0", gives the next state q2. In other words, when in q1 and you read a "0", move to q2.',
    },
    {
      question: 'A DFA for "even number of 0s" starts in state "Even" (accepting). After reading "0", which state is active?',
      options: ['Even', 'Odd', 'Dead', 'Accept'],
      answer: 1,
      explanation: 'The DFA for even 0s starts in "Even" (count = 0, which is even). Reading "0" increments the count to 1 (odd), so the machine transitions to state "Odd". Now the count is odd, so the machine is not in an accepting state.',
    },
    {
      question: 'Can an NFA have more transitions than a DFA for the same language?',
      options: [
        'No — they always have the same number',
        'Yes — an NFA can have more transitions and even ε-transitions',
        'No — DFAs always have more transitions',
        'It depends on the alphabet size only',
      ],
      answer: 1,
      explanation: 'Yes. An NFA can have multiple transitions for the same (state, symbol) pair and can also have ε-transitions (transitions on empty input). This makes NFAs more compact to describe, even though they recognize the same languages.',
    },
    {
      question: 'Which of the following strings is accepted by a DFA that accepts binary strings ending in "01"?',
      options: ['"10"', '"110"', '"101"', '"1011"'],
      answer: 2,
      explanation: '"101" ends in "01", so it is accepted. "10" ends in "10" ✗. "110" ends in "10" ✗. "1011" ends in "11" ✗. A DFA for "ends in 01" only accepts strings whose last two characters are 0 then 1.',
    },
  ];

  // ─── Lab State ──────────────────────────────────────────────────────────────
  const LabState = {
    currentAutomaton: null,
    currentStateSet: [],      // DFA: ['q0']  NFA: ['q0','q1']
    inputString: '',          // full input so far
    inputHistory: [],         // [{symbol, from, to, step}]
    isComplete: false,
    isAccepted: false,
    animating: false,
    flashcardIndex: 0,
    flashcardFlipped: false,
    testAnswers: [],
    testScore: null,
  };

  // ─── DOM helpers ────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ─── Open / Close ───────────────────────────────────────────────────────────
  function open() {
    $('tocLabModal').classList.remove('hidden');
    $('tocLabBackdrop').classList.remove('hidden');
    // Default to first automaton
    if (!LabState.currentAutomaton) selectAutomaton('dfa_ends01');
  }

  function close() {
    $('tocLabModal').classList.add('hidden');
    $('tocLabBackdrop').classList.add('hidden');
  }

  // ─── Select Automaton ───────────────────────────────────────────────────────
  function selectAutomaton(id) {
    const automaton = AUTOMATA[id];
    if (!automaton) return;
    LabState.currentAutomaton = automaton;
    resetAutomaton();
    renderAutomatonInfo();
    renderAutomatonSelector(id);
    renderAutomatonSVG();
    renderTransitionTable();
    renderKeyboard();
  }

  function resetAutomaton() {
    const a = LabState.currentAutomaton;
    if (!a) return;
    LabState.currentStateSet = a.states.filter(s => s.start).map(s => s.id);
    LabState.inputString = '';
    LabState.inputHistory = [];
    LabState.isComplete = false;
    LabState.isAccepted = false;
    LabState.animating = false;
    renderInputString();
    renderTransitionHistory();
    renderStatusBadge('ready');
    renderExplanation('Press a key on the keyboard to begin! Each keypress processes one symbol through the automaton.');
    renderAutomatonSVG();
  }

  function renderAutomatonSelector(activeId) {
    const container = $('tocAutomatonList');
    if (!container) return;
    container.innerHTML = Object.values(AUTOMATA).map(a => `
      <button class="toc-automaton-btn ${a.id === activeId ? 'active' : ''}" onclick="TOCLab.selectAutomaton('${a.id}')">
        <span class="toc-auto-type ${a.type === 'NFA' ? 'nfa' : 'dfa'}">${a.type}</span>
        <span class="toc-auto-name">${a.name.replace(/^(DFA|NFA): /, '')}</span>
      </button>`).join('');
  }

  function renderAutomatonInfo() {
    const a = LabState.currentAutomaton;
    if (!a) return;
    const infoEl = $('tocAutomatonDesc');
    if (infoEl) infoEl.textContent = a.description;
    const badge = $('tocLabTypeBadge');
    if (badge) {
      badge.textContent = a.type;
      badge.className = `toc-type-badge ${a.type === 'NFA' ? 'nfa' : 'dfa'}`;
    }
    const title = $('tocLabTitle');
    if (title) title.textContent = a.name;
    const examples = $('tocExamples');
    if (examples) {
      examples.innerHTML = `
        <span class="toc-eg-label accept">✓ Accept:</span>
        ${a.examples.accept.slice(0,3).map(s => `<code class="toc-eg-code accept">${s || 'ε'}</code>`).join('')}
        <span class="toc-eg-label reject" style="margin-left:10px">✗ Reject:</span>
        ${a.examples.reject.slice(0,3).map(s => `<code class="toc-eg-code reject">${s || 'ε'}</code>`).join('')}`;
    }
  }

  // ─── Virtual Keyboard ───────────────────────────────────────────────────────
  function renderKeyboard() {
    const a = LabState.currentAutomaton;
    if (!a) return;
    const container = $('tocKeyboard');
    if (!container) return;

    // Build keyboard rows matching a real keyboard layout
    // Row 1: number row + backspace
    // Row 2: extra action keys (Enter, Clear, Auto-run)
    // Row 3: alphabet input keys (0, 1)
    const mainKeys = [
      ['7','8','9','0'],
      ['4','5','6','1'],
      ['1','2','3','0'],
    ];

    // Simple clean keyboard focused on what the automaton needs
    const alphabetKeys = a.alphabet;

    container.innerHTML = `
      <div class="toc-kb-section">
        <div class="toc-kb-row">
          ${alphabetKeys.map(k => `
            <button class="toc-key toc-key-input" data-symbol="${k}" onclick="TOCLab.pressKey('${k}')" title="Input symbol: ${k}">
              <span class="toc-key-label">${k}</span>
              <span class="toc-key-sub">symbol</span>
            </button>`).join('')}
        </div>
        <div class="toc-kb-row toc-kb-row-actions">
          <button class="toc-key toc-key-back" onclick="TOCLab.backspace()" title="Remove last symbol">
            <span class="toc-key-label">⌫</span>
            <span class="toc-key-sub">backspace</span>
          </button>
          <button class="toc-key toc-key-enter" onclick="TOCLab.finish()" title="Finish — check acceptance">
            <span class="toc-key-label">↵</span>
            <span class="toc-key-sub">enter</span>
          </button>
          <button class="toc-key toc-key-clear" onclick="TOCLab.clearInput()" title="Clear input and reset">
            <span class="toc-key-label">CLR</span>
            <span class="toc-key-sub">clear</span>
          </button>
          <button class="toc-key toc-key-auto" onclick="TOCLab.autoRun()" title="Auto-run example string">
            <span class="toc-key-label">▶▶</span>
            <span class="toc-key-sub">auto</span>
          </button>
        </div>
      </div>`;

    // Also bind physical keyboard
    bindPhysicalKeyboard();
  }

  // ─── Physical Keyboard binding ──────────────────────────────────────────────
  let physicalKeyBound = false;
  function bindPhysicalKeyboard() {
    if (physicalKeyBound) return;
    physicalKeyBound = true;
    document.addEventListener('keydown', (e) => {
      // Only active when TOC lab is open
      if ($('tocLabModal')?.classList.contains('hidden')) return;
      // Don't intercept when typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const a = LabState.currentAutomaton;
      if (!a) return;
      if (a.alphabet.includes(e.key)) {
        e.preventDefault();
        pressKey(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        finish();
      } else if (e.key === 'Escape') {
        close();
      }
    });
  }

  // ─── Key Press — Core Logic ──────────────────────────────────────────────────
  function pressKey(symbol) {
    const a = LabState.currentAutomaton;
    if (!a || LabState.animating) return;
    if (LabState.isComplete) {
      renderExplanation('Input is complete. Press CLR to reset and start a new string.', 'info');
      return;
    }

    // Animate the key
    animateKey(symbol);

    const prevStates = [...LabState.currentStateSet];

    let nextStates;
    if (a.type === 'DFA') {
      nextStates = stepDFA(a, prevStates[0], symbol);
    } else {
      nextStates = stepNFA(a, prevStates, symbol);
    }

    LabState.inputString += symbol;
    LabState.inputHistory.push({ symbol, from: prevStates, to: nextStates, step: LabState.inputHistory.length + 1 });
    LabState.currentStateSet = nextStates;

    renderInputString();
    renderTransitionHistory();
    renderAutomatonSVG(prevStates, nextStates, symbol);
    renderExplanationForTransition(prevStates, nextStates, symbol, a);

    // Check if in dead/empty state
    if (nextStates.length === 0) {
      renderStatusBadge('dead');
      renderExplanation(`No valid transition from state(s) {${prevStates.join(', ')}} on symbol "${symbol}". The string is rejected.`, 'reject');
      LabState.isComplete = true;
    } else {
      renderStatusBadge('running');
    }
  }

  // ─── DFA Step ───────────────────────────────────────────────────────────────
  function stepDFA(automaton, currentState, symbol) {
    const t = automaton.transitions.find(t => t.from === currentState && t.symbol === symbol);
    return t ? [t.to] : [];
  }

  // ─── NFA Step ───────────────────────────────────────────────────────────────
  function stepNFA(automaton, currentStates, symbol) {
    const nextSet = new Set();
    currentStates.forEach(state => {
      automaton.transitions
        .filter(t => t.from === state && t.symbol === symbol)
        .forEach(t => nextSet.add(t.to));
    });
    return [...nextSet];
  }

  // ─── Finish (Enter key) ─────────────────────────────────────────────────────
  function finish() {
    if (LabState.isComplete) { clearInput(); return; }
    if (!LabState.inputString) {
      // Empty string — check if start state is accepting
      const a = LabState.currentAutomaton;
      const accepted = LabState.currentStateSet.some(s =>
        a.states.find(st => st.id === s)?.accepting
      );
      LabState.isAccepted = accepted;
      LabState.isComplete = true;
      renderStatusBadge(accepted ? 'accept' : 'reject');
      renderExplanation(
        accepted
          ? `The empty string ε is accepted. The start state ${LabState.currentStateSet.join(', ')} is an accepting state.`
          : `The empty string ε is rejected. The start state ${LabState.currentStateSet.join(', ')} is not an accepting state.`,
        accepted ? 'accept' : 'reject'
      );
      renderAutomatonSVG();
      return;
    }

    const a = LabState.currentAutomaton;
    const accepted = LabState.currentStateSet.some(s =>
      a.states.find(st => st.id === s)?.accepting
    );
    LabState.isAccepted = accepted;
    LabState.isComplete = true;
    renderStatusBadge(accepted ? 'accept' : 'reject');
    renderAutomatonSVG();

    const stateNames = LabState.currentStateSet.join(', ');
    if (accepted) {
      renderExplanation(
        `✓ String "${LabState.inputString}" is ACCEPTED! The automaton ended in state(s) {${stateNames}}, which ${LabState.currentStateSet.length > 1 ? 'includes' : 'is'} an accepting state.`,
        'accept'
      );
    } else {
      renderExplanation(
        `✗ String "${LabState.inputString}" is REJECTED. The automaton ended in state(s) {${stateNames}}, which ${LabState.currentStateSet.length > 1 ? 'includes no' : 'is not an'} accepting state.`,
        'reject'
      );
    }
  }

  // ─── Backspace ──────────────────────────────────────────────────────────────
  function backspace() {
    if (LabState.inputHistory.length === 0) return;
    if (LabState.isComplete) LabState.isComplete = false;
    LabState.inputHistory.pop();
    LabState.inputString = LabState.inputString.slice(0, -1);

    // Recompute current state from scratch
    const a = LabState.currentAutomaton;
    let states = a.states.filter(s => s.start).map(s => s.id);
    for (const entry of LabState.inputHistory) {
      if (a.type === 'DFA') {
        states = stepDFA(a, states[0], entry.symbol);
      } else {
        states = stepNFA(a, states, entry.symbol);
      }
      if (states.length === 0) break;
    }
    LabState.currentStateSet = states;

    renderInputString();
    renderTransitionHistory();
    renderAutomatonSVG();
    renderStatusBadge('running');

    if (LabState.inputString.length === 0) {
      renderExplanation('Input cleared. Press a key to begin again.');
      renderStatusBadge('ready');
    } else {
      const last = LabState.inputHistory[LabState.inputHistory.length - 1];
      if (last) {
        renderExplanationForTransition(last.from, last.to, last.symbol, a);
      }
    }
    animateKey('⌫');
  }

  // ─── Clear Input ────────────────────────────────────────────────────────────
  function clearInput() {
    resetAutomaton();
  }

  // ─── Auto-run ───────────────────────────────────────────────────────────────
  function autoRun(customString) {
    clearInput();
    const a = LabState.currentAutomaton;
    if (!a) return;
    const str = customString || a.examples.accept[0] || '01';
    let i = 0;
    function step() {
      if (i < str.length) {
        pressKey(str[i]);
        i++;
        setTimeout(step, 750);
      } else {
        setTimeout(finish, 500);
      }
    }
    setTimeout(step, 300);
  }

  // ─── Key Animation ──────────────────────────────────────────────────────────
  function animateKey(symbol) {
    const key = document.querySelector(`.toc-key[data-symbol="${symbol}"]`);
    if (!key) return;
    key.classList.add('pressed');
    setTimeout(() => key.classList.remove('pressed'), 200);
  }

  // ─── Render Input String ────────────────────────────────────────────────────
  function renderInputString() {
    const el = $('tocInputDisplay');
    if (!el) return;
    if (!LabState.inputString) {
      el.innerHTML = `<span class="toc-input-placeholder">∅ — start typing</span>`;
      return;
    }
    el.innerHTML = LabState.inputString.split('').map((ch, i) => {
      const isLast = i === LabState.inputString.length - 1;
      return `<span class="toc-input-char ${isLast ? 'last' : ''}">${ch}</span>`;
    }).join('');
  }

  // ─── Render Transition History ──────────────────────────────────────────────
  function renderTransitionHistory() {
    const el = $('tocTransitionHistory');
    if (!el) return;
    if (!LabState.inputHistory.length) {
      el.innerHTML = `<div class="toc-hist-empty">Transitions will appear here as you type...</div>`;
      return;
    }
    el.innerHTML = LabState.inputHistory.map((entry, i) => `
      <div class="toc-hist-row" style="animation:fadeInUp 0.25s ease both">
        <span class="toc-hist-step">#${entry.step}</span>
        <span class="toc-hist-delta">δ({${entry.from.join(',')}}, <b>${entry.symbol}</b>) = {${entry.to.join(',') || '∅'}}</span>
        <span class="toc-hist-arrow ${entry.to.length ? 'ok' : 'err'}">${entry.to.length ? '→' : '✗'}</span>
      </div>`).join('');
    el.scrollTop = el.scrollHeight;
  }

  // ─── Render Status Badge ────────────────────────────────────────────────────
  function renderStatusBadge(status) {
    const el = $('tocStatusBadge');
    if (!el) return;
    const map = {
      ready:  { cls: 'ready',  text: '● READY',    color: 'var(--text3)' },
      running:{ cls: 'run',    text: '● RUNNING',  color: 'var(--accent3)' },
      accept: { cls: 'accept', text: '✓ ACCEPTED', color: 'var(--green2)' },
      reject: { cls: 'reject', text: '✗ REJECTED', color: 'var(--red)' },
      dead:   { cls: 'dead',   text: '✗ DEAD',     color: 'var(--orange)' },
    };
    const s = map[status] || map.ready;
    el.textContent = s.text;
    el.style.color = s.color;
    el.className = `toc-status-badge ${s.cls}`;
  }

  // ─── Render Explanation ─────────────────────────────────────────────────────
  function renderExplanationForTransition(from, to, symbol, automaton) {
    if (to.length === 0) {
      renderExplanation(`Input "${symbol}" was received from state(s) {${from.join(', ')}}. No valid transition exists — the machine is stuck. String will be rejected.`, 'reject');
      return;
    }
    if (automaton.type === 'DFA') {
      renderExplanation(`Input "${symbol}" was received. The automaton moved from ${from[0]} → ${to[0]} because δ(${from[0]}, ${symbol}) = ${to[0]}.`, 'info');
    } else {
      if (to.length > 1) {
        renderExplanation(`Input "${symbol}" was received. The NFA split non-deterministically: from {${from.join(', ')}} it moved to multiple states {${to.join(', ')}}. All paths are explored simultaneously.`, 'nfa');
      } else {
        renderExplanation(`Input "${symbol}" was received. The NFA moved from {${from.join(', ')}} → {${to.join(', ')}}.`, 'info');
      }
    }
  }

  function renderExplanation(text, type = '') {
    const el = $('tocExplanation');
    if (!el) return;
    const icons = { accept: '✓', reject: '✗', info: '💡', nfa: '⑂', dead: '☠' };
    const icon = icons[type] || '💡';
    el.innerHTML = `<span class="toc-exp-icon">${icon}</span><span class="toc-exp-text">${text}</span>`;
    el.className = `toc-explanation ${type}`;
  }

  // ─── Render Automaton SVG ───────────────────────────────────────────────────
  function renderAutomatonSVG(prevStates, nextStates, activeSymbol) {
    const canvas = $('tocVizCanvas');
    if (!canvas) return;
    const a = LabState.currentAutomaton;
    if (!a) return;

    const currentActive = LabState.currentStateSet;
    const W = 680, H = 240, nodeR = 30;

    // Layout states
    const n = a.states.length;
    const positions = {};
    if (n <= 4) {
      const spacing = W / (n + 1);
      a.states.forEach((s, i) => { positions[s.id] = { x: spacing * (i + 1), y: H / 2 }; });
    } else if (n <= 6) {
      const half = Math.ceil(n / 2);
      a.states.forEach((s, i) => {
        const row = i < half ? 0 : 1;
        const col = i < half ? i : i - half;
        const count = row === 0 ? half : n - half;
        positions[s.id] = { x: W / (count + 1) * (col + 1), y: 80 + row * 120 };
      });
    } else {
      a.states.forEach((s, i) => {
        const angle = (2 * Math.PI * i / n) - Math.PI / 2;
        positions[s.id] = { x: W/2 + W*0.37*Math.cos(angle), y: H/2 + H*0.37*Math.sin(angle) };
      });
    }

    // Determine active transition
    let activeFrom = null, activeTo = null;
    if (prevStates && nextStates && activeSymbol) {
      activeFrom = prevStates;
      activeTo = nextStates;
    }

    // Group parallel transitions
    const pairCount = {};
    a.transitions.forEach(t => {
      const key = [t.from, t.to].sort().join('|');
      pairCount[key] = (pairCount[key] || 0) + 1;
    });
    const pairIdx = {};

    // Draw transitions
    let transSVG = '';
    a.transitions.forEach(t => {
      const f = positions[t.from], to = positions[t.to];
      if (!f || !to) return;
      const isTActive = activeFrom?.includes(t.from) && activeTo?.includes(t.to) && t.symbol === activeSymbol;
      const color = isTActive ? '#6c63ff' : '#2a2a50';
      const labelColor = isTActive ? '#b0a8ff' : '#555580';
      const sw = isTActive ? 3 : 1.5;
      const marker = isTActive ? 'arr' : 'arr-gray';
      const glowFilter = isTActive ? 'filter="url(#glow)"' : '';

      if (t.from === t.to) {
        transSVG += `
          <path d="M ${f.x-14} ${f.y-nodeR+4} C ${f.x-28} ${f.y-nodeR-44} ${f.x+28} ${f.y-nodeR-44} ${f.x+14} ${f.y-nodeR+4}"
            stroke="${color}" stroke-width="${sw}" fill="none" marker-end="url(#${marker})" ${glowFilter}
            style="transition:stroke 0.3s"/>
          <text x="${f.x}" y="${f.y-nodeR-46}" fill="${labelColor}" font-family="JetBrains Mono,monospace"
            font-size="13" font-weight="600" text-anchor="middle">${escSVG(t.symbol)}</text>`;
      } else {
        const key = [t.from, t.to].sort().join('|');
        pairIdx[key] = (pairIdx[key] || 0);
        const offset = pairIdx[key] * 28 - (pairCount[key] - 1) * 14;
        pairIdx[key]++;
        const dx = to.x-f.x, dy = to.y-f.y, len = Math.sqrt(dx*dx+dy*dy);
        const ux = dx/len, uy = dy/len;
        const x1 = f.x+ux*nodeR, y1 = f.y+uy*nodeR;
        const x2 = to.x-ux*(nodeR+10), y2 = to.y-uy*(nodeR+10);
        const mx = (x1+x2)/2-uy*offset, my = (y1+y2)/2+ux*offset;

        // Animate active transition arrow
        const animAttr = isTActive ? 'class="toc-trans-active"' : '';
        transSVG += `
          <path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}"
            stroke="${color}" stroke-width="${sw}" fill="none"
            marker-end="url(#${marker})" ${glowFilter} ${animAttr}
            style="transition:stroke 0.3s,stroke-width 0.3s"/>
          <text x="${mx}" y="${my-9}" fill="${labelColor}" font-family="JetBrains Mono,monospace"
            font-size="13" font-weight="600" text-anchor="middle">${escSVG(t.symbol)}</text>`;
      }
    });

    // Draw states
    let stateSVG = '';
    a.states.forEach((s, i) => {
      const pos = positions[s.id];
      if (!pos) return;
      const isActive = currentActive.includes(s.id);
      const wasPrev = prevStates?.includes(s.id);
      const isNext = nextStates?.includes(s.id);
      const isAccepting = s.accepting;
      const isComplete = LabState.isComplete;

      let fill, stroke, tc, glowId;
      if (isComplete && isActive && isAccepting) {
        fill = 'rgba(0,212,170,0.25)'; stroke = '#00d4aa'; tc = '#00ffcc'; glowId = 'glow-strong';
      } else if (isComplete && isActive && !isAccepting) {
        fill = 'rgba(255,77,109,0.18)'; stroke = '#ff4d6d'; tc = '#ff8099'; glowId = 'glow';
      } else if (isActive) {
        fill = 'rgba(108,99,255,0.25)'; stroke = '#6c63ff'; tc = '#b0a8ff'; glowId = 'glow-strong';
      } else {
        fill = 'rgba(19,19,42,0.95)'; stroke = '#2a2a50'; tc = '#9898c0'; glowId = '';
      }

      const pulseClass = (isActive && isNext) ? 'class="toc-state-pulse"' : '';
      stateSVG += `
        <g ${pulseClass} style="cursor:default">
          ${s.start ? `<polygon points="${pos.x-nodeR-22},${pos.y} ${pos.x-nodeR-6},${pos.y-9} ${pos.x-nodeR-6},${pos.y+9}" fill="${isActive ? stroke : '#333360'}" opacity="0.8"/>` : ''}
          ${isActive && glowId ? `<circle cx="${pos.x}" cy="${pos.y}" r="${nodeR+9}" fill="${stroke}" opacity="0.1"/>` : ''}
          <circle cx="${pos.x}" cy="${pos.y}" r="${nodeR}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"
            ${glowId ? `filter="url(#${glowId})"` : ''} style="transition:fill 0.35s,stroke 0.35s"/>
          ${isAccepting ? `<circle cx="${pos.x}" cy="${pos.y}" r="${nodeR-6}" fill="none" stroke="${stroke}" stroke-width="1.8" opacity="0.7"/>` : ''}
          <text x="${pos.x}" y="${pos.y}" fill="${tc}" font-family="JetBrains Mono,monospace"
            font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="central">${escSVG(s.label || s.id)}</text>
        </g>`;
    });

    // NFA multi-state label
    let nfaLabel = '';
    if (a.type === 'NFA' && currentActive.length > 1) {
      nfaLabel = `<text x="${W/2}" y="22" fill="var(--accent3)" font-family="JetBrains Mono,monospace"
        font-size="11" text-anchor="middle">Active states: {${currentActive.join(', ')}}</text>`;
    }

    canvas.innerHTML = `
      <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:${W}px;display:block;margin:0 auto;overflow:visible">
        <defs>
          <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0,10 3.5,0 7" fill="#6c63ff"/>
          </marker>
          <marker id="arr-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0,10 3.5,0 7" fill="#333360"/>
          </marker>
          <marker id="arr-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0,10 3.5,0 7" fill="#00d4aa"/>
          </marker>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        ${nfaLabel}
        ${transSVG}
        ${stateSVG}
      </svg>`;
  }

  // ─── Render Transition Table ─────────────────────────────────────────────────
  function renderTransitionTable() {
    const el = $('tocTransitionTable');
    if (!el) return;
    const a = LabState.currentAutomaton;
    if (!a) return;

    let html = `<table class="toc-delta-table">
      <thead><tr><th>State</th>${a.alphabet.map(s => `<th>${s}</th>`).join('')}</tr></thead>
      <tbody>`;

    a.states.forEach(state => {
      const isActive = LabState.currentStateSet.includes(state.id);
      html += `<tr class="${isActive ? 'active-row' : ''}">
        <td class="toc-state-cell">
          ${state.start ? '→' : ''}${state.accepting ? `<b style="color:var(--green)">((${state.label}))</b>` : state.label}
        </td>`;
      a.alphabet.forEach(sym => {
        const targets = a.transitions.filter(t => t.from === state.id && t.symbol === sym).map(t => t.to);
        const isEmpty = targets.length === 0;
        html += `<td class="${isEmpty ? 'toc-dead-cell' : ''}">${isEmpty ? '∅' : targets.join(', ')}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    el.innerHTML = html;
  }

  // ─── Tab Switching ──────────────────────────────────────────────────────────
  function switchTab(tab) {
    document.querySelectorAll('.toc-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.toc-tab-panel').forEach(p => p.classList.add('hidden'));
    const btn = document.querySelector(`.toc-tab-btn[data-tab="${tab}"]`);
    const panel = $(`tocTab_${tab}`);
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.remove('hidden');
    if (tab === 'flashcards') renderFlashcard();
    if (tab === 'test') renderTestQuestion();
    if (tab === 'lab') renderTransitionTable();
  }

  // ─── Flashcards ─────────────────────────────────────────────────────────────
  function renderFlashcard() {
    LabState.flashcardFlipped = false;
    const card = FLASHCARDS[LabState.flashcardIndex];
    const el = $('tocFlashcard');
    if (!el || !card) return;
    el.classList.remove('flipped');
    const front = $('tocFlashFront');
    const back = $('tocFlashBack');
    const counter = $('tocFlashCounter');
    if (front) front.textContent = card.front;
    if (back) back.textContent = card.back;
    if (counter) counter.textContent = `${LabState.flashcardIndex + 1} / ${FLASHCARDS.length}`;
  }

  function flipFlashcard() {
    LabState.flashcardFlipped = !LabState.flashcardFlipped;
    const el = $('tocFlashcard');
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
  let currentQIndex = 0;
  let testAnswers = [];
  let testStarted = false;

  function renderTestQuestion() {
    if (!testStarted) {
      currentQIndex = 0;
      testAnswers = new Array(PRACTICE_QUESTIONS.length).fill(null);
      testStarted = true;
    }
    const q = PRACTICE_QUESTIONS[currentQIndex];
    const el = $('tocTestPanel');
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
          return `<button class="${cls}" onclick="TOCLab.answerQuestion(${i})" ${answered !== null ? 'disabled' : ''}>
            <span class="toc-opt-letter">${String.fromCharCode(65+i)}</span>
            <span>${opt}</span>
          </button>`;
        }).join('')}
      </div>
      ${answered !== null ? `
        <div class="toc-test-feedback ${answered === q.answer ? 'correct' : 'wrong'}">
          <span>${answered === q.answer ? '✓ Correct!' : '✗ Incorrect'}</span>
          <p>${q.explanation}</p>
        </div>
        <div class="toc-test-nav">
          ${currentQIndex < PRACTICE_QUESTIONS.length - 1
            ? `<button class="toc-test-next-btn" onclick="TOCLab.nextTestQuestion()">Next Question →</button>`
            : `<button class="toc-test-next-btn" onclick="TOCLab.showTestScore()">See Score →</button>`}
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
    const el = $('tocTestPanel');
    if (!el) return;
    testStarted = false;
    el.innerHTML = `
      <div class="toc-score-card">
        <div class="toc-score-circle" style="--pct:${pct}">
          <span class="toc-score-num">${pct}%</span>
        </div>
        <div class="toc-score-label">${correct} / ${total} Correct</div>
        <div class="toc-score-msg">${pct >= 80 ? '🎉 Excellent! You have a strong grasp of automata theory.' : pct >= 60 ? '👍 Good job! Review the explanations to strengthen your understanding.' : '📚 Keep practicing! Go through the flashcards again before retrying.'}</div>
        <div class="toc-score-review">
          ${PRACTICE_QUESTIONS.map((q, i) => `
            <div class="toc-score-item ${testAnswers[i] === q.answer ? 'correct' : 'wrong'}">
              <span class="toc-score-icon">${testAnswers[i] === q.answer ? '✓' : '✗'}</span>
              <span class="toc-score-qtext">${q.question}</span>
            </div>`).join('')}
        </div>
        <button class="toc-test-next-btn" onclick="TOCLab.retryTest()">Retry Test ↺</button>
      </div>`;
  }

  function retryTest() {
    testStarted = false;
    renderTestQuestion();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function escSVG(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ─── Public API ──────────────────────────────────────────────────────────────
  return {
    open, close,
    selectAutomaton,
    pressKey,
    backspace,
    finish,
    clearInput,
    autoRun,
    switchTab,
    flipFlashcard,
    nextFlashcard,
    prevFlashcard,
    answerQuestion,
    nextTestQuestion,
    showTestScore,
    retryTest,
  };
})();
