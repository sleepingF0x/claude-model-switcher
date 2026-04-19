# claude-model-switcher

[![npm](https://img.shields.io/npm/v/@blazethan/claude-model-switcher)](https://www.npmjs.com/package/@blazethan/claude-model-switcher)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

> *使用 [CLI Proxy](https://github.com/anthropics/claude-code/blob/main/CLI_PROXY.md) 时，交互式切换 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 的模型配置。*

[English](./README.md) | 中文

## 功能

- 实时从 CLI Proxy 的 `/v1/models` 接口拉取可用模型
- 用方向键菜单切换 Claude Code 的模型设置，无需手动编辑 JSON
- 模型按提供商前缀分组，组内按版本号从高到低排列
- 写入前自动备份；配置文件不存在时自动创建

## 安装

```bash
npm install -g @blazethan/claude-model-switcher
```

### 前置条件

在使用 Claude Code 前，请先配置好 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。你可以把它们写到 shell 环境变量里，也可以写到 `~/.claude/settings.json` 的 `env` 中。

设置以下 shell 环境变量，供 `cms` 拉取模型列表：

```bash
export CLI_PROXY_BASE_URL=http://localhost:8317
export CLI_PROXY_API_KEY=your-api-key
```

## 使用

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

### 设置的模型

| 环境变量 | 设置项 |
|---|---|
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku |
| `ANTHROPIC_MODEL` | 默认模型 |
| `ANTHROPIC_SMALL_FAST_MODEL` | 轻量 / 快速模型 |

## 许可证

[MIT](./LICENSE)
