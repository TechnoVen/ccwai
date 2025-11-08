import path from "path";
import { promises as fs } from "fs";

export interface ThoughtRecord {
  title: string;
  context: string;
  result: string;
}

export interface ThoughtSummary {
  label: string;
  fullPath: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function saveThought(
  workspaceRoot: string,
  record: ThoughtRecord
): Promise<string> {
  const dir = path.join(workspaceRoot, "thoughts", "shared", "extension");
  await fs.mkdir(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:]/g, "-");
  const fileName = `${timestamp}-${slugify(record.title || "context")}.md`;
  const filePath = path.join(dir, fileName);

  const content = [
    `---`,
    `title: ${record.title}`,
    `timestamp: ${new Date().toISOString()}`,
    `---`,
    "",
    "## Context",
    "```",
    record.context,
    "```",
    "",
    "## Result",
    record.result,
  ].join("\n");

  await fs.writeFile(filePath, content, "utf8");
  return filePath;
}

export async function listThoughts(workspaceRoot: string): Promise<ThoughtSummary[]> {
  const dir = path.join(workspaceRoot, "thoughts", "shared", "extension");
  let entries: string[] = [];

  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  return entries
    .filter(entry => entry.endsWith(".md"))
    .map(entry => ({
      label: entry.replace(/\.md$/, ""),
      fullPath: path.join(dir, entry),
    }));
}
