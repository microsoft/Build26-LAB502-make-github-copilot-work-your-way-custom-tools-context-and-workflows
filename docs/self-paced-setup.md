# Getting Started in Your Own Environment

This guide covers everything you need to run LAB502 at your own pace, outside of a guided lab session.

## Prerequisites

Install the following before you begin:

| Prerequisite | Why it's needed |
|:-------------|:----------------|
| [Node.js](https://nodejs.org/) (LTS) | Required to run the Playwright MCP server via `npx`. The web-screenshotter agent launches it automatically — Node.js just needs to be on your PATH. |
| [Git](https://git-scm.com/) | The lab starts by initializing a Git repository. GitHub Copilot CLI also uses Git to offer features like change rewinding. |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli) | The primary tool for the first half of the lab. Used to interact with Copilot from the terminal, install plugins, and generate the game. |
| [Visual Studio Code](https://code.visualstudio.com/) | Used in the second half of the lab to explore the Agent Customizations view, author instructions, and create skills. |
| [.NET 10 SDK](https://dotnet.microsoft.com/download) | Required to build and run the Community Hub backend locally. The lab uses it to receive plugin telemetry and host the Invaders Gallery. |
| Active [GitHub Copilot subscription](https://github.com/features/copilot) | Required to authenticate and use GitHub Copilot CLI and Copilot Chat in Visual Studio Code. |

## Running the Community Hub locally

The Community Hub is an ASP.NET Core service that acts as the lab's shared backend. It receives telemetry events from the plugin hooks, stores uploaded screenshots and game HTML files, hosts the Invaders Gallery, and exposes an MCP server at `/mcp` that agents can query.

To start it in local mode (in-memory storage, no Azure dependencies):

```bash
cd src/community-hub
dotnet run --project CommunityHub/CommunityHub.csproj
```

Once running, the Community Hub is available at `http://localhost:5119` by default. Key endpoints:

| Endpoint | Description |
|:---------|:------------|
| `/activity` | Live Activity Board — shows plugin events as they arrive |
| `/gallery` | Invaders Gallery — browse games uploaded during the lab |
| `/api/openapi.json` | OpenAPI spec used by the share-game skill |
| `/mcp` | MCP server — used in the bonus module for direct agent access |

> [!NOTE]
> In guided lab sessions, a shared cloud instance of the Community Hub is provided so all attendees share a single activity board and gallery. When running locally, your instance is private to your machine.

> [!NOTE]
> The Community Hub is a lightweight lab experience for local or workshop telemetry. For a production observability pattern, see [Monitor AI coding agents with Grafana](https://learn.microsoft.com/en-us/azure/managed-grafana/grafana-opentelemetry-app-insights), which shows how to collect OpenTelemetry from AI coding agents, send it to Application Insights, and visualize usage, latency, errors, model activity, and tool calls in Grafana dashboards.

## Browser configuration for screenshot sharing

The **web-screenshotter** agent uses the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) to capture screenshots. By default it launches **Microsoft Edge** (`msedge`).

If Microsoft Edge is not installed on your machine, you will need to configure the agent to use a browser you have installed.

### Option 1: Patch the installed agent

After installing the plugin, the agent file is written to your local Copilot plugins directory. You can edit it directly:

- **Windows:** `%USERPROFILE%\.copilot\installed-plugins\space-invaders-makers\agents\web-screenshotter.agent.md`
- **macOS/Linux:** `~/.copilot/installed-plugins/space-invaders-makers/agents/web-screenshotter.agent.md`

In that file, find the `--browser` arguments and replace `msedge` with your preferred browser (`chrome`, `firefox`, or `webkit` for Safari):

```yaml
args: ['-y', '@playwright/mcp@latest', '--allow-unrestricted-file-access', '--browser', 'chrome']
```

> [!NOTE]
> This change affects the installed plugin copy only. It will be overwritten if you reinstall or update the plugin.

### Option 2: Create a local override (recommended)

Create a copy of the [agent source file](../src/plugins/space-invaders-makers/agents/web-screenshotter.agent.md) in your workspace's `.github/agents/` folder and give it a **different name** so it coexists with the plugin-installed agent. For example, you could name it `my-web-screenshotter.agent.md`:

> [!NOTE]
> The workspace (`invaders/` directory) is created in [module 01 — Setting up the environment](01-setting-up-the-environment.md). Apply this step after completing module 01 and before module 04, where the web-screenshotter agent is first used for screenshot sharing.

Then open `.github/agents/my-web-screenshotter.agent.md` and make two changes:

1. Update the `name:` field in the frontmatter to match the new filename (without the `.agent.md` extension):

   ```yaml
   name: my-web-screenshotter
   ```

2. Update the `--browser` argument to your preferred browser (`chrome`, `firefox`, or `webkit` for Safari):

   ```yaml
   args: ['-y', '@playwright/mcp@latest', '--allow-unrestricted-file-access', '--browser', 'chrome']
   ```

Workspace-scoped agents (in `.github/agents/`) are picked up automatically by Copilot CLI and Visual Studio Code. Your custom copy persists across plugin updates, and the original `web-screenshotter` from the plugin remains available unchanged.

## Start the lab

Once your prerequisites are installed and the Community Hub is running, navigate to the [introduction](00-intro.md) to begin.
