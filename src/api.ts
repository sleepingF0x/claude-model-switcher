import type { ModelsResponse } from "./types.js";

export async function fetchModels(
  baseUrl: string,
  apiKey: string,
): Promise<string[]> {
  const url = `${baseUrl.replace(/\/+$/, "")}/v1/models`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch models: ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as ModelsResponse;
  return body.data.map((m) => m.id).sort();
}
