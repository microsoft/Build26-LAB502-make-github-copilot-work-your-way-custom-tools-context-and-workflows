# Creating a reusable agent skill

In the previous module you captured **always-on** project rules with a **copilot-instructions.md** file. **Agent skills** are the next step up the customization ladder: they package a **multi-step workflow** (including the scripts that execute it) so the agent can invoke it whenever the task matches, without the user having to remember a slash command. Skills can still be called explicitly with slash commands when you want that control.

## Agent skills

An **agent skill** is a folder containing a **SKILL.md** file and, optionally, helper scripts, references, templates, or other assets. The Markdown body is plain natural-language instructions: when the skill applies, what steps to follow, and what success looks like. The YAML front matter at the top (**name** and especially **description**) is what Copilot matches against when deciding whether the skill is relevant to the current prompt.

Where the skill folder lives determines who can use it:

- **Project skills** live in the repository under **.github/skills/<skill-name>/** (Copilot also recognizes **.claude/skills/** and **.agents/skills/**). Anyone working in the repo gets them automatically.
- **Personal skills** live in your home directory under **~/.copilot/skills/<skill-name>/** (also **~/.claude/skills/** or **~/.agents/skills/**) and follow you across every project.
- **Plugin skills** can be bundled in an agent plugin (this is exactly how **share-screenshot** reached your workspace in module "Sharing a screenshot with the community").

The piece that makes agent skills more powerful than prompts is that a skill can **ship code alongside the instructions**. The **SKILL.md** can tell the agent to run a script (anything that can be executed on the machine, for example **bash**, **PowerShell**, or **python**) that lives next to it in the skill folder, to call an API, hit the file system, talk to a CLI, or do anything else a shell can do. The model decides *when* to invoke the skill; the script gives you a deterministic *how*.

Agent skills are primarily **triggered by intent** (Copilot picks them up when the user's request matches the **description**), but Copilot also exposes available skills as **slash commands** in the chat input. That means you can still invoke a skill explicitly with **/<skill-name>** when you want to force it, which is handy for testing and for power users who already know the skill's name.

The Agent Skills format is an **open standard** shared across multiple AI systems, so the same **SKILL.md** shape works in GitHub Copilot, the Copilot CLI, and other compatible agents.

Why this matters:

- **Triggered by intent, not by name**: unlike prompts, you don't (need to) run **/share-screenshot**. You say "share this screenshot" in plain English, and Copilot picks the matching skill on its own based on the **description**.
- **Encapsulation**: the instructions, the scripts, and any supporting files live together in one folder, so the workflow is self-contained and easy to share.
- **Determinism where it counts**: scripts handle the parts that must be exact (HTTP calls, file moves, validation), while the agent handles the conversational and decision-making parts.
- **Reusability**: once a skill is in the project (or in an installed plugin), every contributor, every agent, and every Copilot session can use it without setup.

A weak agent skill has a vague **description** (so Copilot never picks it) or stuffs business logic into the Markdown that should live in a script. A strong one has a **precise, intent-rich description**, a short list of **clear steps**, and delegates deterministic work to small, focused scripts. Keep **SKILL.md** lean; put long reference material in **references/**, reusable templates in **assets/**, and executable logic in **scripts/**.

> [!TIP]
> To make this exercise possible, we have published an **OpenAPI specification** for the Invaders Gallery's upload API at <http://localhost:1345/api/openapi.json>. The agent can read that spec to discover the correct endpoint, HTTP method, request shape, and constraints, with no guessing or scraping required, so there is no need to describe API details when building the skill.

> [!NOTE]
> Skills are not only for writing code or creating files. They can also give the agent structured guidance for complex decisions, reviews, or operational workflows. For example, the [**secret-scanning** skill][secret-scanning-skill] from Awesome Copilot guides Copilot through when to use secret scanning, how to configure push protection and custom patterns, how to triage alerts, and when to use the Advanced Security plugin for pre-commit scanning.

## Scenario

You will build a project agent skill that lets anyone submit their generated Space Invaders game to the Invaders Gallery, just by asking Copilot to do so. Rather than writing the **SKILL.md** (and its script) by hand, you'll use the built-in `/create-skill` skill command to scaffold it.

1.  Switch to **Visual Studio Code** (the same window where you have been working on the game).
2.  Open the **Copilot Chat** view if it isn't already visible (click the Copilot icon in the Activity Bar, or press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd>). Make sure the chat is in **Agent** mode.
3.  Start a **new chat session** by clicking the **+** icon at the top of the Copilot Chat view, so the previous conversation's context doesn't leak into the skill wizard.
4.  Close any open files in the editor to give Copilot a clean slate.
5.  In the chat input, run the **/create-skill** slash command. As a suggestion, paste the following:

```text
/create-skill Create a project agent skill that allows submitting a generated Space Invaders game. The user asks to upload a copy of their game and specifies a display name and the HTML filename that contains the source (max size 200KB). The skill must include cross-platform helper scripts (bash and PowerShell) that perform the actual HTTP upload using the API described in the OpenAPI spec at http://localhost:1345/api/openapi.json  the SKILL.md should instruct the agent to run the appropriate script rather than making the HTTP call inline.
```

6.  Copilot may ask a couple of clarifying questions (for example which scripting language to use, where to store the skill, or how to handle the file-size limit) or permission to run tools. Answer them, and let it propose the agent skill in a diff view.

> [!TIP]
> Visual Studio Code may prompt you to allow access to specific files or folders. Click **Allow** when prompted so Copilot can create the skill files in the right location.

