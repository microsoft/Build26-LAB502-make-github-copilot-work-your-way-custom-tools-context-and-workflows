import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";
import { createServer } from "node:http";

const DEFAULT_BASE_URL = "http://localhost:1345/";
const DEFAULT_REFRESH_SECONDS = 5;
const DEFAULT_GAME_LIMIT = 100;
const TENANT_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,30}$/;

let server;
let serverOrigin;
const instanceState = new Map();

const canvas = createCanvas({
	id: "lab502-community",
	displayName: "Lab 502 Community",
	description: "Shows Lab 502 activity, tool usage, screenshots, and uploaded games from the community hub API.",
	inputSchema: {
		type: "object",
		additionalProperties: false,
		properties: {
			baseUrl: {
				type: "string",
				format: "uri",
				description: "Community hub backend base URL.",
				default: DEFAULT_BASE_URL,
			},
			tenant: {
				type: "string",
				pattern: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,30}$",
				description: "Tenant to display. Omit to use the backend current tenant.",
			},
			refreshSeconds: {
				type: "integer",
				minimum: 3,
				maximum: 120,
				default: DEFAULT_REFRESH_SECONDS,
				description: "Automatic refresh interval in seconds.",
			},
			gameLimit: {
				type: "integer",
				minimum: 1,
				maximum: 500,
				default: DEFAULT_GAME_LIMIT,
				description: "Maximum number of uploaded games to show.",
			},
		},
	},
	actions: [
		{
			name: "get_snapshot",
			description: "Fetch the latest Lab 502 community activity snapshot from the configured backend API.",
			inputSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					baseUrl: { type: "string", format: "uri" },
					tenant: { type: "string", pattern: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,30}$" },
					gameLimit: { type: "integer", minimum: 1, maximum: 500 },
				},
			},
			handler: async ({ instanceId, input }) => {
				const state = mergeState(instanceState.get(instanceId), input);
				return await getSnapshot(state);
			},
		},
		{
			name: "list_tenants",
			description: "List tenants readable by the configured Lab 502 community hub backend.",
			inputSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					baseUrl: { type: "string", format: "uri" },
				},
			},
			handler: async ({ input }) => {
				const state = mergeState(undefined, input);
				return await fetchJson(state.baseUrl, "/api/tenants");
			},
		},
	],
	open: async ({ instanceId, input }) => {
		await ensureServer();
		const state = mergeState(undefined, input);
		instanceState.set(instanceId, state);
		return {
			url: `${serverOrigin}/?instanceId=${encodeURIComponent(instanceId)}`,
			title: "Lab 502 Community",
			status: `Backend: ${state.baseUrl}`,
		};
	},
	onClose: ({ instanceId }) => {
		instanceState.delete(instanceId);
	},
});

await joinSession({ canvases: [canvas] });

async function ensureServer() {
	if (serverOrigin) return;

	server = createServer(async (req, res) => {
		try {
			const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
			if (requestUrl.pathname === "/") {
				sendHtml(res, renderPage());
				return;
			}

			if (requestUrl.pathname === "/state") {
				const instanceId = requestUrl.searchParams.get("instanceId") || "";
				sendJson(res, instanceState.get(instanceId) || defaultState());
				return;
			}

			if (requestUrl.pathname === "/snapshot") {
				const instanceId = requestUrl.searchParams.get("instanceId") || "";
				const state = mergeState(instanceState.get(instanceId), Object.fromEntries(requestUrl.searchParams));
				sendJson(res, await getSnapshot(state));
				return;
			}

			if (requestUrl.pathname === "/health") {
				sendJson(res, { ok: true });
				return;
			}

			sendJson(res, { error: "Not found" }, 404);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			sendJson(res, { error: message }, 502);
		}
	});

	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			server.off("error", reject);
			resolve();
		});
	});

	const address = server.address();
	if (!address || typeof address === "string") {
		throw new CanvasError("server_unavailable", "Failed to start the Lab 502 canvas server.");
	}

	serverOrigin = `http://127.0.0.1:${address.port}`;
}

function defaultState() {
	return {
		baseUrl: DEFAULT_BASE_URL,
		tenant: "",
		refreshSeconds: DEFAULT_REFRESH_SECONDS,
		gameLimit: DEFAULT_GAME_LIMIT,
	};
}

