# claude-model-switcher

[![npm](https://img.shields.io/npm/v/@blazethan/claude-model-switcher)](https://www.npmjs.com/package/@blazethan/claude-model-switcher)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

> *Interactively switch [Claude Code](https://docs.anthropic.com/en/docs/claude-code) model configurations when using a [CLI Proxy](https://github.com/anthropics/claude-code/blob/main/CLI_PROXY.md).*

[English](./README.md) | [中文](./README.zh-CN.md)

## What it does

- Fetches models from your CLI Proxy's `/v1/models` endpoint in real time
- Lets you switch Claude Code model settings with an arrow-key menu
- Groups models by provider prefix and sorts them by version (newest first)
- Backs up the config before every write and creates it if missing

## Installation

```bash
npm install -g @blazethan/claude-model-switcher
```

### Prerequisites

Make sure `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` are configured before using Claude Code. You can set them either as shell environment variables or in `~/.claude/settings.json` under `env`.

Set these shell environment variables so `cms` can fetch the model list:

```bash
export CLI_PROXY_BASE_URL=http://localhost:8317
export CLI_PROXY_API_KEY=your-api-key
```

## Usage

```bash
cms
```

```
? Opus (current: provider-a/claude-opus-4-6)
  [Skip - keep current]
❯ provider-a (8)  claude-opus-4-7, claude-opus-4-6, claude-sonnet-4-6 +5
  provider-b (6)  claude-opus-4-6, claude-sonnet-4-5, gemini-2.5-pro +3

? Opus (current: provider-a/claude-opus-4-6) — provider-a
❯ provider-a/claude-opus-4-7
  provider-a/claude-opus-4-6  ← current
  provider-a/claude-opus-4-5-20251101

── Summary ──
  Opus: provider-a/claude-opus-4-6 → provider-a/claude-opus-4-7
  Default Model: provider-a/claude-opus-4-6 → provider-a/claude-opus-4-7

? Apply changes? Yes
✓ Settings updated: ~/.claude/settings.json
```

### Model settings

| Variable | Sets |
|---|---|
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku |
| `ANTHROPIC_MODEL` | Default Model |
| `ANTHROPIC_SMALL_FAST_MODEL` | Small / Fast |

## License

[MIT](./LICENSE)
