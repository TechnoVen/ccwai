import * as vscode from "vscode";
import { extractContext } from "./contextExtractor";
import { listThoughts } from "./thoughtsManager";
import { getDiffSummary } from "./gitSummary";
import type { ProviderRouteStatus } from "./providerManager";

export type PanelMessage =
  | { type: "analyzeContext" }
  | { type: "sendContext" };

interface PanelData {
  summary: string;
  content: string;
  timestamp: string;
  gitSummary: string;
  recentThoughts: string[];
  providerStatuses: ProviderRouteStatus[];
}

export class ContextPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "ccwai.contextView";

  private view?: vscode.WebviewView;
  private messageHandler?: (message: PanelMessage) => void;
  private cache?: PanelData;

  constructor(private readonly context: vscode.ExtensionContext) {}

  onMessage(handler: (message: PanelMessage) => void): void {
    this.messageHandler = handler;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.onDidReceiveMessage(message => {
      if (this.messageHandler) {
        this.messageHandler(message as PanelMessage);
      }
    });

    void this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.view) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    const maxChars = vscode.workspace.getConfiguration("ccwai").get("contextDepth", 800);
    const payload = extractContext(editor, maxChars);
    const workspaceFolder = editor?.document
      ? vscode.workspace.getWorkspaceFolder(editor.document.uri)
      : vscode.workspace.workspaceFolders?.[0];
    const workspaceRoot = workspaceFolder?.uri.fsPath;
    const gitSummary = await getDiffSummary(workspaceRoot);
    const thoughts = workspaceRoot ? await listThoughts(workspaceRoot) : [];
    const recentThoughts = thoughts
      .sort((a, b) => b.label.localeCompare(a.label))
      .slice(0, 3)
      .map(thought => thought.label);

    this.cache = {
      summary: payload.summary,
      content: payload.content,
      timestamp: payload.timestamp,
      gitSummary,
      recentThoughts,
      providerStatuses: this.cache?.providerStatuses ?? [],
    };

    this.view.webview.html = this.render(this.cache);
  }

  setProviderStatuses(statuses: ProviderRouteStatus[]): void {
    if (!this.cache) {
      this.cache = {
        summary: "",
        content: "",
        timestamp: new Date().toISOString(),
        gitSummary: "",
        recentThoughts: [],
        providerStatuses: statuses,
      };
    } else {
      this.cache.providerStatuses = statuses;
    }

    if (this.view) {
      this.view.webview.html = this.render(this.cache);
    }
  }

  private render(data: PanelData): string {
    const escapedSummary = data.summary.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapedContent = data.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapedGit = data.gitSummary.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const thoughtsMarkup = data.recentThoughts.length
      ? `<ul>${data.recentThoughts.map(label => `<li>${label}</li>`).join("")}</ul>`
      : "<p>No recent thoughts.</p>";
    const providerMarkup = data.providerStatuses.length
      ? `<ul>${data.providerStatuses.map(status => {
        const statusText = status.available
          ? `Direct command (${status.commandId})`
          : status.fallbackDescription;
        const color = status.available ? "var(--vscode-testing-iconPassed)" : "var(--vscode-descriptionForeground)";
        return `<li><span style="color:${color};">${status.label}</span> — ${statusText}</li>`;
      }).join("")}</ul>`
      : "<p>Detecting providers…</p>";

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: var(--vscode-font-family);
              color: var(--vscode-foreground);
              background: var(--vscode-sideBar-background);
              margin: 0;
              padding: 12px;
            }
            h2 {
              font-size: 14px;
              margin-bottom: 8px;
            }
            pre {
              background: var(--vscode-editor-background);
              color: var(--vscode-editor-foreground);
              padding: 8px;
              border-radius: 4px;
              white-space: pre-wrap;
              max-height: 220px;
              overflow-y: auto;
            }
            .timestamp {
              font-size: 11px;
              color: var(--vscode-descriptionForeground);
              margin-bottom: 8px;
            }
            button {
              border: none;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              padding: 6px 10px;
              margin-right: 8px;
              border-radius: 3px;
              cursor: pointer;
            }
            button.secondary {
              background: transparent;
              color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
              border: 1px solid var(--vscode-button-border, rgba(255,255,255,0.2));
            }
            .actions {
              margin-bottom: 12px;
            }
            h3 {
              font-size: 13px;
              margin: 12px 0 6px;
            }
            ul {
              padding-left: 18px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="timestamp">Snapshot: ${data.timestamp}</div>
          <div class="actions">
            <button id="analyze">Analyze with CCWAI</button>
            <button id="send" class="secondary">Send to AI Provider</button>
          </div>
          <h2>Summary</h2>
          <pre>${escapedSummary}</pre>
          <h2>Content (preview)</h2>
          <pre>${escapedContent}</pre>
          <h3>Git Status</h3>
          <pre>${escapedGit}</pre>
          <h3>Recent Thoughts</h3>
          ${thoughtsMarkup}
          <h3>Provider Status</h3>
          ${providerMarkup}
          <script>
            const vscode = acquireVsCodeApi();
            const analyzeBtn = document.getElementById("analyze");
            const sendBtn = document.getElementById("send");

            analyzeBtn?.addEventListener("click", () => {
              vscode.postMessage({ type: "analyzeContext" });
            });

            sendBtn?.addEventListener("click", () => {
              vscode.postMessage({ type: "sendContext" });
            });
          </script>
        </body>
      </html>
    `;
  }
}
