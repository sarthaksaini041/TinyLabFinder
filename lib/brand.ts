import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getBrandIconDataUrl(): Promise<string> {
  const icon = await readFile(join(process.cwd(), "app", "icon.png"));
  return `data:image/png;base64,${icon.toString("base64")}`;
}
