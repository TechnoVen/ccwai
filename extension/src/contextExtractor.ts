import * as vscode from "vscode";
import path from "path";

export interface ContextPayload {
  workspaceRoot?: string;
  filePath?: string;
  languageId?: string;
  selectedText?: string;
  content: string;
  summary: string;
  timestamp: string;
}

function sanitizeSnippet(snippet: string, maxLength: number): string {
  if (snippet.length <= maxLength) {
    return snippet;
  }

  return `${snippet.slice(0, maxLength)}\n...`;
}

export function extractContext(
  editor: vscode.TextEditor | undefined,
  maxChars: number
): ContextPayload {
  const workspaceFolder = editor?.document
    ? vscode.workspace.getWorkspaceFolder(editor.document.uri)
    : vscode.workspace.workspaceFolders?.[0];

  const workspaceRoot = workspaceFolder?.uri.fsPath;
  const filePath = editor?.document?.fileName;
  const languageId = editor?.document?.languageId;
  const selection = editor && !editor.selection.isEmpty
    ? editor.document.getText(editor.selection)
    : "";

  const contentSource = selection || editor?.document?.getText() || "";
  const content = sanitizeSnippet(contentSource, maxChars);

  const relativeFile = filePath && workspaceRoot
    ? path.relative(workspaceRoot, filePath)
    : filePath || "No file open";

  const summary = [
    `Workspace: ${workspaceRoot ?? "Unknown"}`,
    `File: ${relativeFile}`,
    `Language: ${languageId ?? "n/a"}`,
    selection ? "Context uses current selection." : `Context includes first ${Math.min(maxChars, contentSource.length)} chars from document.`,
  ].join("\n");

  return {
    workspaceRoot,
    filePath,
    languageId,
    selectedText: selection,
    content,
    summary,
    timestamp: new Date().toISOString(),
  };
}

export function formatContextForPrompt(payload: ContextPayload): string {
  const header = [
    "# VS Code Context Snapshot",
    payload.summary,
    `Timestamp: ${payload.timestamp}`,
    "",
    "# Content",
  ];

  return [...header, payload.content].join("\n");
}
