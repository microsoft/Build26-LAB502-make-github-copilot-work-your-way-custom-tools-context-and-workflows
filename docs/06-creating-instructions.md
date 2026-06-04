# Creating repository custom instructions

## Custom instructions

Instruction files are Markdown documents that act as the project's "house rules" — durable guidance Copilot uses to understand what good looks like in this workspace. There are two main repository-level flavors:

- **copilot-instructions.md** — the main repository instructions file. Copilot **always** loads it as part of its context, on every prompt, in that workspace.
- **.instructions.md** files — additional, **path-specific** instructions scoped via front matter (**applyTo** glob). These are **not** always loaded; Copilot only pulls them in when the prompt or the files involved match their scope.

Unlike a one-off prompt, instructions are **always-on context** (for **copilot-instructions.md**). You write them once, and every future session — yours or a teammate's — gets the same baseline guidance. That is what makes the difference between "Copilot guessed reasonably" and "Copilot consistently produces code that fits this project".

Good instructions typically capture things the model cannot infer from the code alone, such as:

- The **purpose** of the project and the high-level architecture.
- **Conventions and constraints**: coding style, naming, frameworks, libraries to prefer or avoid, file layout.
- **Build, run, and test** commands so Copilot can validate its own changes.
- **Testing expectations**: frameworks, test file locations, and when to run focused versus full checks.
- **Git workflow**: commit style, branch expectations, and review requirements if they matter for the project.
- **Domain knowledge** and terminology specific to the project.
- **Things to avoid** (anti-patterns, deprecated APIs, files that should not be touched).

Why this matters:

- **Consistency** — every contributor (human or agent) gets the same context, reducing drift.
- **Less repetition** — you don't have to re-explain the same constraints in every prompt.
- **Better quality output** — the model makes fewer wrong assumptions and produces code that fits the project from the first try.
- **Onboarding** — new contributors (and new Copilot sessions) ramp up faster.

A weak **copilot-instructions.md** is generic and tells the model what it already knows. A strong one is **specific to your repo**: it points at the actual files, commands, and conventions that matter, and it is short enough to stay readable.

> [!NOTE]
> Our Space Invaders game is a single self-contained HTML file. That is an important constraint — without it, Copilot might happily split things into multiple files, add a build step, or pull in external dependencies on the next change. We will encode that into the instructions so future prompts respect it implicitly.

> [!NOTE]
> Throughout the Visual Studio Code modules in this lab we are using **Auto** mode for the model selector. In Auto mode, Copilot automatically picks the most capable model available for each request — you don't have to think about it. If you prefer to use a specific model (for example, to compare outputs or to stay on a model you are familiar with), you can click the model selector at the bottom of the chat input and choose one explicitly.

## Scenario

Custom instructions come in **three scopes**, and you can combine them:

- **Personal** — apply to *_you_* across every workspace and repository.
- **Repository** — apply to everyone working in this repo, stored in the repo itself at **.github/copilot-instructions.md**.
- **Organization** — apply to every repo in the organization, configured by org admins. Organization-level instructions currently apply to GitHub.com chat, Copilot cloud agent, and Copilot code review.

> [!NOTE]
> Custom instructions are a **generic Copilot feature**, not specific to one editor. Repository instructions travel with the code and are honored across Copilot surfaces such as Copilot CLI, Visual Studio Code, Visual Studio, JetBrains IDEs, the GitHub website, and Copilot cloud agent. Write them once, and they apply wherever your team uses Copilot for that repository.

Because the file is just **Markdown**, you could create **.github/copilot-instructions.md** by hand and start writing the rules. But staring at a blank file is rarely the fastest path. Instead, we will use the **/create-instructions** slash command to generate **repository instructions** as a head start, and then tweak the result if needed.

1.  Switch to Visual Studio Code.
2.  Open the **invaders** folder you have been working in: **File → Open Folder…** and select the **invaders** directory (**c:\Users\LabUser\invaders**). If prompted, choose **Yes, I trust the authors**.
3.  Confirm the single HTML file generated in module "Generating the Space Invaders game" is visible in the Explorer — **/create-instructions** works best when there is real code to analyze.
4.  Open the **Copilot Chat** view: click the Copilot icon in the Activity Bar, or press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd>. Make sure the chat is in **Agent** mode (mode selector at the bottom of the chat input).
5.  In the chat input, run the **/create-instructions** slash command with the following prompt:

