# Source Folder

This folder contains the source assets for the Lab 502 Space Invaders community experience.

- [community-hub](community-hub/) - ASP.NET Core Community Hub service, tests, deployment templates, and setup scripts. It receives lab/plugin activity, stores screenshots and shared games, exposes REST and MCP endpoints, and renders the live community dashboard.
- [game-samples](game-samples/) - Self-contained HTML Space Invaders sample games and their preview images. These files are examples or space invaders look alike games all created with Copilot using different models.
- [plugins](plugins/) - Copilot plugin packages for the lab. The included Space Invaders community plugin wires hooks, agents, and skills to track lab activity and share screenshots with the Community Hub.