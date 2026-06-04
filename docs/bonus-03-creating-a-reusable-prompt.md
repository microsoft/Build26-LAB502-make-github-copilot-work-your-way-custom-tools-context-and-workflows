# Bonus 3: Creating a reusable prompt

In the main lab you captured **always-on** rules for the project as repository custom instructions, then created a skill for a reusable workflow and, in the previous bonus, connected an MCP server for external tools. Some tasks, however, are still best as simple **on-demand** prompts that you invoke manually the same way every time. That is exactly what **prompt files** are for.

## Prompt files

Prompt files are reusable Markdown prompts that Visual Studio Code Copilot exposes as **slash commands** in chat. You write the prompt once, store it in the workspace (or in your personal profile), and from then on anyone can invoke it with **/<prompt-name>** instead of retyping or trying to remember the same multi-paragraph instructions.

A prompt file is a Markdown file with a **.prompt.md** extension and a small bit of YAML front matter. The body is plain natural language: what the task is, what inputs the user must provide, what good output looks like, and any constraints the agent should respect.

Why this matters:

- **Repeatability**: the same task is described the same way every single time, so the output is consistent.
- **Shareability**: when the prompt lives in the repo (workspace scope), every contributor (and every Copilot session) gets it for free, with no setup.
- **Quality**: you can encode best practices, links to style guides, and "definition of done" rules directly into the prompt, so the agent doesn't have to guess.
- **Discoverability**: slash commands surface in the chat input, so prompts are easy to find without digging through documentation.

A weak prompt file is vague and underspecified: it leaves Copilot to infer the goal, required inputs, and constraints each time. A strong one is **specific**: it spells out the **inputs** the user is expected to provide, the **standards** the output must meet, and the **scope** of the work. Keep prompt files short enough to stay readable and precise enough to remove guesswork.

> [!NOTE]
> Like custom instructions, prompt files have **scope**. **Workspace** prompts live in **.github/prompts/** and are shared with everyone working in the repo. **User** prompts live in your Visual Studio Code profile and follow you across every workspace. For a prompt the whole team should benefit from, workspace scope is the right choice.

## Scenario

Rather than writing the **.prompt.md** file by hand, we will use the built-in **/create-prompt** skill command. It scaffolds the front matter, may ask a couple of clarifying questions, and writes the file in the right place.

You can author **any prompt you like** here. Pick something you actually want to reuse. If you don't have one in mind, the suggestion below works well for the rest of this lab and produces a useful, opinionated documentation prompt.

1.  Switch to **Visual Studio Code** (the same window where you have been working on the game).
2.  Open the **Copilot Chat** view if it isn't already visible (click the Copilot icon in the Activity Bar, or press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd>). Make sure the chat is in **Agent** mode.
3.  Start a **new chat session** by clicking the **+** icon at the top of the Copilot Chat view, so the previous conversation's context doesn't leak into the prompt wizard.
4.  In the chat input, run the **/create-prompt** slash command. You can pass a free-form description after it — the more concrete you are, the less back-and-forth the wizard needs. As a suggestion, paste the following:

```text
/create-prompt Create a workspace prompt called "thorough documenter". It documents a single file the user specifies, using JSDoc for JS and the appropriate doc-comment format for other languages. Follow the guidelines at https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript
```

5.  Copilot may ask a couple of clarifying questions (for example, whether to also document non-JavaScript files or how to handle missing input). Answer them, and let it propose the prompt file in a diff view.

> [!TIP]
> Visual Studio Code may prompt you to allow access to specific files or folders or run tools. Click **Allow** when prompted so Copilot can read and create the necessary files.

> [!TIP]
> We included a URL in the **/create-prompt** request on purpose. Copilot can read referenced web content and use it as guidance, so best practices from that page are reflected in the generated prompt file.

6.  Review the proposed **.prompt.md** file. It should:

	- Live under the workspace (typically **.github/prompts/thorough-documenter.prompt.md**) so it is shared with the team.
	- Have YAML front matter declaring at least a **description**.
	- Clearly state that the user must provide **a single file** as input, and explain what to do if they don't.
	- Reference the **MDN JavaScript code style guide** as the source of truth for conventions.
	- Tell the agent to use the **language-appropriate doc-comment format** (JSDoc for JavaScript, docstrings for Python, XML doc comments for C#, and so on).

7.  Click **Keep** to accept the file.

> [!TIP]
> If Copilot doesn't create the prompt file on the first attempt, just ask it again — the model sometimes needs a second try.

> [!TIP]
> Two things make a prompt file punch above its weight:
>
> - **Pointing at an external best-practices document** (like the MDN JavaScript style guide above). The agent will read it and align its output with the rules described there, instead of inventing its own conventions. Any URL or workspace file works: coding standards, style guides, RFCs, internal wikis.
> - **Being explicit about inputs.** State exactly what the user must provide (a file, a function name, a URL, and so on) and what the prompt should do when an input is missing (ask, fail, use a default). This turns the prompt into a small contract instead of a vague request.

### Trying the prompt

Now use the prompt you just created against the Space Invaders HTML file. In a chat, you provide context to a prompt the same way you provide context to any other request: with the `#` mention syntax.

1.  In the Copilot Chat input, start a new chat (click the **+** icon at the top of the chat view) so the previous context doesn't leak in.
2.  Type **/** and notice that **thorough-documenter** now appears in the slash command list. That is your prompt file showing up as a first-class command.
3.  Run the prompt and attach the HTML file as the input it expects. For example:

	```text-nocopy-notype
	/thorough-documenter #index.html
	```

	The **#index.html** mention attaches the file to the chat as context, which is what the prompt is asking for as its input. (If you named your file differently, use that name instead.)

4.  Copilot will read the file, follow the rules baked into the prompt, and propose changes that add JSDoc comments to functions, document the structure, and explain the semantics of each section. Review the diff and accept the parts you like.

5.  Review the changes by clicking the file in **Files changed** at the bottom of the Copilot Chat view, then click **Keep** to accept the changes.

> [!NOTE]
> If you forget to attach a file with **#**, a well-written prompt should ask you for one rather than guessing. If yours silently picks an arbitrary file, that is a signal to tighten the **inputs** section of the prompt file.

## Summary

You used **/create-prompt** to scaffold a **workspace-scoped** prompt file, encoded a clear contract about its **inputs** and a link to an authoritative **best-practices document**, and then invoked it as a slash command against a real file using the **#** mention syntax. From now on, anyone working in this repository can run **/thorough-documenter** (or whichever prompt you authored) and get the same consistent, opinionated output, without having to remember the rules.

Combined with the **copilot-instructions.md** from module "Creating repository custom instructions", you now have both **always-on** project context and **on-demand** repeatable workflows: the two halves of a well-tuned Copilot setup.

<div class="invis">[← Previous: Using an MCP server (bonus)](bonus-02-using-an-mcp-server.md)</div>

## Resources

- [Visual Studio Code: Prompt files][vscode-prompts]
- [Visual Studio Code: Customize chat responses with instructions][vscode-instructions]
- [Visual Studio Code: Use Copilot in Agent mode][vscode-agent-mode]
- [MDN: JavaScript code style guide][mdn-js-style]
- [Example prompts in the awesome-copilot repo][awesome-copilot-prompts]

[vscode-prompts]: https://code.visualstudio.com/docs/copilot/customization/prompt-files
[vscode-instructions]: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
[vscode-agent-mode]: https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode
[mdn-js-style]: https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript
[awesome-copilot-prompts]: https://github.com/github/awesome-copilot/tree/main/prompts
