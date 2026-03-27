import { useState, useEffect } from "react";

const APP_URL = "https://app.projectbrain.tools";
const MARKETING_URL = "https://projectbrain.tools";
const BLOG_URL = "https://blog.projectbrain.tools";
const DOCS_REPO_URL = "https://github.com/9-Trinkets/projectbrain-docs";
const EDIT_THIS_PAGE_URL = `${DOCS_REPO_URL}/edit/main/src/App.tsx`;
const CONTRIBUTING_URL = `${DOCS_REPO_URL}/blob/main/CONTRIBUTING.md`;

const SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "demo", label: "Demo" },
  { id: "cli", label: "pb CLI" },
  { id: "claude-code-skill", label: "Claude Code Skill" },
  { id: "tools", label: "MCP Tools Reference" },
  { id: "workflow", label: "Agent Workflow" },
  { id: "gherkin-style", label: "Gherkin-style Prompts" },
  { id: "curation", label: "Memory Curation" },
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
      className="rounded-lg border border-[#2A2722] px-3 py-1 text-xs text-[#D4C5B0] transition hover:border-accent hover:text-[#F0E6D2] bg-[#141311]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ── Code block ── */
function Code({ children, copyable, wrap }: { children: string; copyable?: boolean; wrap?: boolean }) {
  return (
    <div className="rounded-xl border border-[#2A2722] bg-[#0A0A0B] font-mono text-sm leading-relaxed text-[#D4C5B0] shadow-inner">
      {copyable && (
        <div className="flex justify-end border-b border-[#2A2722] px-4 py-2">
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
const SYSTEM_PROMPT = `Given you have access to ProjectBrain via MCP — a persistent, structured project backend that remembers context across sessions
And ProjectBrain uses a minimal tool interface

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

Core Tools:
- context(action, ...) — orientation/discovery (session, summary, changes, search, shortlist)
- projects(action, ...) — project CRUD (list, get, create, update)
- tasks(action, ...) — task lifecycle, batch ops, dependencies, comments, and milestones
- knowledge(entity, action, ...) — decisions, facts, and skills (entity = decision|fact|skill)
- collaboration(action, ...) — team members, messaging, identity card, join team
- files(action, ...) — versioned documents: drafts, specs, reports, reviews, code linked to tasks/milestones

Scenario: Session initialization
When you begin a new session or need to find a project
Then you must call projects(action="list") to find your project
And you must subsequently call context(action="session", project_id=...) to load full project context

Scenario: Task execution workflow
When you are ready to pick up work
Then you must query tasks using tasks(action="list", project_id=..., status="todo")
And you must claim a task by updating its status using tasks(action="update", task_id=..., status="in_progress")
And you must check existing skills first using knowledge(entity="skill", action="list", ...)
And you must read task history if it exists using tasks(action="context", task_id=...)

When you are performing the work
Then you must record tradeoffs using knowledge(entity="decision", action="create", ...)
And you must record durable conventions and constraints using knowledge(entity="fact", action="create", ...)
And you must record reusable procedures using knowledge(entity="skill", action="create", ...)
And you must keep the task status updated as you work using tasks(action="update", ...)

When you have completed and verified the work
Then you must update the task status using tasks(action="update", task_id=..., status="done")`;

/* ── Tool groups ── */
const TOOL_GROUPS = [
  { group: "Context", tools: [
    ["context(action=\"session\", project_id)", "Start here — full project context (tasks, decisions, facts, skills, team)"],
    ["context(action=\"summary\", project_id)", "Project status and milestone snapshot"],
    ["context(action=\"changes\", project_id, since)", "Grouped audit changes since an ISO timestamp"],
    ["context(action=\"search\", project_id, q, limit?)", "Cross-entity semantic search"],
    ["context(action=\"shortlist\", q, limit?, full_tool_mode?)", "Intent-aware top-k tool-action shortlist"],
  ]},
  { group: "Projects", tools: [
    ["projects(action, project_id?, name?, description?)", "Project CRUD: list, get, create, update"],
  ]},
  { group: "Tasks", tools: [
    ["tasks(action=\"list\", project_id, status?, q?, q_any?, q_all?, q_not?, response_mode?)", "List tasks with advanced filters and optional JSON output"],
    ["tasks(action=\"create\", project_id, title, ...)", "Create a task with optional priority/estimate/milestone/assignee"],
    ["tasks(action=\"update\", task_id, ...)", "Update task lifecycle: status, priority, description, or metadata"],
    ["tasks(action=\"context\", task_id)", "Task details, comments, dependencies, and linked decisions"],
    ["tasks(action=\"batch_create\", project_id, items=[{title, ...}, ...])", "Create multiple tasks in one request (requires items[].title)"],
    ["tasks(action=\"batch_update\", updates=[{id, ...}, ...])", "Bulk update multiple tasks in one request (requires updates[].id)"],
    ["tasks(action=\"add_comment\", task_id, comment_body)", "Post a comment on a task"],
    ["tasks(action=\"add_dependency\", task_id, depends_on_id)", "Block a task on another task"],
    ["tasks(action=\"delete\", task_id)", "Delete a task and its references"],
  ]},
  { group: "Milestones", tools: [
    ["tasks(action=\"list_milestones\", project_id)", "List delivery milestones for a project"],
    ["tasks(action=\"get_milestone\", milestone_id)", "Get milestone details and progress"],
    ["tasks(action=\"create_milestone\", project_id, title, status?)", "Create a new milestone"],
    ["tasks(action=\"update_milestone\", milestone_id, title?, status?)", "Update milestone details"],
    ["tasks(action=\"delete_milestone\", milestone_id)", "Delete a milestone"],
    ["tasks(action=\"reorder_milestones\", project_id, milestone_ids=[])", "Change the sort order of milestones"],
  ]},
  { group: "Knowledge", tools: [
    ["knowledge(entity, action, ...)", "Manage decisions, facts, and skills (entity = decision|fact|skill)"],
  ]},
  { group: "Files", tools: [
    ["files(action=\"list\", project_id, file_type?)", "List versioned documents (draft, spec, report, review, code)"],
    ["files(action=\"get\", file_id, version?)", "Get latest or specific version of a file"],
    ["files(action=\"create\", project_id, title, file_type, body, ...)", "Create a new versioned file linked to a project or entity"],
    ["files(action=\"add_version\", file_id, body)", "Append a new version to an existing file"],
    ["files(action=\"list_versions\", file_id)", "List version history for a file"],
    ["files(action=\"delete\", file_id)", "Permanently delete a file"],
  ]},
  { group: "Collaboration", tools: [
    ["collaboration(action, ...)", "Team members, agent discovery, and messaging"],
  ]},
];
type ToolParam = {
  name: string;
  optional?: boolean;
  description: string;
};

const TOOL_PARAM_DETAILS_OVERRIDES: Record<string, ToolParam[]> = {
  "context(action=\"session\", project_id)": [
    { name: "action", description: "Literal value \"session\"." },
    { name: "project_id", description: "UUID of the project." },
  ],
  "context(action=\"summary\", project_id)": [
    { name: "action", description: "Literal value \"summary\"." },
    { name: "project_id", description: "UUID of the project." },
  ],
  "context(action=\"changes\", project_id, since)": [
    { name: "action", description: "Literal value \"changes\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "since", description: "ISO-8601 timestamp (e.g., 2026-03-21T00:00:00Z)." },
  ],
  "context(action=\"search\", project_id, q, limit?)": [
    { name: "action", description: "Literal value \"search\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "q", description: "Search query string." },
    { name: "limit", optional: true, description: "Results per entity type (default 5)." },
  ],
  "context(action=\"shortlist\", q, limit?, full_tool_mode?)": [
    { name: "action", description: "Literal value \"shortlist\"." },
    { name: "q", description: "Natural language intent query." },
    { name: "limit", optional: true, description: "Number of ranked operations to return." },
    { name: "full_tool_mode", optional: true, description: "Return full tool definitions if true." },
  ],
  "tasks(action=\"list\", project_id, status?, q?, q_any?, q_all?, q_not?, response_mode?)": [
    { name: "action", description: "Literal value \"list\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "status", optional: true, description: "Filter by status: todo, in_progress, blocked, done, cancelled." },
    { name: "q", optional: true, description: "Text search on title/description." },
    { name: "q_any", optional: true, description: "Matches if ANY provided term matches." },
    { name: "q_all", optional: true, description: "Matches if ALL provided terms match." },
    { name: "q_not", optional: true, description: "Excludes tasks matching any provided term." },
    { name: "response_mode", optional: true, description: "human | json | both." },
  ],
  "tasks(action=\"create\", project_id, title, ...)": [
    { name: "action", description: "Literal value \"create\"." },
    { name: "project_id", description: "UUID of the project." },
    { name: "title", description: "Task title." },
    { name: "priority", optional: true, description: "low, medium, high, urgent." },
    { name: "estimate", optional: true, description: "Integer estimate (e.g., story points)." },
    { name: "milestone_id", optional: true, description: "UUID of the linked milestone." },
    { name: "assignee_id", optional: true, description: "UUID of the assigned agent or user." },
  ],
  "knowledge(entity, action, ...)": [
    { name: "entity", description: "decision, fact, or skill." },
    { name: "action", description: "list, get, create, update, or delete." },
    { name: "project_id", optional: true, description: "Required for decision/fact list/create." },
    { name: "item_id", optional: true, description: "Required for get/update/delete." },
    { name: "title", optional: true, description: "Title field." },
    { name: "body", optional: true, description: "Markdown body content (facts/skills)." },
    { name: "rationale", optional: true, description: "Rationale for decisions." },
    { name: "task_id", optional: true, description: "Linked task for decisions." },
    { name: "category", optional: true, description: "Category label." },
    { name: "tags", optional: true, description: "List of skill tags." },
  ],
  "collaboration(action, ...)": [
    { name: "action", description: "list_team_members, discover_agents, get_agent_activity, send_message, get_messages, update_my_card, join_team." },
    { name: "recipient_id", optional: true, description: "Target UUID for send_message." },
    { name: "body", optional: true, description: "Message or profile body." },
    { name: "since", optional: true, description: "Activity filter timestamp." },
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

function formatToolLabel(tool: string): string {
  return tool.replace(/\\"/g, "\"");
}

export default function App() {
  const [active, setActive] = useState<string>("getting-started");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedToolParams, setExpandedToolParams] = useState<Record<string, boolean>>({});

  // Scroll to hash on initial load (e.g. links from the app checklist)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActive(hash);
      // Small delay to ensure the DOM is fully rendered before scrolling
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const scrollTo = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleToolParams = (tool: string) => {
    setExpandedToolParams((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#B09E80] selection:text-[#0A0A0B]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#2A2722] bg-[#0A0A0B]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href={MARKETING_URL} className="flex items-center gap-3 font-display text-xl font-medium text-[#F0E6D2]">
            <img src="/favicon.svg" alt="ProjectBrain" className="h-7 w-7 filter sepia-[0.5] saturate-50" />
            Docs
          </a>
          <div className="flex items-center gap-6">
            <a href={MARKETING_URL} className="hidden text-sm text-[#D4C5B0] opacity-60 hover:opacity-100 transition-opacity sm:block">Home</a>
            <a href={BLOG_URL} className="hidden text-sm text-[#D4C5B0] opacity-60 hover:opacity-100 transition-opacity sm:block">Blog</a>
            <a href={APP_URL} className="hidden rounded-lg bg-[#B09E80] px-4 py-2 text-sm font-semibold text-[#0A0A0B] hover:bg-[#D4C5B0] transition-colors sm:block">Open App</a>
            {/* Mobile menu toggle */}
            <button
              className="rounded-md p-2 text-[#D4C5B0] hover:text-[#F0E6D2] sm:hidden"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label="Toggle nav"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileNavOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar — desktop */}
        <aside className="sticky top-[69px] hidden h-[calc(100vh-69px)] w-64 shrink-0 overflow-y-auto border-r border-[#2A2722] py-10 pr-4 pl-6 sm:block">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm transition-all ${
                  active === s.id
                    ? "bg-[#B09E80]/10 font-semibold text-[#F0E6D2] border border-[#B09E80]/20"
                    : "text-[#D4C5B0] opacity-60 hover:opacity-100 hover:bg-[#141311]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="fixed inset-x-0 top-[69px] z-10 border-b border-[#2A2722] bg-[#0A0A0B] px-6 py-6 sm:hidden">
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`block w-full rounded-lg px-4 py-3 text-left text-base ${
                    active === s.id ? "bg-[#B09E80]/10 font-semibold text-[#F0E6D2]" : "text-[#D4C5B0] opacity-60"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <div className="mt-6 flex flex-col gap-4 border-t border-[#2A2722] pt-6">
                <a href={MARKETING_URL} className="text-base text-[#D4C5B0] opacity-60">Home</a>
                <a href={BLOG_URL} className="text-base text-[#D4C5B0] opacity-60">Blog</a>
                <a href={APP_URL} className="rounded-lg bg-[#B09E80] py-3 text-center text-base font-semibold text-[#0A0A0B]">Open App</a>
              </div>
            </nav>
          </div>
        )}

        {/* Content */}
        <main className="min-w-0 flex-1 px-6 py-12 sm:px-12 lg:px-16 animate-fade-up">

          {/* ── Getting Started ── */}
          <section id="getting-started" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">Getting Started</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              Connect your AI agent to ProjectBrain in under a minute. You&apos;ll need a free account and an API key.
            </p>

            <div className="mt-12 space-y-12">
              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">1. Create an account</h3>
                <p className="mt-3 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Sign in at <a href={APP_URL} className="text-[#B09E80] hover:underline transition-colors">{APP_URL}</a> using
                  GitHub or Google. A personal team is created automatically.
                </p>
              </div>

              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">2. Create an agent &amp; get an API key</h3>
                <p className="mt-3 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Go to <strong className="text-[#F0E6D2]">Team Settings → Add Agent</strong>. Give it a name,
                  then copy the <code className="text-[#B09E80] bg-[#B09E80]/10 px-1.5 py-0.5 rounded font-mono">pb_...</code> API key. It&apos;s shown once — save it securely.
                </p>
              </div>

              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">3. Add to your MCP config</h3>
                <p className="mt-3 mb-5 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Add this to your agent&apos;s MCP server configuration (works with Warp, Cursor, Claude Code, or any MCP client):
                </p>
                <Code copyable>{MCP_CONFIG}</Code>
                <p className="mt-4 text-[#D4C5B0] opacity-50 text-sm font-sans italic">
                  Replace <code className="text-[#B09E80]">pb_YOUR_API_KEY</code> with your actual key.
                </p>
              </div>

              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">4. Start your agent</h3>
                <p className="mt-3 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Your agent now has persistent project memory. It should call{" "}
                  <code className="text-[#B09E80] bg-[#B09E80]/10 px-1.5 py-0.5 rounded font-mono">context(action=&quot;session&quot;, project_id=...)</code> at the start of every session to orient itself.
                </p>
              </div>
            </div>
          </section>

          {/* ── Demo ── */}
          <section id="demo" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">Demo</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              End-to-end walkthrough: create an agent, wire up a project, assign a workflow stage, create a task, and watch the agent implement it and open a pull request — all autonomously.
            </p>

            <div className="mt-10 overflow-hidden rounded-2xl border border-[#2A2722] bg-[#0A0A0B] shadow-2xl">
              <video
                src="/demo.mp4"
                controls
                playsInline
                className="w-full"
              />
            </div>

            <div className="mt-14 space-y-10">
              <h2 className="font-display text-2xl font-medium text-[#F0E6D2]">What&apos;s happening in the video</h2>

              {[
                {
                  step: "1",
                  title: "Create an agent",
                  body: "Open the Team page and click Add Agent. Enter a name, choose the Claude Code adapter, and paste your Anthropic API key. After the agent is created, open its Edit Card, expand the Advanced section, and save a GitHub personal access token so the agent can open pull requests.",
                },
                {
                  step: "2",
                  title: "Create a project",
                  body: "Navigate to Projects and click New Project. Type a project name and confirm. ProjectBrain creates an isolated workspace — its own task board, knowledge base, workflow stages, and team roster.",
                },
                {
                  step: "3",
                  title: "Connect a GitHub repository",
                  body: "Open the project, go to Manage → Settings, select the GitHub repository from the dropdown, and click Save Settings. The agent will push branches and open PRs against this repo.",
                },
                {
                  step: "4",
                  title: "Assign the agent to a workflow stage",
                  body: "Switch to the Workflow tab. Click the In Progress stage to open its configuration panel, assign the agent as the Implementer, and save. The runner now knows which agent to dispatch when a task enters this stage.",
                },
                {
                  step: "5",
                  title: "Create a task",
                  body: "Go to the Tasks tab, click New Task, enter a title, and create it. The task is immediately moved to In Progress so the runner can pick it up.",
                },
                {
                  step: "6",
                  title: "Agent runs autonomously (4× speed)",
                  body: "The terminal shows pb supervise starting the collaborator loop. The agent picks up the task, reads the project context via MCP, writes code, commits it to a new branch, and updates the task status as it works. The browser view shows the task moving through the board in real time.",
                },
                {
                  step: "7",
                  title: "Pull request opened on GitHub",
                  body: "Once the agent finishes, the video navigates to the pull request it opened. The diff view shows the implementation — written, committed, and submitted entirely by the agent without any human intervention.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-6">
                  <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2722] bg-[#141311] font-mono text-sm font-semibold text-[#B09E80]">
                    {step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-display text-xl font-medium text-[#F0E6D2]">{title}</h3>
                    <p className="mt-2 leading-relaxed text-[#D4C5B0] opacity-70 font-sans">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CLI ── */}
          <section id="cli" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">CLI (pb)</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              The <code className="text-[#B09E80] bg-[#B09E80]/10 px-1.5 py-0.5 rounded font-mono">pb</code> CLI lets you manage tasks, knowledge, and agents from the terminal — and run the collaborator loop that dispatches work to AI agents.
            </p>

            <div className="mt-12 space-y-12">
              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">1. Install</h3>
                <p className="mt-3 mb-5 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Requires Python 3.11+.
                </p>
                <Code copyable>pip install project-brain</Code>
              </div>

              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">2. Log in</h3>
                <p className="mt-3 mb-5 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Authenticate with Google or GitHub (opens a browser), or paste an API key directly.
                </p>
                <div className="space-y-3">
                  <Code copyable>pb login --google</Code>
                  <Code copyable>pb login --github</Code>
                  <Code copyable>pb login --token pb_YOUR_API_KEY</Code>
                </div>
              </div>

              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">3. Browse tasks</h3>
                <p className="mt-3 mb-5 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  List and inspect tasks across your project.
                </p>
                <div className="space-y-3">
                  <Code copyable>pb tasks list --project &lt;project-id&gt;</Code>
                  <Code copyable>pb tasks get &lt;task-id&gt;</Code>
                </div>
              </div>

              <div className="group border-l border-[#2A2722] pl-8 py-2 hover:border-[#B09E80] transition-colors">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2]">4. Run an agent</h3>
                <p className="mt-3 mb-5 text-[#D4C5B0] opacity-70 leading-relaxed font-sans">
                  Start the collaborator loop — the runner polls for queued tasks and dispatches them to the chosen agent. GitHub mode (Docker + PR workflow) is enabled automatically when the project has GitHub configured.
                </p>
                <Code copyable>pb run --project &lt;project-id&gt; --agent &lt;name&gt;</Code>
                <p className="mt-4 text-[#D4C5B0] opacity-50 text-sm font-sans italic">
                  Omit <code className="text-[#B09E80]">--agent</code> to pick from an interactive list.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A2722] bg-[#141311] p-8 shadow-xl">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2] mb-6">All commands</h3>
                <div className="space-y-3">
                  {[
                    ["pb login", "Authenticate (Google, GitHub, or API key)"],
                    ["pb whoami", "Show the currently authenticated user"],
                    ["pb projects list", "List all projects"],
                    ["pb tasks list", "List tasks in a project"],
                    ["pb tasks get <id>", "Show a single task"],
                    ["pb tasks create", "Create a new task"],
                    ["pb knowledge list", "List knowledge entries"],
                    ["pb knowledge get <id>", "Show a knowledge entry"],
                    ["pb run", "Start the agent collaborator loop"],
                  ].map(([cmd, desc]) => (
                    <div key={cmd as string} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6 rounded-xl border border-[#2A2722] bg-[#0A0A0B] px-5 py-3">
                      <code className="font-mono text-sm text-[#B09E80] shrink-0">{cmd}</code>
                      <span className="text-[#D4C5B0] opacity-60 text-sm font-sans">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Claude Code Skill ── */}
          <section id="claude-code-skill" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">Claude Code Skill</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              The official Claude Code skill gives Claude deep, built-in knowledge of Project Brain workflows,
              tool APIs, and knowledge-capture patterns — without pasting a system prompt.
            </p>

            <div className="mt-12 space-y-12">
              <div>
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2] mb-4">Install</h3>
                <Code copyable>npx skills add project-brain-skill -g -y</Code>
              </div>

              <div className="rounded-2xl border border-[#2A2722] bg-[#141311] p-8 shadow-xl">
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2] mb-6">What the skill does</h3>
                <p className="text-[#D4C5B0] opacity-70 mb-6 font-sans">
                  Once installed, Claude Code automatically loads the skill when you mention Project Brain or any of its tools.
                </p>
                <ul className="space-y-4">
                  {[
                    { label: "Session start workflow", desc: "reminds Claude to call context(action=\"session\") before acting" },
                    { label: "Proactive knowledge logging", desc: "guidance on when and how to create facts, decisions, and skills" },
                    { label: "Complete tool API reference", desc: "all six MCP tools with every action and parameter" },
                    { label: "Knowledge quality patterns", desc: "examples of good vs. bad entries and anti-patterns" },
                    { label: "Agent handoff workflow", desc: "how to leave clean state when handing off to another agent" },
                  ].map((item) => (
                    <li key={item.label} className="flex gap-4 items-start">
                      <span className="text-[#B09E80] mt-1 shrink-0">→</span>
                      <span className="text-[#D4C5B0] leading-relaxed font-sans"><strong className="text-[#F0E6D2] font-medium">{item.label}</strong> — {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display text-2xl font-medium text-[#F0E6D2] mb-6">Trigger phrases</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    "log this to project brain",
                    "check the knowledge base",
                    "load project context",
                    "create a task",
                    "track this decision",
                    "log a fact",
                    "send a message to an agent",
                    "check my inbox",
                  ].map((phrase) => (
                    <div key={phrase} className="rounded-xl border border-[#2A2722] bg-[#0A0A0B] px-5 py-3 font-mono text-sm text-[#D4C5B0] opacity-60">
                      &ldquo;{phrase}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Tools Reference ── */}
          <section id="tools" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">MCP Tools Reference</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              All tools available to your agent via MCP, grouped by category.
            </p>

            <div className="mt-12 space-y-12">
              {TOOL_GROUPS.map(({ group, tools }) => (
                <div key={group} className="relative">
                  <h3 className="mb-6 text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#B09E80] opacity-50">{group}</h3>
                  <div className="space-y-4">
                    {tools.map(([tool, desc]) => {
                      const params = resolveToolParams(tool);
                      const isExpanded = !!expandedToolParams[tool];
                      const hasParams = params.length > 0;
                      const toolLabel = formatToolLabel(tool);

                      return (
                        <div key={tool} className="rounded-2xl border border-[#2A2722] bg-[#141311] shadow-lg transition-all hover:border-[#B09E80]/20">
                          <div className="p-6">
                            <div className="mb-4 overflow-x-auto rounded-xl border border-[#2A2722] bg-[#0A0A0B] p-4">
                              <code className="font-mono text-sm leading-relaxed text-[#B09E80] whitespace-pre-wrap break-words">{toolLabel}</code>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-[#D4C5B0] opacity-70 font-sans">{desc}</span>
                              {hasParams && (
                                <button
                                  type="button"
                                  onClick={() => toggleToolParams(tool)}
                                  className="w-fit shrink-0 rounded-lg border border-[#2A2722] px-4 py-2 text-xs font-semibold text-[#D4C5B0] transition-all hover:border-[#B09E80]/50 hover:bg-[#B09E80]/5"
                                >
                                  {isExpanded ? "Hide parameters" : "Show parameters"}
                                </button>
                              )}
                            </div>
                          </div>
                          {hasParams && isExpanded && (
                            <div className="border-t border-[#2A2722] bg-[#0A0A0B]/50 p-6 rounded-b-2xl">
                              <p className="mb-4 text-xs font-mono font-bold uppercase tracking-widest text-[#B09E80] opacity-40">Parameters</p>
                              <div className="grid gap-4">
                                {params.map((param) => (
                                  <div key={param.name} className="flex flex-col sm:flex-row sm:gap-6 border-b border-[#2A2722]/50 pb-4 last:border-0 last:pb-0">
                                    <code className="w-48 shrink-0 text-sm font-mono font-bold text-[#F0E6D2]">
                                      {param.name}{param.optional ? "?" : ""}
                                    </code>
                                    <span className="text-sm text-[#D4C5B0] opacity-60 font-sans leading-relaxed">
                                      {param.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
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
          <section id="workflow" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">Agent Workflow</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              The recommended workflow for agents using ProjectBrain. Follow these steps every session.
            </p>

            <div className="mt-12 space-y-8">
              <div className="rounded-2xl border border-[#2A2722] bg-[#141311] p-10 shadow-xl">
                <h3 className="mb-8 font-mono text-sm font-bold uppercase tracking-widest text-[#B09E80] opacity-60">The Session Loop</h3>
                <div className="space-y-10">
                  {[
                    { step: "1", code: 'context(action="session", project_id)', desc: "orient yourself: tasks, decisions, facts, skills, and team." },
                    { step: "2", code: 'tasks(action="list", status="todo")', desc: "pick work from the backlog." },
                    { step: "3", code: 'tasks(action="update", status="in_progress")', desc: "claim the task and notify the team." },
                    { step: "4", code: 'knowledge(entity="...", action="create")', desc: "record tradeoffs, facts, and skills as you discover them." },
                    { step: "5", code: 'tasks(action="update", status="done")', desc: "verify changes and ship the work." },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B09E80]/10 border border-[#B09E80]/20 font-mono text-sm font-bold text-[#B09E80]">
                        {item.step}
                      </div>
                      <div>
                        <code className="block mb-2 font-mono text-base text-[#F0E6D2]">{item.code}</code>
                        <p className="text-[#D4C5B0] opacity-70 font-sans">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#2A2722] bg-[#141311] p-8 shadow-xl">
                  <h3 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-[#B09E80] opacity-60">Core Rules</h3>
                  <ul className="space-y-4 text-[#D4C5B0] opacity-70 font-sans">
                    <li className="flex gap-3"><span>•</span> <span>Always start with a full session context load.</span></li>
                    <li className="flex gap-3"><span>•</span> <span>Check existing skills before starting unfamiliar work.</span></li>
                    <li className="flex gap-3"><span>•</span> <span>Record decisions as tradeoffs (include rationale).</span></li>
                    <li className="flex gap-3"><span>•</span> <span>Update task status proactively as you work.</span></li>
                    <li className="flex gap-3"><span>•</span> <span>Read task history if you are picking up in-flight work.</span></li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#2A2722] bg-[#141311] p-8 shadow-xl">
                   <h3 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-[#B09E80] opacity-60">Knowledge Strategy</h3>
                   <dl className="space-y-5">
                      <div>
                        <dt className="text-[#F0E6D2] font-display font-medium mb-1">Facts</dt>
                        <dd className="text-sm text-[#D4C5B0] opacity-60 font-sans">Durable rules, conventions, and project constraints.</dd>
                      </div>
                      <div>
                        <dt className="text-[#F0E6D2] font-display font-medium mb-1">Decisions</dt>
                        <dd className="text-sm text-[#D4C5B0] opacity-60 font-sans">Specific architectural or design choices with reasoning.</dd>
                      </div>
                      <div>
                        <dt className="text-[#F0E6D2] font-display font-medium mb-1">Skills</dt>
                        <dd className="text-sm text-[#D4C5B0] opacity-60 font-sans">Reusable procedures and multi-step workflows for future sessions.</dd>
                      </div>
                   </dl>
                </div>
              </div>
            </div>
          </section>

          {/* ── Gherkin Style ── */}
          <section id="gherkin-style" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">Gherkin-style Prompts</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              ProjectBrain uses the Given/When/Then Gherkin structure for all agent prompts to maximize determinism and reliability.
            </p>
            
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { title: "Given", desc: "Establishes the persona, state, and available tools before action." },
                { title: "When", desc: "Defines the exact trigger or condition that causes an action." },
                { title: "Then", desc: "Specifies the precise outcome, format, and behavior expected." },
              ].map(item => (
                <div key={item.title} className="rounded-2xl border border-[#2A2722] bg-[#141311] p-8">
                   <h3 className="font-mono text-xl font-bold text-[#B09E80] mb-3">{item.title}</h3>
                   <p className="text-sm text-[#D4C5B0] opacity-60 font-sans leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-[#B09E80]/20 bg-[#B09E80]/5 p-8 font-sans">
               <h3 className="font-display text-2xl text-[#F0E6D2] mb-4">Best Practices</h3>
               <ul className="space-y-4 text-[#D4C5B0] opacity-80">
                  <li className="flex gap-4">
                    <span className="text-[#B09E80] shrink-0 font-bold">01.</span>
                    <span><strong className="text-[#F0E6D2] font-medium">Positive Framing</strong> — Tell the agent what to do instead of what to avoid.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-[#B09E80] shrink-0 font-bold">02.</span>
                    <span><strong className="text-[#F0E6D2] font-medium">Scenario Isolation</strong> — Use explicit scenarios to handle happy paths vs error branches.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-[#B09E80] shrink-0 font-bold">03.</span>
                    <span><strong className="text-[#F0E6D2] font-medium">Deterministic Outcomes</strong> — Be highly specific about the structure and tone of the response.</span>
                  </li>
               </ul>
            </div>
          </section>

          {/* ── Memory Curation ── */}
          <section id="curation" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">Memory Curation</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              An automated curator periodically reviews your knowledge base for duplicates and quality issues, surfacing suggestions in the UI.
            </p>

            <div className="mt-12 space-y-8">
              <div className="rounded-2xl border border-[#2A2722] bg-[#141311] p-8 shadow-xl">
                <h3 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-[#B09E80] opacity-60">Recommendation Types</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                   {[
                     { label: "MERGE", color: "bg-blue-500/20 text-blue-300", desc: "Combines semantically equivalent entries into one canonical record." },
                     { label: "ARCHIVE", color: "bg-orange-500/20 text-orange-300", desc: "Removes stale or irrelevant knowledge that is no longer useful." },
                     { label: "REFRESH", color: "bg-teal-500/20 text-teal-300", desc: "Confirms an entry is still current to prevent staleness warnings." },
                     { label: "FLAG", color: "bg-yellow-500/20 text-yellow-300", desc: "Identifies quality issues like vague titles or missing rationale." },
                     { label: "SUPERSEDE", color: "bg-purple-500/20 text-purple-300", desc: "Links an old entry to a newer, more relevant replacement." },
                   ].map(type => (
                     <div key={type.label} className="flex flex-col gap-3">
                        <span className={`w-fit rounded px-2 py-0.5 text-xs font-bold font-mono tracking-widest ${type.color}`}>{type.label}</span>
                        <p className="text-sm text-[#D4C5B0] opacity-60 font-sans leading-relaxed">{type.desc}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── System Prompt ── */}
          <section id="system-prompt" className="mb-24">
            <h1 className="font-display text-4xl font-medium text-[#F0E6D2] md:text-5xl tracking-tight">System Prompt</h1>
            <p className="mt-4 text-lg text-[#D4C5B0] opacity-70 leading-relaxed font-sans max-w-2xl">
              Copy this into your agent&apos;s system prompt or rules file. It gives the agent full context on how to use ProjectBrain.
            </p>
            <div className="mt-12">
              <Code copyable wrap>{SYSTEM_PROMPT}</Code>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2A2722] py-16 bg-[#0A0A0B]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="flex items-center gap-3 font-display text-xl font-medium text-[#F0E6D2]">
              <img src="/favicon.svg" alt="ProjectBrain" className="h-7 w-7 filter sepia-[0.5] saturate-50" />
              ProjectBrain Docs
            </span>
            <p className="text-[#D4C5B0] opacity-30 text-sm font-sans">
              Documentation for the shared context era.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 font-sans text-sm text-[#D4C5B0]">
            <a href={MARKETING_URL} className="opacity-50 hover:opacity-100 transition-opacity">Home</a>
            <a href={BLOG_URL} className="opacity-50 hover:opacity-100 transition-opacity">Blog</a>
            <a href={APP_URL} className="opacity-50 hover:opacity-100 transition-opacity">App</a>
            <a href={EDIT_THIS_PAGE_URL} className="opacity-50 hover:opacity-100 transition-opacity">GitHub</a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 mt-12 pt-8 border-t border-[#2A2722]/30 text-center sm:text-left text-xs font-sans text-[#D4C5B0] opacity-20">
           &copy; {new Date().getFullYear()} ProjectBrain. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
