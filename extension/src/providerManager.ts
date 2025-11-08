import * as vscode from "vscode";
import { formatContextForPrompt, ContextPayload } from "./contextExtractor";

type ExternalProvider = "chatgpt" | "gemini" | "deepseek";

interface ProviderMetadata {
  label: string;
  description: string;
  url: string;
  keywords: string[];
}

const PROVIDERS: Record<ExternalProvider, ProviderMetadata> = {
  chatgpt: {
    label: "ChatGPT / Codex",
    description: "Use your installed Codex or Copilot chat, otherwise open ChatGPT in browser.",
    url: "https://chat.openai.com/",
    keywords: ["copilot", "codex", "chatgpt"],
  },
  gemini: {
    label: "Gemini",
    description: "Prefer Gemini VS Code extension, fallback to gemini.google.com.",
    url: "https://gemini.google.com/app",
    keywords: ["gemini"],
  },
  deepseek: {
    label: "DeepSeek",
    description: "Prefer DeepSeek VS Code extension, fallback to browser.",
    url: "https://chat.deepseek.com/",
    keywords: ["deepseek"],
  },
};

const PROVIDER_KEYS = Object.keys(PROVIDERS) as ExternalProvider[];

export async function sendContextToExternalProvider(
  payload: ContextPayload,
  preferred?: ExternalProvider
): Promise<void> {
  const formatted = formatContextForPrompt(payload);
  const commandMap = await detectProviderCommands();
  const defaultProvider = determineProvider(preferred);

  const pick = await vscode.window.showQuickPick(
    PROVIDER_KEYS.map(key => {
      const meta = PROVIDERS[key];
      return {
        label: meta.label,
        description: meta.description,
        detail: commandMap[key]
          ? "Extension detected — prompt will be sent directly inside VS Code."
          : "No extension detected — browser flow will be used.",
        provider: key,
        picked: key === defaultProvider,
      };
    }),
    {
      placeHolder: "Select which provider to send the current context to",
    }
  );

  if (!pick) {
    return;
  }

  await vscode.env.clipboard.writeText(formatted);

  const commandId = commandMap[pick.provider];
  if (commandId) {
    const succeeded = await trySendViaCommand(commandId, formatted, PROVIDERS[pick.provider]);
    if (succeeded) {
      return;
    }
  }

  await openProviderInBrowser(pick.provider);
}

function determineProvider(fallback?: ExternalProvider): ExternalProvider {
  const configured = vscode.workspace
    .getConfiguration("ccwai")
    .get<ExternalProvider>("preferredExternalProvider");

  if (configured && PROVIDERS[configured]) {
    return configured;
  }

  if (fallback && PROVIDERS[fallback]) {
    return fallback;
  }

  return "chatgpt";
}

async function detectProviderCommands(): Promise<Record<ExternalProvider, string | undefined>> {
  const commands = await vscode.commands.getCommands(true);
  const result: Record<ExternalProvider, string | undefined> = {
    chatgpt: undefined,
    gemini: undefined,
    deepseek: undefined,
  };

  for (const key of PROVIDER_KEYS) {
    const keywords = PROVIDERS[key].keywords;
    result[key] = commands.find(commandId =>
      keywords.some(keyword => commandId.toLowerCase().includes(keyword))
    );
  }

  return result;
}

async function trySendViaCommand(
  commandId: string,
  prompt: string,
  meta: ProviderMetadata
): Promise<boolean> {
  try {
    await vscode.commands.executeCommand(commandId, prompt);
    vscode.window.showInformationMessage(`Context sent to ${meta.label} via ${commandId}.`);
    return true;
  } catch (error) {
    console.warn(`Failed to execute ${commandId}:`, error);
    return false;
  }
}

async function openProviderInBrowser(provider: ExternalProvider): Promise<void> {
  await vscode.env.openExternal(vscode.Uri.parse(PROVIDERS[provider].url));
  vscode.window.showInformationMessage(
    `Context copied to clipboard. Paste it into ${PROVIDERS[provider].label}.`
  );
}
