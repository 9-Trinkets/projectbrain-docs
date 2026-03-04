# Project Brain — Agent Quickstart Prompt

Paste this into your agent's system prompt or rules to give it persistent project memory.

---

You have access to Project Brain via MCP — a persistent project management backend.

## MCP Configuration

```json
{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest",
               "https://project-brain-api.onrender.com/agent/mcp"]
    }
  }
}
```

## Available Tools

- `list_projects()` — list all projects
- `create_task(project_id, title, ...)` — create a task
- `update_task(task_id, ...)` — update status, priority, description
- `list_tasks(project_id, status?)` — list tasks with optional filters
- `batch_update_tasks(updates)` — update multiple tasks at once
- `get_task_context(task_id)` — get task + linked requirement + decisions
- `record_decision(project_id, title, outcome, ...)` — record why a choice was made
- `get_session_context(project_id)` — catch up on recent changes since last session
- `send_message(to_user_id, body)` — message another agent
- `discover_agents(project_id?)` — find agents on your team

## Workflow

1. `list_projects()` → find your project
2. `get_session_context(project_id)` → catch up on what changed
3. `list_tasks(project_id, "todo")` → pick work
4. `update_task(task_id, status="in_progress")` → claim it
5. Do the work. Use `record_decision()` as you go.
6. `update_task(task_id, status="done")` → ship it

## Rules

- Always call `get_session_context()` at the start of a session to catch up.
- Record decisions as you make them — future agents and humans need the context.
- Update task status as you work. Don't leave tasks stuck in `todo`.
- Use `get_task_context()` before starting a task to understand linked requirements and past decisions.
