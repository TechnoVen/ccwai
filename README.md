# 🧠 CCWAI — Contextual Coding With AI
*"Context first. Chaos never."*

CCWAI is your AI-native development workflow — a system that treats AI like a real teammate, not a magic vending machine.
It blends **OpenAI + Gemini + DeepSeek** with structured workflows, agent personas, and a clean command-based architecture.

Think of it as a **developer brain extension**: predictable, auditable, and ridiculously powerful.

---

# 🚀 Why CCWAI exists

Most AI coding tools behave like overeager interns:
They mean well, but they forget context, hallucinate, or drown you in noise.

CCWAI flips the script:

✅ *Context first*
✅ *Structured steps*
✅ *Reusable knowledge*
✅ *Multi-AI orchestration*
✅ *Human in control*

---

# 🎯 What CCWAI does (v0.3.0)

### ✅ Multi-AI Provider Support
* **OpenAI** (GPT-4o, Mini)
* **Gemini** (1.5 Flash / Pro)
* **DeepSeek** (Chat)

### ✅ Provider Failover
If one fails → CCWAI automatically falls back gracefully.

### ✅ YAML Front-Matter Commands
Commands in `/commands/*.md` contain metadata:

yaml
---
```
name: research_codebase
agent: codebase-analyzer
provider: gemini
model: gemini-1.5-flash
temperature: 0.2
stream: true
```
---

### ✅ Agent Personas

Inside `/agents/*.md` — reusable thinking styles.

Automatically injected into prompts.

### ✅ Thought Storage

Every output is archived into:
```

`thoughts/shared/...`
`thoughts/personal/...`

```

Your project becomes self-documenting.

### ✅ Project Root Auto-Discovery

Like Git — CCWAI works anywhere inside the tree.

### ✅ Full CLI Tooling

Commands:
```
`ccwai list`
`ccwai doctor`
`ccwai <command> "input"`

```
-----

# 🧱 Architecture Overview

```
ccwai/
│
├── agents/       → AI personas (code analysts, planners, etc.)
├── commands/     → Markdown/YAML workflow templates
├── thoughts/     → Saved insights, research, plans
│
├── core/         → Engine, adapters, config loader
│   └── dist/
│
├── cli/          → Global CLI tool (ccwai)
│   └── dist/
│
└── extension/    → VS Code extension (coming in v0.4+)
```

-----

# 📦 Installation

Clone repository:

```bash
git clone [https://github.com/TechnoVen/ccwai.git](https://github.com/TechnoVen/ccwai.git)
cd ccwai
```

Install dependencies:

```bash
npm install
```

Build everything:

```bash
npm run build
```

Link CLI globally:

```bash
npm run link-cli
```

Add API keys:

```bash
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."
export DEEPSEEK_API_KEY="..."
```

-----

# 🕹 Usage

### ✅ List commands

```bash
ccwai list
```

### ✅ Diagnose

```bash
ccwai doctor
```

### ✅ Run a command

```bash
ccwai research_codebase "Analyze the project structure"
```

### ✅ Change provider

Edit `ccwai.config.json`:

```json
{
  "defaultProvider": "gemini"
}
```

-----

# 📚 Development Commands

Rebuild everything:

```bash
npm run build
```

Rebuild + relink CLI:

```bash
npm run link-cli
```

Clean all dist folders:

```bash
npm run clean
```

-----

# 🗺 Roadmap

### ✅ v0.3.0 (current)

  * Core engine stable
  * Providers: OpenAI, Gemini, DeepSeek
  * Failover logic
  * YAML metadata
  * Agent system
  * Thoughts pipeline
  * CLI: list, doctor, execute
  * Project-root auto detect

### 🔥 v0.4.0 (next)

  * Context-aware file loader
  * Relevant-file selection
  * Multi-file summarization
  * AI patch generator (`ccwai patch`)
  * Intelligent planning loop
  * VS Code extension panels
  * Streaming support
  * Inline diff previews

Imagine Copilot → but personal, transparent, and 100% under your control.

-----

# ❤️ Vision

CCWAI is more than a tool — it's a philosophy:

  * AI should amplify, not replace.
  * Context is king.
  * Workflows should be reliable, repeatable, and explainable.

If AI is the new electricity, CCWAI is how you wire your development workflow safely and intelligently.

### ✅ Contributing

PRs, agents, ideas — all welcome.
Together we build the future of AI-native coding.

With context, not chaos.

-----