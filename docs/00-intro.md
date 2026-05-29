# Welcome to LAB502 — Make it your own: build, share, and customize with GitHub Copilot

In this lab you will go from an empty workspace to a working **Space Invaders** game built end-to-end with **GitHub Copilot**, share your creation with the rest of the room through a community plugin, and then walk through the customization primitives Copilot exposes: instructions, skills, agents, hooks, MCP servers, plugins, and prompt files.

## What you will learn

- How to drive Copilot from the **CLI** and from **Visual Studio Code**.
- How to use **plan mode** to design a non-trivial task before writing any code.
- How a **plugin** bundles skills, agents, hooks, MCP server configurations, and other Copilot capabilities into a single, installable package.
- How to apply the right **customization primitive** to the right problem:
	- **Custom instructions** for always-on project rules.
	- **Prompt files** for repeatable, on-demand slash commands.
	- **Skills** for multi-step workflows the agent invokes by intent or that users run as slash commands.
	- **Custom agents**, **hooks**, and **MCP servers** for everything around them.

## Lab flow

1. **Set up** your environment and sign in to the GitHub Copilot CLI.
2. **Install** the **space-invaders-makers** plugin from the community marketplace.
3. **Generate** the game in a single self-contained HTML file using plan mode.
4. **Share** a screenshot of your game with the community using the plugin's custom agent.
5. **Tour** the customization view in Visual Studio Code.
6. **Author** your own repository custom instructions and an agent skill.

> [!TIP]
> Looking for inspiration before you generate your own game? Browse the [Space Invaders sample gallery](../src/game-samples/README.md) for one-shot Copilot-generated variants with screenshots.

## Bonus flow

If you finish early, the bonus modules continue the same story:

1. **Use Copilot cloud agent** to apply your repository customizations from GitHub.
2. **Connect a remote MCP server** directly in Visual Studio Code and use its Community Hub tools.
3. **Create a reusable prompt** as an on-demand slash command.

> [!NOTE]
> GitHub Copilot uses Large Language Models (LLMs), which generate responses probabilistically rather than deterministically. The exact suggestions, code, and interactions you see may differ from what's shown in these instructions. This is normal and expected. Use your best judgment to adapt the suggestions to your needs, and iterate with Copilot when the first answer isn't quite right.

Ready? Let's get started.

[Next: Setting up the environment →](01-setting-up-the-environment.md)

## Resources

- [GitHub Copilot documentation][github-copilot-docs]
- [Awesome GitHub Copilot Learning Hub][awesome-copilot-learning-hub]
- [GitHub Copilot terminology glossary][copilot-glossary]
- [What are Agents, Skills, and Instructions][agents-skills-instructions]

[github-copilot-docs]: https://docs.github.com/en/copilot
[awesome-copilot-learning-hub]: https://awesome-copilot.github.com/learning-hub/
[copilot-glossary]: https://awesome-copilot.github.com/learning-hub/github-copilot-terminology-glossary/
[agents-skills-instructions]: https://awesome-copilot.github.com/learning-hub/what-are-agents-skills-instructions/
