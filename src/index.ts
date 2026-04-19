#!/usr/bin/env node

import chalk from "chalk";
import { fetchModels } from "./api.js";
import { readSettings, writeSettings, getCurrentModel, getSettingsPath } from "./config.js";
import { selectModelForRole, showSummaryAndConfirm } from "./prompt.js";
import type { ModelRole, Change } from "./types.js";

const MODEL_ROLES: readonly ModelRole[] = [
  { key: "ANTHROPIC_DEFAULT_OPUS_MODEL", label: "Opus", hint: "opus" },
  { key: "ANTHROPIC_DEFAULT_SONNET_MODEL", label: "Sonnet", hint: "sonnet" },
  { key: "ANTHROPIC_DEFAULT_HAIKU_MODEL", label: "Haiku", hint: "haiku" },
  { key: "ANTHROPIC_MODEL", label: "Default Model", hint: "" },
  { key: "ANTHROPIC_SMALL_FAST_MODEL", label: "Small/Fast Model", hint: "haiku" },
];

async function main(): Promise<void> {
  const baseUrl = process.env.CLI_PROXY_BASE_URL;
  const apiKey = process.env.CLI_PROXY_API_KEY;

  if (!baseUrl) {
    console.error(chalk.red("Error: CLI_PROXY_BASE_URL environment variable is not set."));
    process.exit(1);
  }
  if (!apiKey) {
    console.error(chalk.red("Error: CLI_PROXY_API_KEY environment variable is not set."));
    process.exit(1);
  }

  console.log(chalk.dim(`Fetching models from ${baseUrl}/v1/models ...`));

  let models: string[];
  try {
    models = await fetchModels(baseUrl, apiKey);
  } catch (err) {
    console.error(chalk.red(`Failed to fetch models: ${err instanceof Error ? err.message : err}`));
    process.exit(1);
  }

  console.log(chalk.dim(`Found ${models.length} models.\n`));

  const settings = await readSettings();
  const changes: Change[] = [];

  for (const role of MODEL_ROLES) {
    const current = getCurrentModel(settings, role);
    const selected = await selectModelForRole(role, models, current);

    if (selected !== null && selected !== current) {
      changes.push({ role, from: current, to: selected });
    }
  }

  const confirmed = await showSummaryAndConfirm(changes);
  if (!confirmed) {
    console.log(chalk.dim("Aborted."));
    return;
  }

  await writeSettings(settings, changes);
  console.log(chalk.green(`✓ Settings updated: ${getSettingsPath()}`));
}

main().catch((err) => {
  if (err instanceof Error && err.name === "ExitPromptError") {
    console.log(chalk.dim("\nAborted."));
    process.exit(0);
  }
  console.error(chalk.red(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
