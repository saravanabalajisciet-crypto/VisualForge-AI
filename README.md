# ⬡ VisualForge AI
### *Stop reading about algorithms. Watch them think.*

> Built for **GEMINI.EXE Hackathon** — powered by Google Gemini API

🔗 **Live Demo:** [visual-forge-ai.vercel.app](https://visual-forge-ai.vercel.app)

---

## The Problem

Every CS student has been there — staring at a textbook trying to understand how a Binary Search Tree inserts a node, or how a DFA transitions between states. **Text explanations don't work for visual concepts.**

Existing tools either show static diagrams or generic animations that aren't connected to what you're actually learning.

## The Solution

**VisualForge AI** uses Gemini to turn any CS concept into a **live, step-by-step visual simulation** — like having a professor draw it on a whiteboard, but on demand, for any topic, instantly.

---

## ✨ What It Does

### 🌲 DSA — Data Structures & Algorithms
Type *"Insert 45 into BST with values 50, 30, 70"* → watch the tree build node by node with highlighted traversal paths, animated insertions, and Gemini explaining each decision.

### ⚙️ TOC — Theory of Computation  
Type *"Build a DFA that accepts strings ending in 01"* → get a clean state machine diagram with labeled transitions, active state highlighting, and tape visualization for Turing Machines.

### 🗄️ DBMS — Database Management  
Type *"Show INNER JOIN between Students and Courses"* → see both tables, the join condition highlighted, and the result table built row by row — with the actual SQL query displayed live.

---

## 🚀 Gemini Powers Everything

| Feature | How Gemini is used |
|---|---|
| **Step Generator** | Converts any concept into structured visualization steps |
| **Step Explanations** | Plain-English explanation for every animation frame |
| **Explain More** | On-demand deeper explanation with real-world analogies |
| **Live DSA Playground** | Natural language → visualization in real time |
| **SQL AI Hint** | Explains what your SQL query does as you type |

---

## 🔥 Unique Features

**Live SQL Executor** — Type SQL and see table output update instantly. Supports `CREATE TABLE`, `INSERT`, `SELECT`, `JOIN`, `GROUP BY`, `UPDATE`, `DELETE` — all running in-browser with zero backend.

**Live DSA Playground** — Describe any operation in plain English. Gemini generates the visualization steps on the fly. No dropdowns, no templates — just type.

**Real World Applications** — After each visualization, 3D cards show exactly where this concept is used in industry (Google Maps uses Dijkstra, MySQL uses B-Trees, GCC uses DFAs).

**Understanding Meter** — Tracks how deeply you're engaging with the content (0–100%) based on steps explored, replays, and "Explain More" interactions.

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/saravanabalajisciet-crypto/VisualForge-AI.git
cd VisualForge-AI

# Run
node server.js

# Open
# http://localhost:3000
```

> Get a free Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — enter it via the ⚙ icon in the app. No billing required.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript — zero dependencies |
| AI | Google Gemini API (`gemini-flash-latest`) |
| Visualizations | SVG with CSS animations |
| Tree Layout | In-order traversal (Reingold-Tilford style) |
| SQL Engine | Custom in-browser parser — no library |
| Hosting | Vercel |

---

## 📁 Project Structure

```
VisualForge-AI/
├── index.html       — App shell + modals
├── styles.css       — Dark theme, animations, 3D cards
├── app.js           — Gemini API, navigation, Live DSA logic
├── visualizer.js    — SVG rendering engine (Tree, Array, Graph, DFA, Table)
├── sql-engine.js    — In-browser SQL parser and executor
├── server.js        — Minimal Node.js static server
└── vercel.json      — Vercel deployment config
```

---

## 🎯 Why This One.

- **Real problem** — CS students worldwide struggle with visual concepts
- **Gemini is the core** — remove the API and the app doesn't work. It's not a wrapper, it's the engine
- **Not a chatbot** — it's a simulator. Gemini generates structured data that drives real animations
- **Three subjects, one tool** — DSA + TOC + DBMS covered with subject-specific renderers
- **Live interaction** — type SQL, type DSA operations, get instant visual feedback

---

*Made with ❤️ for GEMINI.EXE Hackathon*
