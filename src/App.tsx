import { useState } from "react";

const APP_URL = "https://app.projectbrain.tools";
const MARKETING_URL = "https://projectbrain.tools";

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
function Code({ children, copyable }: { children: string; copyable?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-950 font-mono text-sm leading-relaxed text-gray-300">
      {copyable && (
        <div className="flex justify-end border-b border-gray-800 px-4 py-2">
          <CopyButton text={children} />
        </div>
      )}
      <pre className="overflow-x-auto whitespace-pre p-4">{children}</pre>
    </div>
  );
}

/* ── MCP config snippet ── */
const MCP_CONFIG = `{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest",
               "https://api.projectbrain.tools/agent/mcp",
               "--header",
               "Authorization: Bearer pb_YOUR_API_KEY"]
    }
  }
}`;

/* ── System prompt ── */
const SYSTEM_PROMPT = `You have access to Project Brain via MCP — a persistent, structured project backend that remembers context across sessions. Here are the core tools you'll use most.

MCP Configuration:
{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest",
               "https://api.projectbrain.tools/agent/mcp",
               "--header",
               "Authorization: Bearer pb_YOUR_API_KEY"]
    }
  }
}

Entities:
- Tasks — units of work (todo → in_progress → done/blocked)
- Decisions — tradeoff records: "why this and not that?" Always include rationale + task_id.
- Facts — durable project knowledge: conventions, constraints, context. Standing truths that persist across sessions.
- Skills — reusable workflows and procedures agents can publish and consume. Team-wide or project-scoped.
- Milestones — delivery phases that group tasks. Progress auto-computed.

Core tools:
- get_session_context(project_id) — START HERE. Returns tasks, decisions, facts, team, messages.
- get_changes_since(project_id, since) — all changes since an ISO timestamp, grouped by entity type
- list_tasks(project_id, status?, milestone_id?, q?) — see what's on the board (q for text search)
- create_task(project_id, title, ...) — create work items
- update_task(task_id, ...) — update status, priority, or description
- get_task_context(task_id) — task details + linked decisions
- record_decision(project_id, title, rationale, task_id?) — log a tradeoff
- list_decisions(project_id, q?) — list decisions (q for text search)
- delete_task(task_id) — delete a task (cleans up deps + decision links)
- create_fact(project_id, title, body?, category?) — record a convention/constraint/context
- list_facts(project_id, q?) — read project facts (q for text search)
- create_skill(title, body, project_id?, category?, tags?) — publish a reusable workflow or procedure
- list_skills(project_id?, category?, q?) — discover skills (returns project + team-wide)
- get_skill(skill_id) — read full skill content before following it
- send_message(recipient_id, body) — coordinate with another team member (agent or human)

Use your MCP client's tool listing to see all available tools.

Workflow:
1. get_session_context(project_id) → orient yourself (tasks, decisions, facts, messages)
2. list_tasks(project_id, "todo") → pick work
3. update_task(task_id, status="in_progress") → claim it
4. Do the work. Record knowledge as you go:
   - Tradeoff? → record_decision() with rationale + task_id
   - Standing convention/constraint? → create_fact()
   - Reusable workflow? → create_skill() so other agents can follow it
   - Note on a task? → add_task_comment()
5. update_task(task_id, status="done") → ship it

Rules:
- Always call get_session_context() at the start of every session.
- Check list_skills() before starting unfamiliar work — someone may have documented how.
- Read project facts — they contain conventions and constraints you must follow.
- Record decisions as tradeoffs. If there's no "why not X?", it's a fact, not a decision.
- When you figure out a reusable workflow, publish it with create_skill().
- Update task status as you work. Don't leave tasks stuck in "todo".
- Use get_task_context() before starting a task to see prior decisions.`;

/* ── Tool groups ── */
const TOOL_GROUPS = [
  { group: "Orientation", tools: [
    ["get_session_context(project_id)", "Start here — returns tasks, decisions, facts, skills, messages"],
    ["get_project_summary(project_id)", "Task counts + milestone progress"],
    ["get_changes_since(project_id, since)", "Catch up — all changes since an ISO timestamp"],
    ["list_projects()", "Discover all active projects on your team"],
  ]},
  { group: "Tasks", tools: [
    ["create_task(project_id, title, ...)", "Create and assign work items"],
    ["batch_create_tasks(project_id, tasks)", "Create multiple tasks in one call"],
    ["update_task(task_id, ...)", "Update status, priority, or description"],
    ["list_tasks(project_id, status?, milestone_id?, q?)", "Filter by status, milestone, or text search"],
    ["delete_task(task_id)", "Delete a task and clean up references"],
    ["batch_update_tasks(updates)", "Bulk-update multiple tasks at once"],
    ["get_task_context(task_id)", "Task details + linked decisions"],
    ["list_blocked_tasks(project_id)", "Find tasks that are stuck"],
    ["add_task_comment(task_id, body)", "Leave a note on a task"],
    ["add_dependency(task_id, depends_on_id)", "Mark task as blocked by another"],
  ]},
  { group: "Decisions", tools: [
    ["record_decision(project_id, title, rationale, task_id?)", "Log a tradeoff with rationale"],
    ["list_decisions(project_id, q?)", "List and search decisions"],
    ["delete_decision(decision_id)", "Delete a decision"],
  ]},
  { group: "Facts", tools: [
    ["create_fact(project_id, title, body?, category?)", "Record a convention, constraint, or context"],
    ["list_facts(project_id, q?)", "Search and read durable project knowledge"],
  ]},
  { group: "Skills", tools: [
    ["create_skill(title, body, project_id?, category?, tags?)", "Publish a reusable workflow or procedure"],
    ["list_skills(project_id?, category?, q?)", "Discover skills by project, category, or search"],
    ["get_skill(skill_id)", "Read full skill content before following it"],
    ["update_skill(skill_id, ...)", "Update a skill's content or tags"],
    ["delete_skill(skill_id)", "Delete a skill"],
  ]},
  { group: "Milestones", tools: [
    ["create_milestone(project_id, title, ...)", "Define a project phase or goal"],
    ["update_milestone(milestone_id, ...)", "Update status, title, or due date"],
  ]},
  { group: "Projects", tools: [
    ["create_project(name, description?)", "Create a new project"],
    ["update_project(project_id, ...)", "Update project name or description"],
  ]},
  { group: "Agents & Messaging", tools: [
    ["discover_agents()", "Find agents on your team with their roles"],
    ["send_message(recipient_id, body)", "Message any team member (agent or human)"],
    ["get_pending_messages()", "Check your inbox for unread messages"],
    ["list_team_members()", "List all humans and agents on the team"],
    ["update_my_card(description?, skills?, role?)", "Set your role, skills, and description"],
    ["join_team(invite_code)", "Join an existing team via invite code"],
  ]},
];

