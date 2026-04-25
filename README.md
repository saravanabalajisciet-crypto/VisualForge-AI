# ⬡ VisualForge AI

> **A visual learning simulator for Computer Science students** — powered by Google Gemini API.

Built for **GEMINI.EXE Hackathon** 🏆

---

## 🎯 What It Does

VisualForge AI transforms abstract CS concepts into **step-by-step animated visualizations** instead of text explanations. It covers three core CS subjects:

| Subject | What it visualizes |
|---|---|
| 🌲 **DSA** | Binary Trees, Sorting, Graphs, Heaps — with proper tree layout |
| ⚙️ **TOC** | DFA/NFA state machines, Turing Machines — animated transitions |
| 🗄️ **DBMS** | SQL queries, JOINs, Normalization — live table transformations |

### Key Features
- **Step-by-step visualization** — watch algorithms execute live, not slides
- **Gemini AI explanations** — each step explained in plain English
- **"Explain More"** — Gemini gives deeper context + real-world analogies
- **Real World Applications** — 3D cards showing where each concept is used in industry
- **Live SQL Executor** — type SQL and see table output instantly (in-browser engine)
- **Live DSA Playground** — describe any DSA operation, Gemini visualizes it in real time
- **Understanding Meter** — tracks your engagement score (0–100%)
- **Concept chips** — one-click to load pre-built examples

---

## ⚡ Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/visualforge-ai.git
cd visualforge-ai
node server.js
# Open http://localhost:3000
```

> **API Key:** Get a free Gemini API key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and enter it via the ⚙ settings icon in the app.

---

## 🧠 Gemini Integration

The app uses **Gemini 2.5 Flash** (with automatic fallback to 2.0 Flash and Flash Lite) for:

1. **Visualization generation** — converts a concept/question into structured JSON steps with node/edge/table data
2. **Step explanations** — each visualization step has a plain-English explanation
3. **"Explain More"** — on-demand deeper explanation with real-world analogies
4. **Live DSA Playground** — natural language → visualization steps in real time

All API calls go directly from the browser to `generativelanguage.googleapis.com`. No backend server needed.

---

## 📁 Project Structure

```
visualforge-ai/
├── index.html        # Main app shell + Live SQL/DSA modals
├── styles.css        # Dark theme, animations, responsive layout
├── app.js            # Core logic, Gemini API, navigation, Live DSA
├── visualizer.js     # Rendering engine (Tree, Array, Graph, State Machine, Table)
├── sql-engine.js     # In-browser SQL engine (CREATE, INSERT, SELECT, JOIN, etc.)
├── server.js         # Tiny Node.js HTTP server
└── README.md
```

---

## 🌍 Real World Applications Panel

After step 2 of any visualization, the app shows **3D cards** with real industry use cases:
- BST → MySQL B-Tree indexing, Linux filesystem, Unity game engines
- Sorting → Amazon product ranking, Pandas TimSort, fraud detection
- DFA → Password validators, Google web crawlers, GCC lexer
- DBMS → Amazon orders JOIN, Spotify playlists, hospital records

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (zero dependencies)
- **AI:** Google Gemini API (`gemini-2.5-flash`)
- **Visualizations:** SVG-based with CSS animations
- **Tree Layout:** In-order traversal algorithm (Reingold-Tilford style)
- **SQL Engine:** Custom in-browser parser (no external library)
- **Server:** Node.js built-in `http` module

---

## 📸 Screenshots

> DSA — Binary Search Tree insertion step by step  
> TOC — DFA state machine with active transition highlighting  
> DBMS — Live SQL with syntax highlighting and table output  
> Live DSA Playground — type naturally, Gemini visualizes instantly

---

## 👨‍💻 Built By

Made with ❤️ for GEMINI.EXE Hackathon

---

## 📄 License

MIT
