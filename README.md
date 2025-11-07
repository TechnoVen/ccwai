# 🧠 CCWAI — Contextual Coding With AI  
*“Context first. Chaos never.”*

CCWAI is your AI-native development workflow — a system that treats AI like a true teammate, not a magic vending machine.  
It blends **OpenAI + Gemini + DeepSeek** with structured workflows, agent personas, and a clean command-based architecture.

Think of it as a **dev brain extension**: predictable, auditable, and ridiculously powerful.

---

# 🚀 Why CCWAI exists

Most AI coding tools behave like overeager interns:  
they mean well, but they forget context, hallucinate, or drown you in noise.

CCWAI flips the script:

✅ *Context first.*  
✅ *Structured steps.*  
✅ *Reusable knowledge.*  
✅ *Works across AIs.*  
✅ *Developer sovereignty preserved.*

---

# 🎯 What CCWAI does (v0.3.0)

### ✅ Multi-AI Support (plug-and-play)
- OpenAI (GPT-4o, Mini)
- Gemini (1.5 Flash / Pro)
- DeepSeek (Chat)

### ✅ Provider Failover
If one model fails → CCWAI falls back automatically.

### ✅ YAML Front-Matter Commands  
Commands live as Markdown with metadata. Example:

```yaml
---
name: research_codebase
agent: codebase-analyzer
provider: gemini
model: gemini-1.5-flash
temperature: 0.2
stream: true
---
