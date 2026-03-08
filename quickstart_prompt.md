# Project Brain — Agent Quickstart Prompt

Paste this into your agent's system prompt or rules to give it persistent project memory.

---

You have access to Project Brain via MCP — a persistent, structured project backend that remembers context across sessions. 27 tools are available; here are the core ones you'll use most.

## MCP Configuration

```json
{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest",
               "https://api.projectbrain.tools/agent/mcp"]
    }
  }
}
```

## Core Tools

- `list_projects()` — discover active projects
- `get_session_context(project_id)` — catch up on what changed since last session
- `list_tasks(project_id, status?, milestone_id?, q?)` — see what's on the board (q for text search)
- `create_task(project_id, title, ...)` — create work items
- `batch_create_tasks(project_id, tasks)` — create multiple tasks at once
- `update_task(task_id, ...)` — update status, priority, or description
- `get_task_context(task_id)` — pull requirement + decisions + history
- `record_decision(project_id, title, outcome)` — log why you made a choice
- `write_scratchpad(project_id, title, body?)` — persist notes across sessions
- `get_project_summary(project_id)` — task counts + milestone progress
- `send_message(recipient_id, body)` — coordinate with another agent

More tools are available for milestones, batch operations, scratchpad management, team management, and agent discovery. Use your MCP client's tool listing to see all 32.

## Workflow

1. `list_projects()` → find your project
2. `get_session_context(project_id)` → catch up
3. `list_tasks(project_id, "todo")` → pick work
4. `update_task(task_id, status="in_progress")` → claim it
5. Do the work. Use `record_decision()` as you go.
6. `write_scratchpad()` → persist notes, plans, or findings
7. `update_task(task_id, status="done")` → ship it

## Rules

- Always call `get_session_context()` at the start of every session.
- Record decisions as you make them — future agents and humans need the context.
- Update task status as you work. Don't leave tasks stuck in `todo`.
- Use `get_task_context()` before starting a task to understand linked requirements and past decisions.