7.  Review the proposed agent skill. It should:

	- Live under the workspace so the whole team gets it.
	- Have a **SKILL.md** with YAML front matter declaring at least a **name** and an **intent-rich description** (so the agent picks it up when a user says "share my game", "upload to the gallery", and so on).
	- Clearly state the **inputs** the user must provide: the **display name** of the game and the **HTML filename** that contains the source.
	- Enforce the **200 KB maximum size** for the uploaded file.
	- Reference the API endpoint at <http://localhost:1345/> so the upload targets the correct endpoint and request shape.
	- Include a small helper **script** next to **SKILL.md** that performs the actual HTTP upload, with the **SKILL.md** instructing the agent to invoke it.

8.  Click **Keep** to accept the file(s) or tweak/refine them as needed and then accept.

> [!TIP]
> Two things make an agent skill punch above its weight:
>
> - **A precise description**. This is what Copilot matches against the user's prompt to decide whether to invoke the skill. Vague descriptions ("uploads things") are skipped; intent-rich ones ("submit a generated Space Invaders game to the Invaders Gallery") get picked reliably.
> - **Pushing deterministic work into a script.** Let the Markdown describe *what* and *when*; let the script handle *how*. That keeps the agent honest about file sizes, endpoints, and error handling, instead of improvising on every run.

### Trying the agent skill

Now invoke the agent skill the way a real user would: by **asking in plain English**, with no slash command.

1.  In the Copilot Chat input, start a new chat (click the **+** icon at the top of the chat view) so the previous context doesn't leak in.
2.  Close any open files in the editor to give Copilot a clean slate.
3.  Ask Copilot to share your game, for example:

```text
Upload my game to the Invaders Gallery. The file is #index.html and the name is "Your Name's Space Invaders".
```

Replace **Your Name** with your actual name so your entry is unique in the gallery and "fix" **#index.html** if you named your file differently.

4.  Copilot should recognize the intent, pick up your new agent skill (matching its **description**), and walk through its steps: verifying the file exists, checking it is under 200 KB, and calling the helper script to POST the HTML to the gallery API.

5.  If Copilot asks clarifying questions (for example for a missing name or filename), answer them or for permissions to run tools allow them. When the upload succeeds, switch back to the **Invaders Gallery** in your browser **http://localhost:1345/gallery** and confirm the new entry appears alongside the screenshots you shared in module "Sharing a screenshot with the community".

> [!TIP]
> Notice the `#index.html` in the example prompt above. Typing **#** in the chat input triggers auto-complete: start typing the file name and pick it from the list. This **attaches the file as context** so Copilot knows its exact location, instead of having to guess the path or search the workspace for it. Use it any time a prompt or skill needs a specific file as input.

> [!TIP]
> If you want to invoke the skill explicitly instead of relying on intent matching, type `/` in the chat input and you should see your new skill listed as a slash command alongside **/create-skill**, **/create-prompt**, and friends. Running **/<your-skill-name>** forces Copilot to use it directly.

> [!NOTE]
> If Copilot doesn't pick up the agent skill on its own, the most common cause is a **description** that doesn't match the way real users phrase the request. Open the **SKILL.md**, broaden the description to include the phrasings you actually used, and try again.

## Summary and Next Steps

You used **/create-skill** to scaffold a **project-scoped** agent skill (a **SKILL.md** plus a small upload script) and exercised it by asking Copilot, in plain English, to submit your generated game to the Invaders Gallery. By pointing the wizard at the published **OpenAPI spec**, the skill targets the real API correctly, and by enforcing the **200 KB** limit and required inputs in the script, the workflow stays deterministic across runs and across teammates.

You now have hands-on experience with two primary customization primitives: **instructions** (always-on rules) and **agent skills** (intent-triggered, multi-step workflows with scripts).

<div class="invis">[← Previous: Creating instructions](06-creating-instructions.md) | [Next: Recap →](08-recap.md)</div>

## Resources

- [Agent Skills specification][agent-skills-spec]
- [GitHub CLI: gh skill][gh-skill]
- [GitHub Docs: About agent skills][gh-agent-skills]
- [Visual Studio Code: Agent skills][vscode-skills]
- [Visual Studio Code: Copilot customization overview][vscode-customization]
- [Visual Studio Code: Use Copilot in Agent mode][vscode-agent-mode]
- [Example agent skills in the awesome-copilot repo][awesome-copilot-skills]
- [Creating effective skills][creating-effective-skills]
- [Secret scanning skill example][secret-scanning-skill]
- [What are Agents, Skills, and Instructions][agents-skills-instructions]

[agent-skills-spec]: https://agentskills.io/home
[gh-skill]: https://cli.github.com/manual/gh_skill
[gh-agent-skills]: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
[vscode-skills]: https://code.visualstudio.com/docs/copilot/customization/agent-skills
[vscode-customization]: https://code.visualstudio.com/docs/copilot/concepts/customization
[vscode-agent-mode]: https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode
[awesome-copilot-skills]: https://github.com/github/awesome-copilot/tree/main/skills
[creating-effective-skills]: https://awesome-copilot.github.com/learning-hub/creating-effective-skills/
[secret-scanning-skill]: https://github.com/github/awesome-copilot/blob/main/skills/secret-scanning/SKILL.md
[agents-skills-instructions]: https://awesome-copilot.github.com/learning-hub/what-are-agents-skills-instructions/
