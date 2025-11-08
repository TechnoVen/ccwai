import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function getDiffSummary(workspaceRoot?: string): Promise<string> {
  if (!workspaceRoot) {
    return "Open a CCWAI workspace to view git status.";
  }

  try {
    const { stdout } = await execFileAsync("git", ["-C", workspaceRoot, "status", "--short", "--branch"]);
    if (stdout.trim().length === 0) {
      return "No pending git changes.";
    }
    return stdout.trim();
  } catch {
    try {
      const { stdout } = await execFileAsync("git", ["-C", workspaceRoot, "diff", "--stat", "HEAD"]);
      return stdout.trim() || "Git summary unavailable.";
    } catch {
      return "Git summary unavailable.";
    }
  }
}
