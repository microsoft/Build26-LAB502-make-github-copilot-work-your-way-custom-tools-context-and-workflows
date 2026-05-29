# Sharing a screenshot with the community

Now that you have a working Space Invaders game, it's time to brag about it. Instead of taking a screenshot manually, opening a browser, finding the file on disk, and uploading it somewhere, you'll let GitHub Copilot do all of that for you, by delegating the entire job to the **web-screenshotter** custom agent that ships with the **space-invaders-makers** plugin.

## Custom agents in Copilot CLI

A **custom agent** is a specialized assistant persona defined by a Markdown file with YAML front matter (you saw the **web-screenshotter.agent.md** file in the previous module). Each agent has:

- A focused **purpose** described in natural language.
- An explicit list of **tools** it is allowed to use (and only those).
- Optionally, its own **MCP servers** that get spun up automatically when the agent runs.
- Optionally, access to **skills** to compose higher-level behaviors.

Why use a subagent instead of asking the main Copilot session to do the work directly?

- **Isolation**: the subagent runs with a clean context and only the tools it needs. The main session doesn't get cluttered with Playwright tool calls, screenshot blobs, or browser automation noise.
- **Reusability**: the same agent works for any URL or local HTML file, not just our game.
- **Predictability**: the agent's instructions encode strict rules (for example: "a screenshot task is not complete until **share-screenshot** succeeds"), so the workflow is more consistent.
- **Composition**: the agent orchestrates an MCP server (Playwright) and a plugin skill (**share-screenshot**) without you needing to know how either of them works.

In short: you describe **what** you want ("screenshot this page and share it"), and the agent figures out **how** to do it.

## Scenario

In this exercise you will enable the **web-screenshotter** agent in your current Copilot CLI session and ask it, in plain English, to capture the running Space Invaders game and share the screenshot with the rest of the community.

1. [] Return to your existing Copilot CLI interactive session (the same one where you generated the game).
2. [] Run `/allow-all on` to enable autopilot mode to ensure we don't need to approve tool use or agent actions while the agent is running.
3. [] Open the agent picker by running:

	`/agent` and press <kbd>Enter</kbd>.

	You should see **Default (current)** and the **web-screenshotter** agent in the list. It became available when you installed the **space-invaders-makers** plugin in module "Installing the community plugin". Either select it by number or use the arrow keys to navigate the list and confirm with <kbd>Enter</kbd>.

4. [] Ask Copilot to take and share a screenshot of your game by simply typing a natural-language prompt like:

	```text
	Take a screenshot of the generated Space Invaders game and share the screenshot. Before taking the screenshot try to start the game.
	```

	Notice how high-level that prompt is. There is **no** mention of Playwright, no URL, no file path, no upload endpoint, and no filename. Because you are in the same session where the game was generated, Copilot already has the file context. You only describe the **outcome** you want. Copilot recognizes that the request matches the **web-screenshotter** agent's description and delegates the job to it. It will also try to start the game first, because you asked for that.

5. [] Watch the agent work. Because the Playwright MCP server is configured **without** the **--headless** flag (see the agent's front matter in the previous module), a real Microsoft Edge window will pop up. You will see the agent:
	- Resolve the path to the generated HTML file in your workspace.
	- Open it in the browser.
	- Try to start the game (for example, by pressing a key or clicking a button — exactly the kind of "interaction before screenshot" step the agent's instructions allow).
	- Capture a full-page screenshot to a temporary file.
	- Immediately invoke the **share-screenshot** skill, which uploads the image to the Lab 502 Community Hub.

	You don't need to babysit any of this. The agent's internal rules require it to verify that sharing actually succeeded before reporting "done".

	You can switch back to the terminal to see the agent's progress and final success message, but feel free to admire the browser automation doing its thing in the meantime (don't close the browser window though, that would cause the agent to fail).

6. [] When the agent finishes, it will report success along with the artifact returned by the Lab 502 Community Hub (typically a confirmation that the screenshot was uploaded). Your screenshot will appear on the **Live Activity Board** displayed on the big screen in the conference room, alongside the other attendees' screenshots. You can also view it directly at <https://bld26lab502.azurewebsites.net/activity>.

> [!NOTE]
> Notice that we never told Copilot **where** the game's HTML file lives on disk. It picked that up from the **context of the current session** — the same session in which you generated the game in the previous module — so the file path is already part of the conversation history. If you ran this exercise from a fresh Copilot session (or after a **/clear**), that context would be gone and you would need to either tell the agent the path explicitly (for example, `Take a screenshot of @C:\Users\LabUser\invaders\index.html and share it`) or let Copilot figure it out on its own by exploring the workspace.

> [!TIP]
> **Optional:** Run `/chronicle` and see the list of options available. Try **/chronicle standup** for a quick summary of what you did. Other subcommands include **/chronicle tips** (personalized usage tips) and **/chronicle improve** (suggests additions to **.github/copilot-instructions.md**). To export the conversation, use `/share file` or `/share gist`.

### What just happened under the hood

The single, vague prompt you typed triggered a small chain of components, all defined declaratively by the plugin:

- The **main Copilot session** matched your request against the description of the enabled **web-screenshotter** agent and delegated the task.
- The **web-screenshotter agent** followed its execution policy: navigate, optionally interact, capture, share, verify.
- The **Playwright MCP server** (started automatically by the agent via **npx @playwright/mcp@latest**) provided the browser automation tools used for navigation and screenshot capture.
- The **share-screenshot skill** was invoked by the agent to upload the resulting image, executing the platform-appropriate script and reporting success or failure via exit code.
- The **plugin hooks** quietly emitted telemetry events (session start, tool use) to the Lab 502 Community Hub while all of this was happening.

This is the power of composing **agents**, **MCP servers**, **skills**, and **hooks** in a single plugin: a one-line natural-language prompt becomes a reliable, multi-step automation that any user can trigger without learning any of the underlying tools.

## Summary and Next Steps

In this module you enabled the **web-screenshotter** custom agent and used a single, plain-English prompt to capture a screenshot of your Space Invaders game and share it to the Lab 502 Community Hub. You saw how a custom agent isolates a specialized workflow, composes an MCP server and a skill, and exposes everything behind a natural-language interface.

In the next module you will explore the broader customizations available in Copilot, beyond the plugin you installed, and learn how to start building your own.

<div class="invis">[← Previous: Generating the Space Invaders game](03-generating-the-space-invaders-game.md) | [Next: Exploring Copilot customizations →](05-exploring-copilot-customizations.md)</div>

## Resources

- [Invoking custom agents in Copilot CLI][copilot-agents]
- [About plugins for GitHub Copilot CLI][copilot-cli-plugins]
- [Playwright MCP server][playwright-mcp]
- [About Model Context Protocol (MCP)][mcp-about]
- [Using the /chronicle command][copilot-chronicle]
- [Playwright documentation][playwright-docs]
- [Creating effective skills][creating-effective-skills]
- [AGENTS.md specification][agents-md-spec]

[copilot-agents]: https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/invoke-custom-agents
[copilot-cli-plugins]: https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins
[playwright-mcp]: https://github.com/microsoft/playwright-mcp
[mcp-about]: https://modelcontextprotocol.io/
[copilot-chronicle]: https://docs.github.com/en/copilot/how-tos/copilot-cli/chronicle#using-the-chronicle-slash-command
[playwright-docs]: https://playwright.dev/docs/intro
[creating-effective-skills]: https://awesome-copilot.github.com/learning-hub/creating-effective-skills/
[agents-md-spec]: https://agents.md/