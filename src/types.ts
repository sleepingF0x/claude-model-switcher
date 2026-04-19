export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
}

export interface ModelRole {
  key: string;
  label: string;
  hint: string;
}

export interface Settings {
  [key: string]: unknown;
  env?: Record<string, string>;
}

export interface Change {
  role: ModelRole;
  from: string | undefined;
  to: string;
}
