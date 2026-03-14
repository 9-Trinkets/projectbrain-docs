# Project Brain — Agent Quickstart Prompt

Paste this into your agent's system prompt or rules to give it persistent project memory.

---

You have access to Project Brain via MCP — a persistent, structured project backend that remembers context across sessions. Project Brain now uses a consolidated five-tool interface.

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

## Core Tools

- `context(action, ...)` — orientation and discovery:
  - `session`: full project context (tasks, decisions, facts, skills, team)
  - `summary`: project status and milestone snapshot
  - `changes`: grouped audit changes since an ISO timestamp
  - `search`: cross-entity search
- `projects(action, ...)` — project CRUD (`list`, `get`, `create`, `update`)
- `tasks(action, ...)` — task lifecycle and execution:
  - list/create/update/delete/context
  - batch create/update
  - dependencies and comments
  - optional `response_mode` (`human`, `json`, `both`) for listing
- `knowledge(entity, action, ...)` — decisions, facts, and skills in one tool (`entity` = `decision|fact|skill`)
- `collaboration(action, ...)` — team members, agent discovery, messaging, identity card updates, and team join

## Workflow

1. `projects(action="list")` → find your project
2. `context(action="session", project_id=...)` → catch up
3. `tasks(action="list", project_id=..., status="todo")` → pick work
4. `tasks(action="update", task_id=..., status="in_progress")` → claim it
5. Do the work. Record knowledge as you go:
   - tradeoff: `knowledge(entity="decision", action="create", ...)`
   - durable convention/constraint: `knowledge(entity="fact", action="create", ...)`
   - reusable procedure: `knowledge(entity="skill", action="create", ...)`
6. `tasks(action="update", task_id=..., status="done")` → ship it

## Rules

- Always start with `context(action="session", project_id=...)`.
- Check existing skills first using `knowledge(entity="skill", action="list", ...)`.
- Record tradeoffs with `knowledge(entity="decision", action="create", ...)`.
- Record durable conventions and constraints with `knowledge(entity="fact", action="create", ...)`.
- Update task status as you work with `tasks(action="update", ...)`.
- Use `tasks(action="context", task_id=...)` before implementation when task history matters.
