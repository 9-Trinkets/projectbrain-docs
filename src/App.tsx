import { useState } from "react";

const APP_URL = "https://app.projectbrain.tools";
const MARKETING_URL = "https://projectbrain.tools";
const BLOG_URL = "https://blog.projectbrain.tools";
const DOCS_REPO_URL = "https://github.com/9-Trinkets/projectbrain-docs";
const EDIT_THIS_PAGE_URL = `${DOCS_REPO_URL}/edit/main/src/App.tsx`;
const CONTRIBUTING_URL = `${DOCS_REPO_URL}/blob/main/CONTRIBUTING.md`;

const SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "tools", label: "MCP Tools Reference" },
  { id: "workflow", label: "Agent Workflow" },
  { id: "system-prompt", label: "System Prompt" },
] as const;

/* ── Copy button ── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 transition hover:border-accent hover:text-white"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ── Code block ── */
function Code({ children, copyable, wrap }: { children: string; copyable?: boolean; wrap?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-950 font-mono text-sm leading-relaxed text-gray-300">
      {copyable && (
        <div className="flex justify-end border-b border-gray-800 px-4 py-2">
          <CopyButton text={children} />
        </div>
      )}
      <pre className={`overflow-x-auto p-4 ${wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}`}>{children}</pre>
    </div>
  );
}

/* ── MCP config snippet ── */
const MCP_CONFIG = `{
  "mcpServers": {
    "project-brain": {
      "url": "https://mcp.projectbrain.tools",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer pb_YOUR_API_KEY"
      }
    }
  }
}`;

/* ── System prompt ── */
const SYSTEM_PROMPT = `You have access to Project Brain via MCP — a persistent, structured project backend that remembers context across sessions.

MCP Configuration:
{
  "mcpServers": {
    "project-brain": {
      "url": "https://mcp.projectbrain.tools",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer pb_YOUR_API_KEY"
      }
    }
  }
}

Project Brain uses a minimal tool interface:
- context(action, ...) — orientation/discovery (session, summary, changes, search)
- projects(action, ...) — project CRUD (list, get, create, update)
- tasks(action, ...) — task lifecycle, batch ops, dependencies, comments, and advanced list filters (q_any/q_all/q_not)
- knowledge(entity, action, ...) — decisions, facts, skills
- collaboration(action, ...) — team members, messaging, identity card, join team

Workflow:
1. projects(action="list") → identify the project
2. context(action="session", project_id=...) → orient with current context
3. tasks(action="list", project_id=..., status="todo") → pick work
4. tasks(action="update", task_id=..., status="in_progress") → claim it
5. Do the work and record knowledge:
   - tradeoff → knowledge(entity="decision", action="create", ...)
   - durable rule/constraint → knowledge(entity="fact", action="create", ...)
   - reusable procedure → knowledge(entity="skill", action="create", ...)
   - task note → tasks(action="add_comment", task_id=..., comment_body=...)
6. tasks(action="update", task_id=..., status="done") → ship it

Rules:
- Always start with context(action="session", project_id=...).
- Check existing reusable guidance first with knowledge(entity="skill", action="list", ...).
- Use tasks(action="context", task_id=...) before implementation when task history matters.
- Keep task status up to date throughout execution.
- Use context(action="changes", project_id=..., since=...) to catch up after time away.`;