```
/create-instructions create the .github/copilot-instructions.md file. The game must always remain a single self-contained HTML file with no external dependencies.
```

> [!TIP]
> Visual Studio Code may prompt you to allow Copilot to access files or folders outside the current workspace (for example, the `.github/` directory). When you see these prompts, click **Allow** to let Copilot create the instruction file in the right location.

>[!NOTE]
> We just added what we think is really important, the rest of the instructions will be inferred by Copilot from the codebase and the conversation history. The more specific you are in the prompt, the better the generated instructions will be. You can also ask for a first draft and then refine it with follow-up prompts.

6.  Copilot will scan the workspace, may ask a couple of clarifying questions about scope and conventions or permission to run tools, and then propose a **.github/copilot-instructions.md** file (this is the well-known location for **repository-scoped** custom instructions). Review the proposal in the diff view before accepting it.
7.  Click **Keep** (or accept the suggested edits) to save the file.

### Reviewing and tightening the generated file

The first draft is a starting point, not the final answer. Open **.github/copilot-instructions.md** in the editor and check that it captures at least the following:

- A one-paragraph description of the project (a game, single HTML file, themed visuals).
- The **single-file constraint**: all HTML, CSS, and JavaScript live inline in one `.html` file; no build step; no external assets or CDNs unless explicitly approved.
- How to **run** the game (open the HTML file in a browser).
- Style/visual conventions you care about (e.g. the Microsoft Build 2026 theme, color palette, no external fonts).
- Anything you want Copilot **not** to do (e.g. don't split into modules, don't add packages, don't introduce a framework).

If anything important is missing, just edit the file directly in Visual Studio Code — it is plain Markdown — or ask Copilot to refine it:

```text
Update .github/copilot-instructions.md to make it explicit that the game must remain a single self-contained HTML file with no external dependencies, no build step, and no CDN references.
```

### Verifying the instructions are picked up

1.  Start a new chat session by clicking the **+** icon at the top of the Copilot Chat view (this clears the previous context and starts a new session).
2.  Close all open files.
3.  Try a small change to confirm the rules are being followed, for example:

`Add a small "Made at Microsoft Build 2026" footer to the game.`

Copilot should make the change **inside the existing single HTML file**, without creating new files or pulling in external resources. If it tries to do otherwise, that is a signal your instructions need to be sharpened (or you need to explicitly add the game HTML file to the context).

> [!NOTE]
> Instructions are guidance, not a hard sandbox. The model will follow them in the vast majority of cases, but on ambiguous prompts it may still drift. The fix is almost always to make the relevant rule in **copilot-instructions.md** more specific.

## Summary and Next Steps

You used the built-in **/create-instructions** command to generate a **copilot-instructions.md** tailored to the Space Invaders project, encoded the **single HTML file** constraint as an always-on rule, and verified that future prompts pick the file up automatically. From now on, every Copilot session in this workspace starts with the same baseline understanding of how the project should be built and evolved.

<div class="invis">[← Previous: Exploring Copilot customizations](05-exploring-copilot-customizations.md) | [Next: Creating a skill →](07-creating-a-skill.md)</div>

## Resources

- [Adding repository custom instructions for GitHub Copilot][repo-custom-instructions]
- [Visual Studio Code: Customize chat responses with instructions][vscode-instructions]
- [Visual Studio Code: Use Copilot in Agent mode][vscode-agent-mode]
- [Example instructions in the awesome-copilot repo][awesome-copilot-instructions]
- [Defining custom instructions][defining-custom-instructions]
- [Understanding Copilot context][understanding-copilot-context]

[vscode-instructions]: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
[vscode-agent-mode]: https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode
[repo-custom-instructions]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
[awesome-copilot-instructions]: https://github.com/github/awesome-copilot/tree/main/instructions
[defining-custom-instructions]: https://awesome-copilot.github.com/learning-hub/defining-custom-instructions/
[understanding-copilot-context]: https://awesome-copilot.github.com/learning-hub/understanding-copilot-context/
