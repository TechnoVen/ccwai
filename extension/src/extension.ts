import * as vscode from "vscode";
import { EngineBridge } from "./engineBridge";
import { extractContext, formatContextForPrompt } from "./contextExtractor";
import { ContextPanelProvider, PanelMessage } from "./contextPanel";
import { saveThought, listThoughts } from "./thoughtsManager";
import { sendContextToExternalProvider } from "./providerManager";

const DEFAULT_ANALYZE_COMMAND = "research_codebase_generic";
const DEFAULT_PLAN_COMMAND = "create_plan_generic";

export async function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("CCWAI");
  const bridge = new EngineBridge(output);
  const panelProvider = new ContextPanelProvider(context);

  context.subscriptions.push(output);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ContextPanelProvider.viewId,
      panelProvider
    )
  );

  panelProvider.onMessage((message: PanelMessage) => {
    if (message.type === "analyzeContext") {
      handleAnalyzeContext(bridge, panelProvider, output);
    } else if (message.type === "sendContext") {
      handleSendContext(bridge);
    }
  });

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      void panelProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration("ccwai.contextDepth")) {
        void panelProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ccwai.analyzeContext", () =>
      handleAnalyzeContext(bridge, panelProvider, output)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ccwai.planWithAI", () =>
      handlePlanWithAI(bridge, output)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ccwai.runCommand", () =>
      handleRunCommand(bridge, output)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ccwai.sendContext", () =>
      handleSendContext(bridge)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ccwai.showThoughts", () =>
      handleShowThoughts(bridge)
    )
  );
}

export function deactivate(): void {
  // No clean-up required at the moment.
}

async function handleAnalyzeContext(
  bridge: EngineBridge,
  panel: ContextPanelProvider,
  output: vscode.OutputChannel
) {
  try {
    const editor = vscode.window.activeTextEditor;
    const maxChars = vscode.workspace.getConfiguration("ccwai").get("contextDepth", 800);
    const payload = extractContext(editor, maxChars);
    const formattedPrompt = formatContextForPrompt(payload);
    const engine = await bridge.getEngine();

    output.show(true);
    output.appendLine("🧠 CCWAI — Analyzing current context...");

    let commandName = DEFAULT_ANALYZE_COMMAND;
    let result: string;

    try {
      result = await engine.runCommand(commandName, formattedPrompt);
    } catch (err) {
      commandName = "research_codebase";
      result = await engine.runCommand(commandName, formattedPrompt);
    }

    output.appendLine(result);

    const autoSave = vscode.workspace.getConfiguration("ccwai").get("autoSaveThoughts", true);
    if (autoSave && payload.workspaceRoot) {
      await saveThought(payload.workspaceRoot, {
        title: `${commandName}-${payload.filePath ?? "workspace"}`,
        context: formattedPrompt,
        result,
      });
    }

    await panel.refresh();
    vscode.window.showInformationMessage(
      "CCWAI analysis complete. Check the CCWAI output channel for details."
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(error?.message ?? "Failed to analyze context with CCWAI.");
  }
}

async function handlePlanWithAI(
  bridge: EngineBridge,
  output: vscode.OutputChannel
) {
  try {
    const engine = await bridge.getEngine();
    const input = await vscode.window.showInputBox({
      prompt: "Describe what you need a plan for",
      placeHolder: "e.g. Implement auth middleware",
    });

    if (input === undefined) {
      return;
    }

    output.show(true);
    output.appendLine("🧩 CCWAI — Building plan...");

    let result: string;
    try {
      result = await engine.runCommand(DEFAULT_PLAN_COMMAND, input);
    } catch {
      result = await engine.runCommand("create_plan", input);
    }

    output.appendLine(result);
    vscode.window.showInformationMessage(
      "CCWAI plan available in the output channel."
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(error?.message ?? "Failed to plan with CCWAI.");
  }
}

async function handleRunCommand(
  bridge: EngineBridge,
  output: vscode.OutputChannel
) {
  try {
    const engine = await bridge.getEngine();
    const available = engine.listCommands();
    const selection = await vscode.window.showQuickPick(available, {
      placeHolder: "Select a CCWAI command to run",
    });

    if (!selection) {
      return;
    }

    const userInput =
      (await vscode.window.showInputBox({
        prompt: `Input for ${selection}`,
      })) ?? "";

    output.show(true);
    output.appendLine(`▶️ CCWAI — Running ${selection}`);
    const result = await engine.runCommand(selection, userInput);
    output.appendLine(result);
  } catch (error: any) {
    vscode.window.showErrorMessage(error?.message ?? "Failed to run CCWAI command.");
  }
}

async function handleShowThoughts(bridge: EngineBridge) {
  try {
    const root = bridge.getWorkspaceRoot();
    const summaries = await listThoughts(root);

    if (!summaries.length) {
      vscode.window.showInformationMessage("No CCWAI thoughts saved yet.");
      return;
    }

    const choice = await vscode.window.showQuickPick(
      summaries.map(item => item.label),
      { placeHolder: "Select a thought to open" }
    );

    if (!choice) {
      return;
    }

    const selected = summaries.find(item => item.label === choice);
    if (!selected) {
      return;
    }

    const doc = await vscode.workspace.openTextDocument(selected.fullPath);
    vscode.window.showTextDocument(doc);
  } catch (error: any) {
    vscode.window.showErrorMessage(error?.message ?? "Unable to open CCWAI thoughts.");
  }
}

async function handleSendContext(bridge: EngineBridge) {
  try {
    const editor = vscode.window.activeTextEditor;
    const maxChars = vscode.workspace.getConfiguration("ccwai").get("contextDepth", 800);
    const payload = extractContext(editor, maxChars);

    await sendContextToExternalProvider(payload);
  } catch (error: any) {
    vscode.window.showErrorMessage(error?.message ?? "Failed to send context.");
  }
}
