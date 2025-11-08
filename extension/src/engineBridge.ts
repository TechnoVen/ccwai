import * as vscode from "vscode";
import path from "path";
import fs from "fs";
import { CCWAIEngine } from "@ccwai/core/dist/engine.js";

export class EngineBridge {
  private engine?: CCWAIEngine;
  private workspaceRoot?: string;

  constructor(private readonly output: vscode.OutputChannel) {}

  getWorkspaceRoot(): string {
    if (this.workspaceRoot) {
      return this.workspaceRoot;
    }

    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      throw new Error("Open a CCWAI workspace before running this command.");
    }

    this.workspaceRoot = folder.uri.fsPath;
    return this.workspaceRoot;
  }

  ensureThoughtsDir(): string {
    const root = this.getWorkspaceRoot();
    const thoughtDir = path.join(root, "thoughts", "shared", "extension");

    fs.mkdirSync(thoughtDir, { recursive: true });
    return thoughtDir;
  }

  async getEngine(): Promise<CCWAIEngine> {
    if (this.engine) {
      return this.engine;
    }

    const workspaceRoot = this.getWorkspaceRoot();
    const configPath = path.join(workspaceRoot, "ccwai.config.json");
    const commandsDir = path.join(workspaceRoot, "commands");

    if (!fs.existsSync(configPath) || !fs.existsSync(commandsDir)) {
      throw new Error("ccwai.config.json and /commands must exist in the workspace root.");
    }

    const previousCwd = process.cwd();
    try {
      process.chdir(workspaceRoot);
      this.engine = new CCWAIEngine();
    } finally {
      process.chdir(previousCwd);
    }

    return this.engine;
  }
}