function mergeState(existing, input) {
	const next = { ...defaultState(), ...(existing || {}) };
	if (!input || typeof input !== "object") return next;

	if (typeof input.baseUrl === "string" && input.baseUrl.trim()) {
		next.baseUrl = normalizeBaseUrl(input.baseUrl);
	}

	if (typeof input.tenant === "string") {
		const tenant = input.tenant.trim();
		if (tenant && !TENANT_PATTERN.test(tenant)) {
			throw new CanvasError("invalid_tenant", "Tenant must be alphanumeric or hyphenated and at most 31 characters.");
		}
		next.tenant = tenant;
	}

	if (input.refreshSeconds !== undefined) {
		next.refreshSeconds = clampInteger(input.refreshSeconds, 3, 120, DEFAULT_REFRESH_SECONDS);
	}

	if (input.gameLimit !== undefined) {
		next.gameLimit = clampInteger(input.gameLimit, 1, 500, DEFAULT_GAME_LIMIT);
	}

	return next;
}

function normalizeBaseUrl(value) {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new CanvasError("invalid_base_url", "Backend base URL must be an absolute HTTP or HTTPS URL.");
	}

	if (url.protocol !== "https:" && url.protocol !== "http:") {
		throw new CanvasError("invalid_base_url", "Backend base URL must use HTTP or HTTPS.");
	}

	url.hash = "";
	url.search = "";
	if (!url.pathname.endsWith("/")) url.pathname += "/";
	return url.toString();
}

function clampInteger(value, min, max, fallback) {
	const number = Number(value);
	if (!Number.isInteger(number)) return fallback;
	return Math.min(max, Math.max(min, number));
}

async function getSnapshot(state) {
	const tenants = await fetchJson(state.baseUrl, "/api/tenants");
	const selectedTenant = state.tenant || tenants.current_tenant || "";
	const [activity, screenshots, games] = await Promise.all([
		fetchJson(state.baseUrl, "/api/activity", selectedTenant ? { tenant: selectedTenant } : undefined),
		fetchJson(state.baseUrl, "/api/screenshots", selectedTenant ? { tenant: selectedTenant } : undefined),
		fetchJson(state.baseUrl, "/api/invaders-gallery/list", {
			...(selectedTenant ? { tenant: selectedTenant } : {}),
			limit: String(state.gameLimit),
		}),
	]);

	return {
		baseUrl: state.baseUrl,
		selectedTenant: activity.tenant || selectedTenant,
		tenants,
		activity,
		screenshots: Array.isArray(screenshots)
			? screenshots.map((url) => absolutizeUrl(state.baseUrl, url)).filter(Boolean)
			: [],
		games: Array.isArray(games)
			? games.map((game) => ({
					name: String(game?.name || "Untitled game"),
					url: absolutizeUrl(state.baseUrl, game?.url || ""),
				})).filter((game) => game.url)
			: [],
		fetchedAt: new Date().toISOString(),
	};
}

async function fetchJson(baseUrl, path, params) {
	const url = new URL(path, normalizeBaseUrl(baseUrl));
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && String(value) !== "") {
				url.searchParams.set(key, String(value));
			}
		}
	}

	const response = await fetch(url, {
		headers: { Accept: "application/json" },
		cache: "no-store",
	});
	if (!response.ok) {
		throw new CanvasError("backend_http_error", `Backend request failed: ${response.status} ${response.statusText} (${url.pathname})`);
	}
	return await response.json();
}

function absolutizeUrl(baseUrl, value) {
	if (!value) return "";
	try {
		return new URL(String(value), normalizeBaseUrl(baseUrl)).toString();
	} catch {
		return "";
	}
}

function sendHtml(res, html) {
	res.writeHead(200, {
		"content-type": "text/html; charset=utf-8",
		"cache-control": "no-store",
	});
	res.end(html);
}

function sendJson(res, value, status = 200) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
	});
	res.end(JSON.stringify(value));
}

