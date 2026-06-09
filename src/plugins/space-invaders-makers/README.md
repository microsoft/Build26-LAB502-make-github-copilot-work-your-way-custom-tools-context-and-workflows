# Space Invaders Community Plugin

The Space Invaders Community plugin connects GitHub Copilot activity from the Lab 502 workspace to the Lab 502 Community Hub. It records lab activity through hooks and provides a screenshot workflow for capturing web pages and sharing the resulting images with the hub.

## What It Includes

- Activity hooks for session start, user prompts, tool use, agent stop, and subagent stop events.
- A `share-screenshot` skill that uploads an image file to the Lab 502 Community Hub.
- A `web-screenshotter` agent that captures web page screenshots with Playwright and shares them through the screenshot skill.
- An HTML language server configuration for `.html` and `.htm` files.
- Cross-platform Bash and PowerShell scripts for Linux, macOS, and Windows lab environments.

## Plugin Layout

```text
space-invaders-community-plugin/
├── plugin.json
├── agents/
│   └── web-screenshotter.agent.md
├── hooks/
│   └── hooks.json
├── scripts/
│   ├── agent-stop.sh / agent-stop.ps1
│   ├── session-start.sh / session-start.ps1
│   ├── subagent-stop.sh / subagent-stop.ps1
│   ├── tool-used.sh / tool-used.ps1
│   └── user-prompt-submitted.sh / user-prompt-submitted.ps1
└── skills/
    └── share-screenshot/
        ├── SKILL.md
        └── scripts/
            └── share-screenshot.sh / share-screenshot.ps1
```

## Configuration

The skills sends events and screenshots to the Lab 502 Community Hub. By default, it uses:

```text
http://localhost:1345
```

To point the plugin at a different hub instance, set one of these environment variables before starting VS Code:

```bash
export LAB502_DASHBOARD_URL="https://your-community-hub.example.com"
```

or:

```bash
export DASHBOARD_URL="https://your-community-hub.example.com"
```

`LAB502_DASHBOARD_URL` takes precedence over `DASHBOARD_URL` when both are set.

## Hooks

The hook definitions live in `hooks/hooks.json` and call the matching script for the current platform.

| Hook | Purpose |
| --- | --- |
| `SessionStart` | Sends the Copilot session id and user identity to `/api/event/session_start`. |
| `UserPromptSubmit` | Reports prompt submission activity to the hub. |
| `PostToolUse` | Sends the session id and tool name to `/api/event/tool_used`. |
| `Stop` | Reports agent stop activity to the hub. |
| `SubagentStop` | Reports subagent stop activity to the hub. |

Hook calls are intentionally non-blocking where possible. If the hub is temporarily unavailable, the lab workflow should continue.

## Screenshot Sharing

The `share-screenshot` skill uploads an existing image file to the Community Hub image endpoint.

The upload succeeds when the script exits with code `0`. A missing file, missing path, network failure, or non-2xx response is reported as an error.

## Web Screenshotter Agent

The `web-screenshotter` agent is designed for requests such as capturing and sharing screenshots from one or more web pages. It uses Playwright through the `@playwright/mcp` MCP server, captures a full-page screenshot, and then invokes the `share-screenshot` skill.

The agent treats sharing as part of the task. A screenshot request is complete only after the image has been successfully uploaded to the hub.

## Requirements

- GitHub Copilot with agent/plugin support enabled for this lab environment.
- `curl` for upload and event scripts.
- `jq` for the Bash hook scripts.
- PowerShell for Windows hook and upload scripts.
- Node.js/npm when using the `web-screenshotter` agent, because it runs `npx -y @playwright/mcp@latest`.
