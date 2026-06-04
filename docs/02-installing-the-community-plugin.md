# Installing the community plugin

## What are Plugins?

Plugins are distributable packages that extend GitHub Copilot's capabilities by bundling customization primitives such as skills, custom agents, lifecycle hooks, MCP server configurations, scripts, and other integrations. They're discoverable and installable from marketplaces, which makes a curated workflow easy to share while still keeping version and workspace settings under your control.

Plugins enable easy discovery and installation, promote reusability across projects, standardize domain expertise across teams, and encapsulate complex integrations into manageable packages.

## Scenario

In this exercise, GitHub Copilot CLI is already running in **interactive mode**: a back-and-forth, chat-like session where you ask Copilot questions or give it tasks and it responds within the same persistent session. This is the default mode when you launch Copilot CLI.

Non-interactive mode is different: you pass a single prompt directly on the command line, such as **copilot -p "what is copilot interactive mode"**, and get a response without entering a session. That is useful for automation and scripting. Interactive mode is better for this lab because it keeps context across turns, so you can iterate and build on previous prompts.

You'll use the **/plugin** slash commands to register a plugin marketplace and install a plugin from it.

1.  Return to your existing Copilot CLI interactive session.
2.  List the marketplaces that are already registered:

	`/plugin marketplace list`

	You will see the built-in marketplaces **github/copilot-cli-plugins** and **github/awesome-copilot**.

3.  Add the **community-hub** marketplace by running:

	`/plugin marketplace add microsoft/Build26-LAB502-make-github-copilot-work-your-way-custom-tools-context-and-workflows`

4.  List the plugins available in that marketplace:

	`/plugin marketplace browse community-hub`

	You should see the list of plugins published in the **community-hub** marketplace. There is a single plugin: **space-invaders-makers**.

5.  Install the **space-invaders-makers** plugin by running:

	`/plugin install space-invaders-makers@community-hub`

6.  Verify what the plugin installed by running the `/plugin list` slash command.

	You should see **space-invaders-makers@community-hub** on the list of installed plugins.

7.  Run `/quit` to exit the Copilot CLI session.

8.  You will return to the shell prompt.


> [!WARNING]
> Skills from plugins can run third-party code on your behalf, so it's worth giving them a quick review before enabling. Two things to keep in mind: bundled **scripts** run with your shell's permissions, and **SKILL.md** is read by the agent, so it can contain instructions that steer the agent in unintended directions. Prefer skills from sources you trust, and review **SKILL.md** plus any bundled scripts before installing.

We are good to go. We will talk about the plugin details later.

## Summary and Next Steps

You've successfully connected Copilot CLI to a community marketplace, browsed plugins, and installed the **space-invaders-makers** plugin with its agent, skill, and hooks. Next, you'll use the Plan capability to design and start building your Space Invaders game.

<div class="invis">[← Previous: Setting up the environment](01-setting-up-the-environment.md) | [Next: Generating the Space Invaders game →](03-generating-the-space-invaders-game.md)</div>

## Resources

- [About plugins for GitHub Copilot CLI][copilot-cli-plugins]
- [Finding and installing plugins for GitHub Copilot CLI][copilot-cli-install]
- [Plugins in Visual Studio Code][vscode-agent-plugins]
- [copilot-plugins marketplace][copilot-plugins-marketplace]
- [awesome-copilot][awesome-copilot-marketplace]
- [Installing and using plugins][awesome-copilot-plugins]

[vscode-agent-plugins]: https://code.visualstudio.com/docs/copilot/customization/agent-plugins
[copilot-cli-plugins]: https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins
[copilot-cli-install]: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing
[copilot-plugins-marketplace]: https://github.com/github/copilot-plugins
[awesome-copilot]: https://github.com/github/awesome-copilot
[awesome-copilot-plugins]: https://awesome-copilot.github.com/learning-hub/installing-and-using-plugins/
