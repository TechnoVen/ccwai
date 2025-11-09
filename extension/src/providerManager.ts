import * as vscode from "vscode";
import { formatContextForPrompt, ContextPayload } from "./contextExtractor";

export type ExternalProvider = "chatgpt" | "gemini" | "deepseek" | "copilot" | "codex";

export interface ProviderMetadata {
  key: ExternalProvider;
  label: string;
  description: string;
  url: string;
  commands: string[];
  fallbackDescription: string;
}

export interface ProviderRouteStatus {
  key: ExternalProvider;
  label: string;
  available: boolean;
  commandId?: string;
  fallbackDescription: string;
}

const PROVIDERS: ProviderMetadata[] = [
  {
    key: "copilot",
    label: "GitHub Copilot Chat",
    description: "Use Copilot Chat inline with clipboard hand-off.",
    url: "https://github.com/features/copilot",
    commands: [
      "github.copilot.chat.start",
      "github.copilot.chat.panel.open",
      "github.copilot.interactiveEditor.start",
    ],
    fallbackDescription: "Clipboard → Copilot panel",
  },
  {
    key: "codex",
    label: "OpenAI Codex / ChatGPT",
    description: "Use OpenAI extension if installed; otherwise open chat.openai.com.",
    url: "https://chat.openai.com/",
    commands: [
      "openai.chat.openWindow",
      "openai.chat.focus",
      "openai.codex.start",
    ],
    fallbackDescription: "Clipboard → ChatGPT browser",
  },
  {
    key: "gemini",
    label: "Google Gemini",
    description: "Use Gemini VS Code extension if present; fallback to gemini.google.com.",
    url: "https://gemini.google.com/app",
    commands: [
      "gemini-ai.chat.start",
      "gemini-ai.chat.focus",
    ],
    fallbackDescription: "Clipboard → Gemini browser",
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    description: "DeepSeek VS Code extension (beta) or browser.",
    url: "https://chat.deepseek.com/",
    commands: [
      "deepseek.chat.focus",
      "deepseek.chat.open",
    ],
    fallbackDescription: "Clipboard → DeepSeek browser",
  },
  {
    key: "chatgpt",
    label: "Generic Assistant",
    description: "Generic fallback for assistants not explicitly supported.",
    url: "https://chat.openai.com/",
    commands: [],
    fallbackDescription: "Clipboard → Any assistant",
  },
];

const PROVIDER_KEYS = PROVIDERS.map(p => p.key);

export class ProviderManager {
  private statuses: ProviderRouteStatus[] = [];

  constructor(private readonly output: vscode.OutputChannel) {}

  async refreshStatuses(): Promise<ProviderRouteStatus[]> {
    const commands = await vscode.commands.getCommands(true);
    this.statuses = PROVIDERS.map(meta => {
      const commandId = meta.commands.find(id => commands.includes(id));
      return {
        key: meta.key,
        label: meta.label,
        available: Boolean(commandId),
        commandId,
        fallbackDescription: meta.fallbackDescription,
      };
    });
    return this.statuses;
  }

  getStatuses(): ProviderRouteStatus[] {
    return this.statuses;
  }

  async sendContextToProvider(
    payload: ContextPayload,
    preferred?: ExternalProvider
  ): Promise<void> {
    if (!this.statuses.length) {
      await this.refreshStatuses();
    }

    const formatted = formatContextForPrompt(payload);
    const defaultProvider = determineProvider(preferred);

    const pick = await vscode.window.showQuickPick(
      PROVIDERS.map(meta => {
        const status = this.statuses.find(s => s.key === meta.key);
        return {
          label: meta.label,
          description: meta.description,
          detail: status?.available
            ? `Direct command: ${status.commandId}`
            : status?.fallbackDescription ?? meta.fallbackDescription,
          provider: meta.key,
          picked: meta.key === defaultProvider,
        };
      }),
      { placeHolder: "Select which provider to send the context to" }
    );

    if (!pick) return;

    await vscode.env.clipboard.writeText(formatted);
    const selectedStatus = this.statuses.find(s => s.key === pick.provider);

    if (selectedStatus?.available && selectedStatus.commandId) {
      const succeeded = await trySendViaCommand(selectedStatus.commandId, PROVIDERS.find(p => p.key === pick.provider)!);
      if (succeeded) {
        return;
      }
    }

    await openProviderInBrowser(PROVIDERS.find(p => p.key === pick.provider)!);
  }
}

function determineProvider(fallback?: ExternalProvider): ExternalProvider {
  const configured = vscode.workspace
    .getConfiguration("ccwai")
    .get<string>("preferredExternalProvider", "auto");

  const normalized = configured === "clipboard"
    ? "chatgpt"
    : configured === "auto"
      ? fallback
      : configured;

  if (normalized && PROVIDER_KEYS.includes(normalized as ExternalProvider)) {
    return normalized as ExternalProvider;
  }

  if (fallback && PROVIDER_KEYS.includes(fallback)) {
    return fallback;
  }

  return "chatgpt";
}

async function trySendViaCommand(commandId: string, meta: ProviderMetadata): Promise<boolean> {
  try {
    await vscode.commands.executeCommand(commandId);
    vscode.window.showInformationMessage(`Opened ${meta.label}. Paste the copied context into the prompt.`);
    return true;
  } catch (error) {
    console.warn(`Failed to execute ${commandId}:`, error);
    return false;
  }
}

async function openProviderInBrowser(meta: ProviderMetadata): Promise<void> {
  await vscode.env.openExternal(vscode.Uri.parse(meta.url));
  vscode.window.showInformationMessage(
    `Context copied to clipboard. Opened ${meta.label} in your browser.`
  );
}