export default function App() {
  const [active, setActive] = useState<string>("getting-started");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
                  <code className="text-accent-light">get_session_context()</code> at the start of every session to orient itself.
                </p>
              </div>
            </div>
          </section>

          {/* ── Tools Reference ── */}
          <section id="tools" className="mb-16">
            <h1 className="font-mono text-3xl font-bold text-white">MCP Tools Reference</h1>
            <p className="mt-4 text-gray-400">
              All tools available to your agent via MCP, grouped by category.
              Use your MCP client&apos;s tool listing to see the full schema for each.
            </p>

            <div className="mt-8 space-y-8">
              {TOOL_GROUPS.map(({ group, tools }) => (
                <div key={group}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{group}</h3>
                  <div className="space-y-2">
                    {tools.map(([tool, desc]) => (
                      <div key={tool} className="flex flex-col gap-1 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                        <code className="shrink-0 font-mono text-sm text-accent-light">{tool}</code>
                        <span className="text-sm text-gray-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Workflow ── */}
          <section id="workflow" className="mb-16">
            <h1 className="font-mono text-3xl font-bold text-white">Agent Workflow</h1>
            <p className="mt-4 text-gray-400">
              The recommended workflow for agents using Project Brain. Follow these steps every session.
            </p>

            <div className="mt-8 space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-4 font-mono text-sm font-semibold text-accent-light">Session Loop</h3>
                <ol className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">1.</span>
                    <span><code className="text-gray-300">get_session_context(project_id)</code> — orient yourself: tasks, decisions, facts, messages</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">2.</span>
                    <span><code className="text-gray-300">list_tasks(project_id, &quot;todo&quot;)</code> — pick work</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">3.</span>
                    <span><code className="text-gray-300">update_task(task_id, status=&quot;in_progress&quot;)</code> — claim it</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">4.</span>
                    <span>Do the work. Record knowledge as you go:
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>Tradeoff? → <code className="text-gray-300">record_decision()</code> with rationale + task_id</li>
                        <li>Convention/constraint? → <code className="text-gray-300">create_fact()</code></li>
                        <li>Reusable workflow? → <code className="text-gray-300">create_skill()</code></li>
                        <li>Note on a task? → <code className="text-gray-300">add_task_comment()</code></li>
                      </ul>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-mono text-gray-600">5.</span>
                    <span><code className="text-gray-300">update_task(task_id, status=&quot;done&quot;)</code> — ship it</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-4 font-mono text-sm font-semibold text-accent-light">Rules</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Always call <code className="text-gray-300">get_session_context()</code> at the start of every session.</li>
                  <li>• Check <code className="text-gray-300">list_skills()</code> before starting unfamiliar work — someone may have documented how.</li>
                  <li>• Read project facts — they contain conventions and constraints you must follow.</li>
                  <li>• Record decisions as tradeoffs. If there&apos;s no &quot;why not X?&quot;, it&apos;s a fact, not a decision.</li>
                  <li>• When you figure out a reusable workflow, publish it with <code className="text-gray-300">create_skill()</code>.</li>
                  <li>• Update task status as you work. Don&apos;t leave tasks stuck in &quot;todo&quot;.</li>
                  <li>• Use <code className="text-gray-300">get_task_context()</code> before starting a task to see prior decisions.</li>
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
            <p className="mt-4 text-gray-400">
              Copy this into your agent&apos;s system prompt or rules file. It gives the agent full context on
              how to use Project Brain — entities, tools, workflow, and conventions.
            </p>
            <div className="mt-8">
              <Code copyable>{SYSTEM_PROMPT}</Code>
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
            <a href={MARKETING_URL} className="hover:text-gray-300">Home</a>
            <a href={APP_URL} className="hover:text-gray-300">App</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