/* ── Tool groups ── */
const TOOL_GROUPS = [
  { group: "Context", tools: [
    ["context(action=\"session\", project_id)", "Start here — full project context for the current session"],
    ["context(action=\"summary\", project_id)", "Project status and milestone snapshot"],
    ["context(action=\"changes\", project_id, since)", "Grouped changes since an ISO timestamp"],
    ["context(action=\"search\", project_id, q, limit?)", "Cross-entity search across tasks, decisions, facts, and skills"],
  ]},
  { group: "Projects", tools: [
    ["projects(action, project_id?, name?, description?)", "Create, list, inspect, and update projects"],
  ]},
  { group: "Tasks", tools: [
    ["tasks(action=\\\"list\\\", project_id, status?, q?, q_any?, q_all?, q_not?, response_mode?)", "List tasks with status/text filters and optional JSON output"],
    ["tasks(action=\"create\", project_id, title, ...)", "Create a task with optional priority/estimate/linkage fields"],
    ["tasks(action=\"update\", task_id, ...)", "Update task status, priority, assignment, or description"],
    ["tasks(action=\"context\", task_id)", "Task details plus linked decisions"],
    ["tasks(action=\"batch_create\", project_id, items)", "Create multiple tasks in one request"],
    ["tasks(action=\"batch_update\", updates)", "Bulk update multiple tasks in one request"],
    ["tasks(action=\"add_comment\", task_id, comment_body)", "Post a comment on a task"],
    ["tasks(action=\"add_dependency\", task_id, depends_on_id)", "Block a task on another task"],
    ["tasks(action=\"delete\", task_id)", "Delete a task and clean references"],
  ]},
  { group: "Knowledge", tools: [
    ["knowledge(entity, action, ...)", "Manage decisions, facts, and skills through one unified interface"],
  ]},
  { group: "Collaboration", tools: [
    ["collaboration(action, ...)", "Team members, agent discovery, messaging, and identity operations"],
  ]},
];
type ToolParam = {
  name: string;
  optional?: boolean;
  description: string;
};

