import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { OpenAIAdapter } from "./adapters/openai.js";
import { GeminiAdapter } from "./adapters/gemini.js";
import { DeepSeekAdapter } from "./adapters/deepseek.js";

export interface CommandMeta {
  name: string;
  agent?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  stream?: boolean;
}

export class CCWAIEngine {
  private adapter: any;
  private config: any;
  private configPath: string;
  private commandsDir: string;
  private agentsDir: string;

  constructor() {
    const root = findProjectRoot(process.cwd());

    this.configPath = path.join(root, "ccwai.config.json");
    this.commandsDir = path.join(root, "commands");
    this.agentsDir = path.join(root, "agents");

    this.config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));

    this.adapter = this.loadProvider(this.config.defaultProvider);
  }

  private loadProvider(name: string) {
    switch (name) {
      case "gemini":
        return new GeminiAdapter();
      case "deepseek":
        return new DeepSeekAdapter();
      case "openai":
      default:
        return new OpenAIAdapter();
    }
  }

  private tryFailoverExecution = async (execFn: () => Promise<string>) => {
    try {
      return await execFn();
    } catch (err) {
      console.warn("⚠️ Primary provider failed. Falling back to OpenAI…");
      this.adapter = new OpenAIAdapter();
      return await execFn();
    }
  };

  async runCommand(name: string, userInput: string): Promise<string> {
    const file = path.join(this.commandsDir, `${name}.md`);
    if (!fs.existsSync(file)) {
      throw new Error(`Command not found: ${name}`);
    }

    const raw = fs.readFileSync(file, "utf8");

    const { meta, body } = this.extractFrontmatter(raw);

    // Load agent persona if exists
    const agentPersona = meta.agent
      ? this.loadAgentPersona(meta.agent)
      : "";

    const prompt = this.assemblePrompt({
      meta,
      agentPersona,
      template: body,
      input: userInput,
    });

    if (meta.provider) {
      this.adapter = this.loadProvider(meta.provider);
    }

    return await this.tryFailoverExecution(() => this.adapter.chat(prompt, meta));
  }

  private extractFrontmatter(raw: string): { meta: CommandMeta; body: string } {
    if (!raw.startsWith("---")) {
      return { meta: {}, body: raw };
    }

    const end = raw.indexOf("---", 3);
    const metaRaw = raw.substring(3, end);
    const body = raw.substring(end + 3);

    const meta = yaml.load(metaRaw) as CommandMeta;

    return { meta, body };
  }

  private loadAgentPersona(name: string): string {
    const file = path.join(this.agentsDir, `${name}.md`);
    if (!fs.existsSync(file)) return "";

    return fs.readFileSync(file, "utf8");
  }

  private assemblePrompt({
    meta,
    agentPersona,
    template,
    input,
  }: {
    meta: CommandMeta;
    agentPersona: string;
    template: string;
    input: string;
  }): string {
    return `
# Agent Persona
${agentPersona}

# Command Metadata
${JSON.stringify(meta, null, 2)}

# Template
${template}

# User Input
${input}
    `.trim();
  }

  listCommands(): string[] {
    return fs.readdirSync(this.commandsDir)
      .filter(f => f.endsWith(".md"))
      .map(f => f.replace(".md", ""));
  }

  doctor(): string {
    return `
✅ Config loaded from: ${this.configPath}
✅ Commands directory: ${this.commandsDir}
✅ Agents directory:   ${this.agentsDir}
✅ Default provider:   ${this.config.defaultProvider}
    `.trim();
  }
}

// ✅ Project-root discovery (Git-style)
function findProjectRoot(startDir: string): string {
  let dir = startDir;

  while (true) {
    const cfg = path.join(dir, "ccwai.config.json");
    const cmds = path.join(dir, "commands");

    if (fs.existsSync(cfg) && fs.existsSync(cmds)) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error("Could not locate CCWAI project root.");
}
