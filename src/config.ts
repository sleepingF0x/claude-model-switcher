import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Settings, Change, ModelRole } from "./types.js";

const SETTINGS_PATH = join(homedir(), ".claude", "settings.json");
const BACKUP_PATH = `${SETTINGS_PATH}.bak`;

export function getSettingsPath(): string {
  return SETTINGS_PATH;
}

export async function readSettings(): Promise<Settings> {
  if (!existsSync(SETTINGS_PATH)) {
    return {};
  }
  const content = await readFile(SETTINGS_PATH, "utf-8");
  return JSON.parse(content) as Settings;
}

export async function writeSettings(
  settings: Settings,
  changes: readonly Change[],
): Promise<void> {
  const dir = join(homedir(), ".claude");
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  if (existsSync(SETTINGS_PATH)) {
    await copyFile(SETTINGS_PATH, BACKUP_PATH);
  }

  const env: Record<string, string> = {
    ...(settings.env ?? {}),
  };
  for (const change of changes) {
    env[change.role.key] = change.to;
  }

  const updated: Settings = { ...settings, env };
  await writeFile(SETTINGS_PATH, JSON.stringify(updated, null, 2) + "\n");
}

export function getCurrentModel(
  settings: Settings,
  role: ModelRole,
): string | undefined {
  return settings.env?.[role.key];
}
