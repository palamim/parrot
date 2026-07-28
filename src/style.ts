import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_STYLE_FILENAME = "parrot.style.md";

export function loadStyleGuide(explicitPath?: string): string | null {
  const path = resolve(
    explicitPath ?? process.env.PARROT_STYLE_FILE ?? DEFAULT_STYLE_FILENAME,
  );
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8").trim();
  return content.length > 0 ? content : null;
}
