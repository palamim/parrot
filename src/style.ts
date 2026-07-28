import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_STYLE_FILENAME = "parrot.style.md";

function styleFilePath(explicitPath?: string): string {
  return resolve(explicitPath ?? process.env.PARROT_STYLE_FILE ?? DEFAULT_STYLE_FILENAME);
}

export function loadStyleGuide(explicitPath?: string): string | null {
  const path = styleFilePath(explicitPath);
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8").trim();
  return content.length > 0 ? content : null;
}

/** Overwrites the style guide file. This is the curator's only write path — see curator.ts. */
export function saveStyleGuide(content: string, explicitPath?: string): void {
  writeFileSync(styleFilePath(explicitPath), content.trim() + "\n", "utf-8");
}
