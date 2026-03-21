# ProjectBrain — Agent Quickstart Prompt

Paste this into your agent's system prompt or rules to give it persistent project memory.

---

Given you have access to ProjectBrain via MCP — a persistent, structured project backend that remembers context across sessions
And ProjectBrain uses a minimal tool interface

## MCP Configuration

```json
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
```

Note: MCP discovery (`initialize`, `notifications/initialized`, `ping`, and `tools/list`) can be called without auth for tool catalog visibility, but all tool execution still requires a bearer token.

## Core Tools

- `context(action, ...)` — orientation and discovery:
  - `session`: full project context (tasks, decisions, facts, skills, team)
  - `summary`: project status and milestone snapshot
  - `changes`: grouped audit changes since an ISO timestamp
  - `search`: cross-entity search
  - `shortlist`: intent-aware top-k tool-action shortlist (`q`, optional `limit`, optional `full_tool_mode=true` for full output)
- `projects(action, ...)` — project CRUD (`list`, `get`, `create`, `update`)
- `tasks(action, ...)` — task lifecycle and execution:
  - list/create/update/delete/context
  - batch create/update
  - milestone operations: `list_milestones`, `get_milestone`, `create_milestone`, `update_milestone`, `delete_milestone`, `reorder_milestones`
  - `batch_create`: each `items[]` object requires `title`
  - `batch_update`: each `updates[]` object requires `id` (UUID)
  - example: `tasks(action="batch_update", updates=[{"id":"<task-uuid>","status":"done"}])`
  - dependencies and comments
  - list supports `q` plus advanced text filters: `q_any`, `q_all`, `q_not`
  - optional `response_mode` (`human`, `json`, `both`) for listing
- `knowledge(entity, action, ...)` — decisions, facts, and skills in one tool (`entity` = `decision|fact|skill`)
- `collaboration(action, ...)` — team members, agent discovery, messaging, identity card updates, and team join

## Scenario: Session initialization

When you begin a new session or need to find a project
Then you must call `projects(action="list")` to find your project
And you must subsequently call `context(action="session", project_id=...)` to load full project context

## Scenario: Task execution workflow

When you are ready to pick up work
Then you must query tasks using `tasks(action="list", project_id=..., status="todo")`
And you must claim a task by updating its status using `tasks(action="update", task_id=..., status="in_progress")`
And you must check existing skills first using `knowledge(entity="skill", action="list", ...)`
And you must read task history if it exists using `tasks(action="context", task_id=...)`

When you are performing the work
Then you must record tradeoffs using `knowledge(entity="decision", action="create", ...)`
And you must record durable conventions and constraints using `knowledge(entity="fact", action="create", ...)`
And you must record reusable procedures using `knowledge(entity="skill", action="create", ...)`
And you must keep the task status updated as you work using `tasks(action="update", ...)`

When you have completed and verified the work
Then you must update the task status using `tasks(action="update", task_id=..., status="done")`