const TOOL_PARAM_DETAILS_OVERRIDES: Record<string, ToolParam[]> = {
  "context(action=\"session\", project_id)": [
    { name: "action", description: "Use the literal value \"session\"." },
    { name: "project_id", description: "UUID of the project to load context for." },
  ],
  "context(action=\"summary\", project_id)": [
    { name: "action", description: "Use the literal value \"summary\"." },
    { name: "project_id", description: "UUID of the project to summarize." },
  ],
  "context(action=\"changes\", project_id, since)": [
    { name: "action", description: "Use the literal value \"changes\"." },
    { name: "project_id", description: "UUID of the project to inspect." },
    { name: "since", description: "ISO timestamp lower-bound for returned changes." },
  ],
  "context(action=\"search\", project_id, q, limit?)": [
    { name: "action", description: "Use the literal value \"search\"." },
    { name: "project_id", description: "UUID of the project to search within." },
    { name: "q", description: "Search query across tasks, decisions, facts, and skills." },
    { name: "limit", optional: true, description: "Per-entity result limit (default 5, max 20)." },
  ],
  "projects(action, project_id?, name?, description?)": [
    { name: "action", description: "One of: list, get, create, update." },
    { name: "project_id", optional: true, description: "Required for get/update actions." },
    { name: "name", optional: true, description: "Project name (required for create)." },
    { name: "description", optional: true, description: "Project description." },
  ],
  "tasks(action=\\\"list\\\", project_id, status?, q?, q_any?, q_all?, q_not?, response_mode?)": [
    { name: "action", description: "Use the literal value \"list\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "status", optional: true, description: "Task status filter (todo, in_progress, blocked, done, cancelled)." },
    { name: "q", optional: true, description: "Text search on task title/description." },
    { name: "q_any", optional: true, description: "OR terms: task matches if any provided term matches." },
    { name: "q_all", optional: true, description: "AND terms: task must match every provided term." },
    { name: "q_not", optional: true, description: "Exclusion terms: task must not match any provided term." },
    { name: "response_mode", optional: true, description: "Output format: human, json, or both." },
  ],
  "tasks(action=\"create\", project_id, title, ...)": [
    { name: "action", description: "Use the literal value \"create\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "title", description: "Task title." },
    { name: "description", optional: true, description: "Task description." },
    { name: "status", optional: true, description: "Initial task status." },
    { name: "priority", optional: true, description: "Priority label." },
    { name: "estimate", optional: true, description: "Estimated effort." },
    { name: "sort_order", optional: true, description: "Ordering index." },
    { name: "milestone_id", optional: true, description: "Milestone UUID or empty string to clear." },
    { name: "assignee_id", optional: true, description: "Assignee UUID or empty string to clear." },
  ],
  "tasks(action=\"update\", task_id, ...)": [
    { name: "action", description: "Use the literal value \"update\"." },
    { name: "task_id", description: "UUID of the task to update." },
    { name: "title", optional: true, description: "Updated task title." },
    { name: "description", optional: true, description: "Updated task description." },
    { name: "status", optional: true, description: "Updated status." },
    { name: "priority", optional: true, description: "Updated priority." },
    { name: "estimate", optional: true, description: "Updated estimate." },
    { name: "sort_order", optional: true, description: "Updated order index." },
    { name: "milestone_id", optional: true, description: "Updated milestone UUID or empty string to clear." },
    { name: "assignee_id", optional: true, description: "Updated assignee UUID or empty string to clear." },
  ],
  "tasks(action=\"context\", task_id)": [
    { name: "action", description: "Use the literal value \"context\"." },
    { name: "task_id", description: "UUID of the task to inspect." },
  ],
  "tasks(action=\"batch_create\", project_id, items)": [
    { name: "action", description: "Use the literal value \"batch_create\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "items", description: "Array of task objects; each item requires at least title." },
  ],
  "tasks(action=\"batch_update\", updates)": [
    { name: "action", description: "Use the literal value \"batch_update\"." },
    { name: "updates", description: "Array of task updates; each item must include task id." },
  ],
  "tasks(action=\"add_comment\", task_id, comment_body)": [
    { name: "action", description: "Use the literal value \"add_comment\"." },
    { name: "task_id", description: "UUID of the target task." },
    { name: "comment_body", description: "Comment markdown/text body." },
  ],
  "tasks(action=\"add_dependency\", task_id, depends_on_id)": [
    { name: "action", description: "Use the literal value \"add_dependency\"." },
    { name: "task_id", description: "UUID of the blocked task." },
    { name: "depends_on_id", description: "UUID of the prerequisite task." },
  ],
  "tasks(action=\"delete\", task_id)": [
    { name: "action", description: "Use the literal value \"delete\"." },
    { name: "task_id", description: "UUID of the task to delete." },
  ],
  "knowledge(entity, action, ...)": [
    { name: "entity", description: "One of: decision, fact, skill." },
    { name: "action", description: "One of: list, get, create, update, delete." },
    { name: "project_id", optional: true, description: "Required for decision/fact list/create, optional for skill." },
    { name: "item_id", optional: true, description: "Required for get/update/delete." },
    { name: "title", optional: true, description: "Title field used for create/update." },
    { name: "body", optional: true, description: "Body content (facts and skills)." },
    { name: "rationale", optional: true, description: "Decision rationale." },
    { name: "task_id", optional: true, description: "Optional task link for decisions." },
    { name: "category", optional: true, description: "Category for facts/skills." },
    { name: "tags", optional: true, description: "Tag list for skills." },
    { name: "q", optional: true, description: "Text search query for list actions." },
    { name: "cursor", optional: true, description: "Pagination cursor." },
    { name: "limit", optional: true, description: "Pagination size." },
  ],
  "collaboration(action, ...)": [
    { name: "action", description: "One of: list_team_members, discover_agents, send_message, get_messages, update_my_card, join_team." },
    { name: "recipient_id", optional: true, description: "Required for send_message." },
    { name: "body", optional: true, description: "Message body for send_message." },
    { name: "message_type", optional: true, description: "Message type (defaults to info)." },
    { name: "subject", optional: true, description: "Optional message subject." },
    { name: "include_read", optional: true, description: "For get_messages: include already-read messages." },
    { name: "mark_as_read", optional: true, description: "For get_messages: mark returned unread messages as read." },
    { name: "description", optional: true, description: "For update_my_card: profile description." },
    { name: "skills", optional: true, description: "For update_my_card: list of capability tags." },
    { name: "role", optional: true, description: "For update_my_card: planner/implementer/reviewer/general." },
    { name: "invite_code", optional: true, description: "For join_team action." },
  ],
};

function extractToolParams(tool: string): Omit<ToolParam, "description">[] {
  const open = tool.indexOf("(");
  const close = tool.lastIndexOf(")");
  if (open === -1 || close === -1 || close <= open) {
    return [];
  }

  const inner = tool.slice(open + 1, close).trim();
  if (!inner) {
    return [];
  }

  return inner
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "...")
    .map((part) => {
      const withoutDefault = part.replace(/=.*/, "").trim();
      const optional = withoutDefault.endsWith("?");
      const name = withoutDefault.replace(/\?$/, "");
      return { name, optional };
    });
}

function resolveToolParams(tool: string): ToolParam[] {
  const override = TOOL_PARAM_DETAILS_OVERRIDES[tool];
  if (override) {
    return override;
  }

  return extractToolParams(tool).map((param) => ({
    ...param,
    description: "See MCP schema for accepted values and constraints.",
  }));
}

export default function App() {
  const [active, setActive] = useState<string>("getting-started");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedToolParams, setExpandedToolParams] = useState<Record<string, boolean>>({});

  const scrollTo = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleToolParams = (tool: string) => {
    setExpandedToolParams((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href={MARKETING_URL} className="flex items-center gap-2 font-mono text-lg font-bold text-white">
            <img src="/favicon.svg" alt="Project Brain" className="h-6 w-6" />
            Docs
          </a>
          <div className="flex items-center gap-4">
            <a href={EDIT_THIS_PAGE_URL} className="hidden text-sm text-gray-400 hover:text-white sm:block">Edit this page</a>
            <a href={CONTRIBUTING_URL} className="hidden text-sm text-gray-400 hover:text-white sm:block">Contributing</a>
            <a href={BLOG_URL} className="hidden text-sm text-gray-400 hover:text-white sm:block">Blog</a>
            <a href={APP_URL} className="hidden text-sm text-gray-400 hover:text-white sm:block">Open App</a>
            <a href={MARKETING_URL} className="hidden text-sm text-gray-400 hover:text-white sm:block">Home</a>
            {/* Mobile menu toggle */}
            <button
              className="rounded-md p-2 text-gray-400 hover:text-white sm:hidden"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label="Toggle nav"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileNavOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl">
        {/* Sidebar — desktop */}
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-56 shrink-0 overflow-y-auto border-r border-gray-800 py-8 pr-4 pl-6 sm:block">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  active === s.id
                    ? "bg-accent/15 font-semibold text-accent-light"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="fixed inset-x-0 top-[57px] z-10 border-b border-gray-800 bg-gray-950 px-6 py-4 sm:hidden">
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                    active === s.id ? "bg-accent/15 font-semibold text-accent-light" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <div className="mt-3 flex gap-3 border-t border-gray-800 pt-3">
                <a href={EDIT_THIS_PAGE_URL} className="text-sm text-gray-400 hover:text-white">Edit this page</a>
                <a href={CONTRIBUTING_URL} className="text-sm text-gray-400 hover:text-white">Contributing</a>
                <a href={BLOG_URL} className="text-sm text-gray-400 hover:text-white">Blog</a>
                <a href={APP_URL} className="text-sm text-gray-400 hover:text-white">Open App</a>
                <a href={MARKETING_URL} className="text-sm text-gray-400 hover:text-white">Home</a>
              </div>
            </nav>
          </div>
        )}

        {/* Content */}
        <main className="min-w-0 flex-1 px-6 py-10 sm:px-10">

          {/* ── Getting Started ── */}
          <section id="getting-started" className="mb-16">
            <h1 className="font-mono text-3xl font-bold text-white">Getting Started</h1>
            <p className="mt-2 text-sm">
              <a href={EDIT_THIS_PAGE_URL} className="text-accent-light hover:underline">Edit this page on GitHub</a>
            </p>
            <p className="mt-4 text-gray-400">
              Connect your AI agent to Project Brain in under a minute. You&apos;ll need a free account and an API key.
            </p>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="font-semibold text-white">1. Create an account</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Sign in at <a href={APP_URL} className="text-accent-light hover:underline">{APP_URL}</a> using
                  GitHub or Google. A personal team is created automatically.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">2. Create an agent &amp; get an API key</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Go to <strong className="text-gray-300">Team Settings → Add Agent</strong>. Give it a name,
                  then copy the <code className="text-accent-light">pb_...</code> API key. It&apos;s shown once — save it securely.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">3. Add to your MCP config</h3>
                <p className="mt-2 mb-3 text-sm text-gray-400">
                  Add this to your agent&apos;s MCP server configuration (works with Warp, Cursor, Claude Code, or any MCP client):
                </p>
                <Code copyable>{MCP_CONFIG}</Code>
                <p className="mt-2 text-sm text-gray-400">
                  Replace <code className="text-accent-light">pb_YOUR_API_KEY</code> with your actual key.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">4. Start your agent</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Your agent now has persistent project memory. It should call{" "}
                  <code className="text-accent-light">context(action=&quot;session&quot;, project_id=...)</code> at the start of every session to orient itself.
                </p>
              </div>
            </div>
          </section>

          {/* ── Tools Reference ── */}
          <section id="tools" className="mb-16">
            <h1 className="font-mono text-3xl font-bold text-white">MCP Tools Reference</h1>
            <p className="mt-2 text-sm">
              <a href={EDIT_THIS_PAGE_URL} className="text-accent-light hover:underline">Edit this page on GitHub</a>
            </p>
            <p className="mt-4 text-gray-400">
              All tools available to your agent via MCP, grouped by category.
              Use your MCP client&apos;s tool listing to see the full schema for each.
            </p>

            <div className="mt-8 space-y-8">
              {TOOL_GROUPS.map(({ group, tools }) => (
                <div key={group}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{group}</h3>
                  <div className="space-y-2">
                    {tools.map(([tool, desc]) => {
                      const params = resolveToolParams(tool);
                      const isExpanded = !!expandedToolParams[tool];
                      const hasParams = params.length > 0;

                      return (
                        <div key={tool} className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                            <code className="font-mono text-sm text-accent-light break-words">{tool}</code>
                            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <span className="text-sm text-gray-500">{desc}</span>
                              {hasParams && (
                                <button
                                  type="button"
                                  onClick={() => toggleToolParams(tool)}
                                  className="w-fit rounded border border-gray-700 px-2 py-1 text-xs text-gray-400 transition hover:border-accent hover:text-white"
                                >
                                  {isExpanded ? "Hide params" : "Show params"}
                                </button>
                              )}
                            </div>
                          </div>
                          {hasParams && isExpanded && (
                            <div className="mt-3 rounded-md border border-gray-800/80 bg-gray-950/50 p-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Parameters</p>
                              <ul className="space-y-1 text-sm text-gray-400">
                                {params.map((param) => (
                                  <li key={param.name}>
                                    <code className="text-gray-300">{param.name}{param.optional ? "?" : ""}</code>
                                    {" — "}
                                    {param.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Workflow ── */}
          <section id="workflow" className="mb-16">
            <h1 className="font-mono text-3xl font-bold text-white">Agent Workflow</h1>
            <p className="mt-2 text-sm">
              <a href={EDIT_THIS_PAGE_URL} className="text-accent-light hover:underline">Edit this page on GitHub</a>
            </p>
            <p className="mt-4 text-gray-400">
              The recommended workflow for agents using Project Brain. Follow these steps every session.
            </p>

            <div className="mt-8 space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-4 font-mono text-sm font-semibold text-accent-light">Session Loop</h3>
                <ol className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">1.</span>
                    <span><code className="text-gray-300">context(action=&quot;session&quot;, project_id)</code> — orient yourself: tasks, decisions, facts, skills, team</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">2.</span>
                    <span><code className="text-gray-300">tasks(action=&quot;list&quot;, project_id, status=&quot;todo&quot;)</code> — pick work</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">3.</span>
                    <span><code className="text-gray-300">tasks(action=&quot;update&quot;, task_id, status=&quot;in_progress&quot;)</code> — claim it</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">4.</span>
                    <span>Do the work. Record knowledge as you go:
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>Tradeoff? → <code className="text-gray-300">knowledge(entity=&quot;decision&quot;, action=&quot;create&quot;, ...)</code></li>
                        <li>Convention/constraint? → <code className="text-gray-300">knowledge(entity=&quot;fact&quot;, action=&quot;create&quot;, ...)</code></li>
                        <li>Reusable workflow? → <code className="text-gray-300">knowledge(entity=&quot;skill&quot;, action=&quot;create&quot;, ...)</code></li>
                        <li>Note on a task? → <code className="text-gray-300">tasks(action=&quot;add_comment&quot;, task_id, comment_body)</code></li>
                      </ul>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">5.</span>
                    <span><code className="text-gray-300">tasks(action=&quot;update&quot;, task_id, status=&quot;done&quot;)</code> — ship it</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-4 font-mono text-sm font-semibold text-accent-light">Rules</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Always call <code className="text-gray-300">context(action=&quot;session&quot;, project_id)</code> at the start of every session.</li>
                  <li>• Check <code className="text-gray-300">knowledge(entity=&quot;skill&quot;, action=&quot;list&quot;, ...)</code> before starting unfamiliar work.</li>
                  <li>• Read project facts — they contain conventions and constraints you must follow.</li>
                  <li>• Record decisions as tradeoffs. If there&apos;s no &quot;why not X?&quot;, it&apos;s a fact, not a decision.</li>
                  <li>• When you figure out a reusable workflow, publish it with <code className="text-gray-300">knowledge(entity=&quot;skill&quot;, action=&quot;create&quot;, ...)</code>.</li>
                  <li>• Update task status as you work. Don&apos;t leave tasks stuck in &quot;todo&quot;.</li>
                  <li>• Use <code className="text-gray-300">tasks(action=&quot;context&quot;, task_id)</code> before starting a task to see prior decisions.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-4 font-mono text-sm font-semibold text-accent-light">Entities</h3>
                <dl className="space-y-3 text-sm">
                  <div><dt className="font-semibold text-white">Tasks</dt><dd className="text-gray-400">Units of work: todo → in_progress → done/blocked. Assigned to agents or humans.</dd></div>
                  <div><dt className="font-semibold text-white">Decisions</dt><dd className="text-gray-400">Tradeoff records: &quot;why this and not that?&quot; Always include rationale + task_id.</dd></div>
                  <div><dt className="font-semibold text-white">Facts</dt><dd className="text-gray-400">Durable project knowledge: conventions, constraints, context. Persist across sessions.</dd></div>
                  <div><dt className="font-semibold text-white">Skills</dt><dd className="text-gray-400">Reusable workflows and procedures. Team-wide or project-scoped. Agents publish and consume them.</dd></div>
                  <div><dt className="font-semibold text-white">Milestones</dt><dd className="text-gray-400">Delivery phases grouping tasks. Progress auto-computed from task status.</dd></div>
                </dl>
              </div>
            </div>
          </section>

          {/* ── System Prompt ── */}
          <section id="system-prompt" className="mb-16">
            <h1 className="font-mono text-3xl font-bold text-white">System Prompt</h1>
            <p className="mt-2 text-sm">
              <a href={EDIT_THIS_PAGE_URL} className="text-accent-light hover:underline">Edit this page on GitHub</a>
            </p>
            <p className="mt-4 text-gray-400">
              Copy this into your agent&apos;s system prompt or rules file. It gives the agent full context on
              how to use Project Brain — entities, tools, workflow, and conventions.
            </p>
            <div className="mt-8">
              <Code copyable wrap>{SYSTEM_PROMPT}</Code>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-gray-500 sm:flex-row sm:justify-between">
          <span className="flex items-center gap-2 font-mono">
            <img src="/favicon.svg" alt="Project Brain" className="h-5 w-5" />
            Project Brain Docs
          </span>
          <div className="flex gap-6">
            <a href={EDIT_THIS_PAGE_URL} className="hover:text-gray-300">Edit this page</a>
            <a href={CONTRIBUTING_URL} className="hover:text-gray-300">Contributing</a>
            <a href={BLOG_URL} className="hover:text-gray-300">Blog</a>
            <a href={MARKETING_URL} className="hover:text-gray-300">Home</a>
            <a href={APP_URL} className="hover:text-gray-300">App</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
