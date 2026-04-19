import { select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import type { ModelRole, Change } from "./types.js";

const SKIP_VALUE = "__skip__";
const BACK_VALUE = "__back__";

interface ModelGroup {
  prefix: string;
  models: string[];
}

interface SelectionMemory {
  topLevelValue?: string;
  modelValue?: string;
}

const selectionMemory: SelectionMemory = {};

function parseModel(modelId: string): { family: string; version: number[]; date: number } {
  const name = modelId.includes("/") ? modelId.split("/").slice(1).join("/") : modelId;
  const segments = name.split("-");

  let familyEnd = 0;
  for (let i = 0; i < segments.length; i++) {
    if (/^\d/.test(segments[i])) break;
    familyEnd = i + 1;
  }

  const family = segments.slice(0, familyEnd).join("-") || name;
  const versionPart = segments.slice(familyEnd).join("-");
  const matches = versionPart.match(/\d+(\.\d+)?/g);
  const numbers = matches?.map(Number) ?? [];

  const version: number[] = [];
  let date = 0;
  for (const n of numbers) {
    if (n >= 10_000_000) {
      date = n;
    } else {
      version.push(n);
    }
  }

  return { family, version, date };
}

function compareVersionsDesc(a: string, b: string): number {
  const pa = parseModel(a);
  const pb = parseModel(b);

  const familyCmp = pa.family.localeCompare(pb.family);
  if (familyCmp !== 0) return familyCmp;

  const len = Math.max(pa.version.length, pb.version.length);
  for (let i = 0; i < len; i++) {
    const diff = (pb.version[i] ?? 0) - (pa.version[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return pb.date - pa.date;
}

interface GroupedModels {
  ungrouped: string[];
  groups: ModelGroup[];
}

function groupByPrefix(models: readonly string[]): GroupedModels {
  const groups = new Map<string, string[]>();
  const ungrouped: string[] = [];

  for (const id of models) {
    const slashIdx = id.indexOf("/");
    if (slashIdx < 0) {
      ungrouped.push(id);
    } else {
      const prefix = id.slice(0, slashIdx);
      const list = groups.get(prefix) ?? [];
      list.push(id);
      groups.set(prefix, list);
    }
  }

  return {
    ungrouped: ungrouped.sort(compareVersionsDesc),
    groups: Array.from(groups.entries())
      .map(([prefix, models]) => ({
        prefix,
        models: models.sort(compareVersionsDesc),
      }))
      .sort((a, b) => a.prefix.localeCompare(b.prefix)),
  };
}

function hintRelevance(models: readonly string[], hint: string): string[] {
  if (!hint) return [...models].sort(compareVersionsDesc);
  return [...models].sort((a, b) => {
    const aMatch = a.toLowerCase().includes(hint.toLowerCase());
    const bMatch = b.toLowerCase().includes(hint.toLowerCase());
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return compareVersionsDesc(a, b);
  });
}

export async function selectModelForRole(
  role: ModelRole,
  models: readonly string[],
  currentValue: string | undefined,
): Promise<string | null> {
  const { ungrouped, groups } = groupByPrefix(models);

  const header = currentValue
    ? `${role.label} ${chalk.dim(`(current: ${currentValue})`)}`
    : `${role.label} ${chalk.dim("(not set)")}`;

  if (groups.length === 0) {
    return selectFromFlatList(ungrouped, header, role.hint, currentValue);
  }

  while (true) {
    const choices: { name: string; value: string }[] = [
      { name: chalk.dim("[Skip - keep current]"), value: SKIP_VALUE },
    ];

    for (const g of groups) {
      const sorted = hintRelevance(g.models, role.hint);
      const preview = sorted.slice(0, 3).join(", ");
      const more = g.models.length > 3 ? ` +${g.models.length - 3}` : "";
      choices.push({
        name: `${chalk.bold(g.prefix)} ${chalk.dim(`(${g.models.length})`)}  ${chalk.dim(preview + more)}`,
        value: `__group__${g.prefix}`,
      });
    }

    const sortedUngrouped = hintRelevance(ungrouped, role.hint);
    for (const id of sortedUngrouped) {
      choices.push({
        name: id === currentValue ? `${id}  ${chalk.cyan("← current")}` : id,
        value: id,
      });
    }

    const picked = await select({
      message: header,
      choices,
      loop: false,
      default: selectionMemory.topLevelValue,
    });

    if (picked === SKIP_VALUE) {
      selectionMemory.topLevelValue = picked;
      return null;
    }

    selectionMemory.topLevelValue = picked;

    if (picked.startsWith("__group__")) {
      const prefix = picked.slice("__group__".length);
      const group = groups.find((g) => g.prefix === prefix)!;
      const result = await selectFromGroup(group, header, role.hint, currentValue);
      if (result === BACK_VALUE) continue;
      return result;
    }

    return picked;
  }
}

async function selectFromFlatList(
  models: readonly string[],
  header: string,
  hint: string,
  currentValue: string | undefined,
): Promise<string | null> {
  const sorted = hintRelevance([...models], hint);

  const choices = [
    { name: chalk.dim("[Skip - keep current]"), value: SKIP_VALUE },
    ...sorted.map((id) => ({
      name: id === currentValue ? `${id}  ${chalk.cyan("← current")}` : id,
      value: id,
    })),
  ];

  const answer = await select({
    message: header,
    choices,
    loop: false,
    default: selectionMemory.modelValue,
  });
  if (answer === SKIP_VALUE) {
    selectionMemory.modelValue = answer;
    return null;
  }
  selectionMemory.modelValue = answer;
  return answer;
}

async function selectFromGroup(
  group: ModelGroup,
  header: string,
  hint: string,
  currentValue: string | undefined,
): Promise<string | null | typeof BACK_VALUE> {
  const sorted = hintRelevance(group.models, hint);

  const choices = [
    { name: chalk.dim("[Skip - keep current]"), value: SKIP_VALUE },
    { name: chalk.dim("[← Back to groups]"), value: BACK_VALUE },
    ...sorted.map((id) => ({
      name: id === currentValue ? `${id}  ${chalk.cyan("← current")}` : id,
      value: id,
    })),
  ];

  const answer = await select({
    message: `${header} — ${chalk.bold(group.prefix)}`,
    choices,
    loop: false,
    default: selectionMemory.modelValue,
  });

  if (answer === SKIP_VALUE) {
    selectionMemory.modelValue = answer;
    return null;
  }
  if (answer === BACK_VALUE) return BACK_VALUE;
  selectionMemory.modelValue = answer;
  return answer;
}

export async function showSummaryAndConfirm(
  changes: readonly Change[],
): Promise<boolean> {
  if (changes.length === 0) {
    console.log(chalk.yellow("\nNo changes selected."));
    return false;
  }

  console.log(chalk.bold("\n── Summary ──"));
  for (const c of changes) {
    const from = c.from ?? chalk.dim("(not set)");
    console.log(`  ${c.role.label}: ${from} → ${chalk.green(c.to)}`);
  }
  console.log();

  return confirm({ message: "Apply changes?", default: true });
}
