# 🧠 Contextual Coding With AI (CCWI)

> **Revolutionizing how developers collaborate with AI — context-first, not chaos-first.**

---

## 🚀 Overview

**CCWI** (Contextual Coding With AI) is a developer toolkit and workflow system that integrates multiple AI coding assistants directly into your development environment.

Inspired by Ashley Ha’s *Claude Code Workflow*, CCWI extends the concept beyond a single AI model — enabling teams to orchestrate **Claude, ChatGPT, Gemini, Copilot, DeepSeek**, and others inside VS Code or terminal workflows.

Think of it as your **AI DevOps brain**: structured, sharable, and scalable.

---

## 🧩 Core Principles

| Principle | Description |
|------------|--------------|
| 🧠 **Context Engineering** | Always deliver the right context at the right time — never overload the AI. |
| 🔄 **Structured Workflow** | Work in four phases: Research → Plan → Implement → Validate. |
| 🤝 **Human-in-the-loop** | AI assists, you decide. Every phase is reviewable, auditable, and shareable. |
| 🧰 **Multi-AI Integration** | Choose your assistant: Claude, ChatGPT, Gemini, Copilot, or any local LLM. |
| 💾 **Thought Persistence** | Every decision is stored in `/thoughts/` for cross-project learning. |

---

## 🧱 Architecture Vision

---

# ✅ **1. Updated README.md (Full, Detailed, Clean, v0.3.0)**

Below is the *complete updated README.md* you can paste directly into your project root.

---

## **README.md — CCWAI v0.3.0**

# **CCWAI — Contextual Coding With AI**

A multi-provider AI-powered coding engine with a CLI, agent personas, command templates, and an upcoming VS Code extension.

CCWAI gives you **AI-native workflows** similar to Gemini Code Assist, Codex, and Cursor — but fully open and customizable.

---

## ✅ **Features (v0.3.0)**

### ✅ Multi-Provider AI Support

* OpenAI (gpt-4o, 4o-mini, etc.)
* Gemini (1.5 Flash / Pro)
* DeepSeek

### ✅ Provider Failover

If your default provider fails, CCWAI automatically falls back to OpenAI.

### ✅ YAML Front-Matter Commands

Every command in `/commands/*.md` supports:

```yaml
---
name: research_codebase
agent: codebase-analyzer
provider: gemini
model: gemini-1.5-flash
temperature: 0.2
stream: true
---
```

### ✅ Agent Personas

Stored in `/agents/*.md`
Example: `codebase-analyzer.md`, `thoughts-locator.md`.

These are automatically injected when referenced in a command.

### ✅ Prompt Assembly Pipeline

For every command:

✅ Agent persona
✅ Command metadata
✅ Template body
✅ User input
✅ Automatic formatting

### ✅ Thought Storage

Outputs are saved to:

```
thoughts/shared/...  
thoughts/personal/...
```

### ✅ Project Root Discovery

CCWAI works from any subfolder — like Git.

### ✅ CLI Tools

```
ccwai list        → list available commands  
ccwai doctor      → diagnose project  
ccwai <cmd> "..." → run a command  
```

---

## ✅ **Installation**

### 1. Clone repository

```bash
git clone https://github.com/TechnoVen/ccwai.git
cd ccwai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build all workspaces

```bash
npm run build
```

### 4. Link CLI globally

```bash
npm run link-cli
```

### 5. Add your API keys

```bash
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."
export DEEPSEEK_API_KEY="..."
```

---

## ✅ **Usage**

### ✅ List commands

```bash
ccwai list
```

### ✅ Diagnose installation

```bash
ccwai doctor
```

### ✅ Run a command

```bash
ccwai research_codebase "analyze the repo"
```

### ✅ Switch default provider

Edit `ccwai.config.json`:

```json
{
  "defaultProvider": "gemini"
}
```

---

## ✅ **Folder Structure (v0.3.0)**

```
ccwai/
│
├── agents/           → AI personas
├── commands/         → YAML/Markdown commands
├── thoughts/         → saved outputs
│
├── core/             → engine + adapters
│   └── dist/         → compiled JS
│
├── cli/              → global CLI tool
│   └── dist/         → compiled CLI JS
│
└── extension/        → upcoming VS Code extension
```

---

## ✅ **Development**

Rebuild engine + CLI:

```bash
npm run build
```

Rebuild and relink CLI:

```bash
npm run link-cli
```

Clear dist:

```bash
npm run clean
```

---

## ✅ Roadmap

### ✅ v0.3.0 (current)

* Fully working CLI
* Provider failover
* Agents & commands system
* YAML metadata parser
* Thought-saving workflow
* Project-root autodetect

### 🔥 v0.4.0 (next)

* File-aware context loader
* Auto-select relevant files
* Multi-file summarization
* AI code-patch generator
* Intelligent planning loop
* Extension: sidebar panels

---

# ✅ **2. Where we are now — status + TODO list**

### ✅ ✅ **Completed**

✅ Fully functional CLI
✅ Core engine v0.3.0 implemented
✅ All providers working: OpenAI, Gemini, DeepSeek
✅ Auto project-root detection
✅ Commands + agents pipeline
✅ YAML metadata working
✅ Thoughts saved automatically
✅ CLI commands implemented (`list`, `doctor`, run commands)
✅ Builds successfully
✅ Linked globally (`npm link`)
✅ Config file works
✅ Commands executed successfully

You now have a **real AI engine**, not a toy script.

---