function renderPage() {
	return String.raw`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Lab 502 Community</title>
	<style>
		:root {
			--bg: #000;
			--surface: #000;
			--line: #2a2a2a;
			--text: #fff;
			--text-dim: #b8b8b8;
			--mono-cyan: #4ec3e0;
			--accent-yellow: #f5b800;
			--pixel-red: #e74c3c;
			--pixel-green: #5fbf5f;
			--pixel-blue: #4ea3e0;
			--copilot-purple: #8534f3;
			--copilot-purple-1: #c898fd;
			--copilot-purple-2: #b870ff;
			--copilot-purple-4: #43179e;
			--copilot-purple-5: #26115f;
			--copilot-orange-3: #fe4c25;
			--mono: "Cascadia Code", "Cascadia Mono", "Consolas", "Courier New", ui-monospace, monospace;
			--sans: "Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
		}
		* { box-sizing: border-box; }
		html, body { min-height: 100%; }
		body {
			margin: 0;
			font-family: var(--sans);
			color: var(--text);
			background: var(--bg);
			-webkit-font-smoothing: antialiased;
		}
		.brand-bar {
			display: flex;
			align-items: center;
			gap: 16px;
			padding: 14px 22px;
			border-bottom: 1px solid var(--line);
			background: #000;
			position: sticky;
			top: 0;
			z-index: 10;
			flex-wrap: wrap;
		}
		.ms-logo {
			display: inline-grid;
			grid-template-columns: 10px 10px;
			grid-template-rows: 10px 10px;
			gap: 2px;
			width: 22px;
			height: 22px;
			flex: none;
		}
		.ms-logo span:nth-child(1){background:#f25022;}
		.ms-logo span:nth-child(2){background:#7fba00;}
		.ms-logo span:nth-child(3){background:#00a4ef;}
		.ms-logo span:nth-child(4){background:#ffb900;}
		.brand-text { font-weight: 600; font-size: 0.95rem; }
		.brand-copilot {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding-left: 14px;
			border-left: 1px solid #3a3a3a;
			color: var(--copilot-purple-1);
			font-family: var(--mono);
			font-size: 0.78rem;
			letter-spacing: 0.14em;
			text-transform: uppercase;
		}
		.brand-section {
			color: var(--text-dim);
			font-size: 0.85rem;
			font-family: var(--mono);
		}
		.brand-pill {
			padding: 4px 10px;
			border: 1px solid var(--line);
			color: var(--text-dim);
			font-family: var(--mono);
			font-size: 0.7rem;
			letter-spacing: 0.18em;
			text-transform: uppercase;
		}
		.brand-pill.offline { border-color: rgba(231, 76, 60, 0.75); color: #ff7a6b; }
		.copilot-stripe {
			height: 3px;
			width: 100%;
			background: linear-gradient(90deg, var(--copilot-purple-5), var(--copilot-purple), var(--copilot-purple-2), var(--copilot-orange-3));
		}
		.controls {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-left: auto;
			flex-wrap: wrap;
		}
		label {
			color: var(--text-dim);
			font-family: var(--mono);
			font-size: 0.72rem;
			text-transform: uppercase;
			letter-spacing: 0.12em;
		}
		input, select, button {
			background: #000;
			color: #fff;
			border: 1px solid var(--line);
			padding: 6px 8px;
			font-family: var(--mono);
			font-size: 0.78rem;
		}
		input[name="baseUrl"] { width: min(430px, 70vw); }
		button { cursor: pointer; color: var(--mono-cyan); }
		button:hover { border-color: var(--accent-yellow); color: var(--accent-yellow); }
		.shell { padding: 36px 44px; }
		.hero {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 28px;
			align-items: end;
			margin-bottom: 24px;
		}
		.pixel-bar { display: inline-flex; gap: 4px; margin-bottom: 18px; }
		.pixel-bar i { width: 14px; height: 14px; display: block; }
		.pixel-bar i:nth-child(1){background:var(--pixel-red);}
		.pixel-bar i:nth-child(2){background:var(--accent-yellow);}
		.pixel-bar i:nth-child(3){background:var(--pixel-green);}
		.pixel-bar i:nth-child(4){background:var(--pixel-blue);}
		.pixel-bar i:nth-child(5){background:var(--accent-yellow);}
		.pixel-bar i:nth-child(6){background:var(--pixel-red);}
		.copilot-tag {
			display: inline-flex;
			padding: 5px 12px;
			border: 1px solid var(--copilot-purple-4);
			background: linear-gradient(90deg, rgba(133, 52, 243, 0.18), rgba(184, 112, 255, 0.04));
			color: var(--copilot-purple-1);
			font-family: var(--mono);
			font-size: 0.72rem;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			margin-bottom: 14px;
		}
		h1 {
			margin: 0;
			font-family: var(--mono);
			font-weight: 400;
			font-size: clamp(2rem, 5vw, 3.6rem);
			line-height: 1.05;
			color: var(--mono-cyan);
		}
		.subtitle { margin: 12px 0 0; color: #fff; font-size: 1.05rem; }
		.meta { color: var(--text-dim); font-family: var(--mono); font-size: 0.82rem; text-align: right; }
		.grid {
			display: grid;
			grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
			gap: 24px;
			align-items: start;
		}
		.panel {
			background: var(--surface);
			border: 1px solid var(--line);
			padding: 24px;
			min-width: 0;
		}
		h2 {
			margin: 0 0 14px;
			font-family: var(--mono);
			font-weight: 400;
			font-size: 1.1rem;
			color: var(--mono-cyan);
		}
		table { border-collapse: collapse; width: 100%; background: #000; }
		th, td {
			padding: 12px 14px;
			text-align: left;
			vertical-align: middle;
			font-size: 0.92rem;
			border-bottom: 1px solid var(--line);
		}
		th {
			color: var(--mono-cyan);
			font-family: var(--mono);
			font-weight: 400;
			text-transform: uppercase;
			letter-spacing: 0.12em;
			font-size: 0.72rem;
		}
		td:nth-child(2), td:nth-child(3) {
			font-family: var(--mono);
			font-variant-numeric: tabular-nums;
			color: var(--accent-yellow);
		}
		tr:hover td { background: #0a0a0a; }
		.stack { display: grid; gap: 24px; }
		.screenshots-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 12px;
			max-height: 520px;
			overflow: auto;
			padding-right: 4px;
		}
		.screenshot-tile {
			display: block;
			aspect-ratio: 4 / 3;
			border: 1px solid var(--line);
			background: #050505;
			padding: 6px;
			overflow: hidden;
			transition: border-color 0.15s ease, transform 0.15s ease;
		}
		.screenshot-tile:hover { border-color: var(--accent-yellow); transform: translateY(-2px); }
		.screenshot-tile img { width: 100%; height: 100%; object-fit: cover; display: block; background: #000; }
		.gallery-list {
			list-style: none;
			margin: 0;
			padding: 0;
			border-top: 1px solid var(--line);
			max-height: 420px;
			overflow: auto;
		}
		.gallery-list li { border-bottom: 1px solid var(--line); }
		.gallery-list a {
			display: flex;
			gap: 12px;
			padding: 13px 6px;
			color: #fff;
			text-decoration: none;
		}
		.gallery-list a::before { content: ">"; color: var(--accent-yellow); font-family: var(--mono); }
		.gallery-list a:hover { color: var(--mono-cyan); background: #0a0a0a; }
		.empty, .error {
			padding: 18px 6px 4px;
			color: var(--text-dim);
			font-family: var(--mono);
			font-size: 0.9rem;
		}
		.error { color: #ff7a6b; }
		@media (max-width: 1080px) {
			.shell { padding: 24px; }
			.grid, .hero { grid-template-columns: 1fr; }
			.meta { text-align: left; }
		}
	</style>
</head>
<body>
	<header class="brand-bar">
		<span class="ms-logo" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
		<span class="brand-text">Microsoft Build</span>
		<span class="brand-copilot">GitHub Copilot</span>
		<span class="brand-section">/ Lab 502 - Community Canvas</span>
		<span id="status" class="brand-pill">Loading</span>
		<form id="controls" class="controls">
			<label for="baseUrl">Backend</label>
			<input id="baseUrl" name="baseUrl" type="url" required />
			<label for="tenant">Tenant</label>
			<select id="tenant" name="tenant"></select>
			<label for="refreshSeconds">Refresh</label>
			<input id="refreshSeconds" name="refreshSeconds" type="number" min="3" max="120" />
			<button type="submit">Apply</button>
		</form>
	</header>
	<div class="copilot-stripe" aria-hidden="true"></div>
	<main class="shell">
		<section class="hero">
			<div>
				<div class="pixel-bar" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
				<span class="copilot-tag">Powered by GitHub Copilot</span>
				<h1>Now shipping:<br>Lab 502 Community</h1>
				<p class="subtitle">Live activity, tools, screenshots, and uploaded games from the Community Hub API.</p>
			</div>
			<div class="meta">
				<div>Tenant: <span id="selectedTenant">-</span></div>
				<div>Fetched: <span id="fetchedAt">-</span></div>
				<div>Next refresh: <span id="nextRefresh">-</span></div>
			</div>
		</section>
		<div id="error" class="error" hidden></div>
		<section class="grid">
			<div class="stack">
				<div class="panel">
					<h2>Live Activity Board</h2>
					<table>
						<thead><tr><th>Activity</th><th id="tenantHeader">Current Tenant</th><th>All Labs</th></tr></thead>
						<tbody id="activityRows"></tbody>
					</table>
				</div>
				<div class="panel">
					<h2>Tools Called</h2>
					<table>
						<thead><tr><th>Tool</th><th id="toolTenantHeader">Current Tenant</th><th>All Labs</th></tr></thead>
						<tbody id="toolRows"></tbody>
					</table>
				</div>
			</div>
			<div class="stack">
				<div class="panel">
					<h2 id="screenshotsTitle">Screenshots Gallery</h2>
					<div id="screenshots" class="screenshots-grid"></div>
				</div>
				<div class="panel">
					<h2 id="gamesTitle">Uploaded Games</h2>
					<ul id="games" class="gallery-list"></ul>
				</div>
			</div>
		</section>
	</main>
	<script>
		(function () {
			const params = new URLSearchParams(location.search);
			const instanceId = params.get("instanceId") || "";
			const els = {
				form: document.getElementById("controls"),
				baseUrl: document.getElementById("baseUrl"),
				tenant: document.getElementById("tenant"),
				refreshSeconds: document.getElementById("refreshSeconds"),
				status: document.getElementById("status"),
				error: document.getElementById("error"),
				selectedTenant: document.getElementById("selectedTenant"),
				fetchedAt: document.getElementById("fetchedAt"),
				nextRefresh: document.getElementById("nextRefresh"),
				tenantHeader: document.getElementById("tenantHeader"),
				toolTenantHeader: document.getElementById("toolTenantHeader"),
				activityRows: document.getElementById("activityRows"),
				toolRows: document.getElementById("toolRows"),
				screenshots: document.getElementById("screenshots"),
				screenshotsTitle: document.getElementById("screenshotsTitle"),
				games: document.getElementById("games"),
				gamesTitle: document.getElementById("gamesTitle"),
			};
			let refreshTimer = 0;
			let countdownTimer = 0;
			let nextRefreshAt = 0;
			let state = { baseUrl: "", tenant: "", refreshSeconds: 5, gameLimit: 100 };

			function setStatus(text, offline) {
				els.status.textContent = text;
				els.status.classList.toggle("offline", Boolean(offline));
			}

			function showError(message) {
				els.error.hidden = !message;
				els.error.textContent = message || "";
			}

			function escapeHtml(value) {
				return String(value)
					.replaceAll("&", "&amp;")
					.replaceAll("<", "&lt;")
					.replaceAll(">", "&gt;")
					.replaceAll('"', "&quot;")
					.replaceAll("'", "&#39;");
			}

			function formatCount(value) {
				return String(Number(value) || 0);
			}

			function metricRows(current, all) {
				const rows = [
					["Sessions", "session_count"],
					["Users", "user_count"],
					["Prompts Submitted", "prompt_submissions"],
					["Tool Calls", "tool_calls"],
					["Distinct Tools Called", "distinct_tools_called"],
					["Main Agent Finished", "agent_stops"],
					["Subagents Finished", "subagent_stops"],
					["Uploaded Games", "uploaded_games_count"],
				];
				return rows.map(function (row) {
					return "<tr><td>" + escapeHtml(row[0]) + "</td><td>" + formatCount(current[row[1]]) + "</td><td>" + formatCount(all[row[1]]) + "</td></tr>";
				}).join("");
			}

			function toolRows(currentTools, allTools) {
				const selected = new Map((currentTools || []).map(function (tool) { return [tool.name, tool.count]; }));
				const all = new Map((allTools || []).map(function (tool) { return [tool.name, tool.count]; }));
				const names = Array.from(new Set([].concat(Array.from(selected.keys()), Array.from(all.keys())))).sort();
				if (names.length === 0) return '<tr><td colspan="3" class="empty">No tool calls recorded yet.</td></tr>';
				return names.map(function (name) {
					return "<tr><td>" + escapeHtml(name) + "</td><td>" + formatCount(selected.get(name)) + "</td><td>" + formatCount(all.get(name)) + "</td></tr>";
				}).join("");
			}

			function renderTenants(snapshot) {
				const tenants = snapshot.tenants && Array.isArray(snapshot.tenants.tenants) ? snapshot.tenants.tenants : [];
				const selectedTenant = snapshot.selectedTenant || state.tenant || "";
				const values = Array.from(new Set([selectedTenant].concat(tenants).filter(Boolean)));
				els.tenant.innerHTML = values.map(function (tenant) {
					const selected = tenant === selectedTenant ? " selected" : "";
					return '<option value="' + escapeHtml(tenant) + '"' + selected + ">" + escapeHtml(tenant) + "</option>";
				}).join("");
			}

			function renderSnapshot(snapshot) {
				const selectedTenant = snapshot.selectedTenant || "Current Tenant";
				const activity = snapshot.activity || {};
				const scopes = activity.activity || {};
				const tools = activity.tools || {};
				const current = scopes.current_tenant || {};
				const all = scopes.all_tenants || {};

				els.selectedTenant.textContent = selectedTenant;
				els.tenantHeader.textContent = selectedTenant;
				els.toolTenantHeader.textContent = selectedTenant;
				els.fetchedAt.textContent = new Date(snapshot.fetchedAt).toLocaleTimeString();
				els.activityRows.innerHTML = metricRows(current, all);
				els.toolRows.innerHTML = toolRows(tools.current_tenant, tools.all_tenants);
				els.screenshotsTitle.textContent = "Screenshots Gallery (" + snapshot.screenshots.length + ")";
				els.screenshots.innerHTML = snapshot.screenshots.length
					? snapshot.screenshots.map(function (url) {
						return '<a class="screenshot-tile" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer"><img src="' + escapeHtml(url) + '" alt="Screenshot from ' + escapeHtml(selectedTenant) + '" loading="lazy" /></a>';
					}).join("")
					: '<div class="empty">No screenshots saved yet.</div>';
				els.gamesTitle.textContent = "Uploaded Games (" + snapshot.games.length + ")";
				els.games.innerHTML = snapshot.games.length
					? snapshot.games.map(function (game) {
						return '<li><a href="' + escapeHtml(game.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(game.name) + "</a></li>";
					}).join("")
					: '<li class="empty">No games uploaded yet.</li>';
				renderTenants(snapshot);
			}

			function updateCountdown() {
				if (!nextRefreshAt) {
					els.nextRefresh.textContent = "-";
					return;
				}
				const seconds = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
				els.nextRefresh.textContent = seconds + "s";
			}

			function scheduleRefresh() {
				window.clearTimeout(refreshTimer);
				nextRefreshAt = Date.now() + Number(state.refreshSeconds || 5) * 1000;
				updateCountdown();
				refreshTimer = window.setTimeout(loadSnapshot, Number(state.refreshSeconds || 5) * 1000);
			}

			async function loadSnapshot() {
				setStatus("Loading", false);
				showError("");
				const qs = new URLSearchParams({
					instanceId: instanceId,
					baseUrl: state.baseUrl,
					tenant: state.tenant || "",
					refreshSeconds: String(state.refreshSeconds || 5),
					gameLimit: String(state.gameLimit || 100),
				});
				try {
					const response = await fetch("/snapshot?" + qs.toString(), { cache: "no-store" });
					const data = await response.json();
					if (!response.ok) throw new Error(data.error || "Failed to fetch data.");
					state.tenant = data.selectedTenant || state.tenant;
					renderSnapshot(data);
					setStatus("Live Telemetry", false);
				} catch (error) {
					showError(error.message || String(error));
					setStatus("Offline", true);
				} finally {
					scheduleRefresh();
				}
			}

			els.form.addEventListener("submit", function (event) {
				event.preventDefault();
				state.baseUrl = els.baseUrl.value;
				state.tenant = els.tenant.value;
				state.refreshSeconds = Number(els.refreshSeconds.value) || 5;
				loadSnapshot();
			});

			fetch("/state?instanceId=" + encodeURIComponent(instanceId), { cache: "no-store" })
				.then(function (response) { return response.json(); })
				.then(function (data) {
					state = Object.assign(state, data || {});
					els.baseUrl.value = state.baseUrl;
					els.refreshSeconds.value = state.refreshSeconds;
					return loadSnapshot();
				})
				.catch(function (error) {
					showError(error.message || String(error));
					setStatus("Offline", true);
				});

			countdownTimer = window.setInterval(updateCountdown, 250);
			window.addEventListener("beforeunload", function () {
				window.clearTimeout(refreshTimer);
				window.clearInterval(countdownTimer);
			});
		})();
	</script>
</body>
</html>`;
}
