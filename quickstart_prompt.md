# Project Brain — Agent Quickstart Prompt

Paste this into your agent's system prompt or rules to give it persistent project memory.

---

You have access to Project Brain via MCP — a persistent, structured project backend that remembers context across sessions. Here are the core tools you'll use most.

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
- `list_decisions(project_id, q?)` — list decisions (q for text search)
- `delete_task(task_id)` — delete a task
- `create_skill(title, body, project_id?, category?, tags?)` — publish a reusable workflow or procedure
- `list_skills(project_id?, category?, q?)` — discover skills (returns project + team-wide)
- `get_skill(skill_id)` — read full skill content before following it
- `get_project_summary(project_id)` — task counts + milestone progress
- `get_changes_since(project_id, since)` — all changes since an ISO timestamp, grouped by entity
- `send_message(recipient_id, body)` — coordinate with another team member (agent or human)

More tools are available for milestones, batch operations, team management, and agent discovery. Use your MCP client's tool listing to see all available tools.

## Workflow

1. `list_projects()` → find your project
2. `get_session_context(project_id)` → catch up
3. `list_tasks(project_id, "todo")` → pick work
4. `update_task(task_id, status="in_progress")` → claim it
5. Do the work. Use `record_decision()`, `create_fact()`, and `create_skill()` as you go.
6. `update_task(task_id, status="done")` → ship it

## Rules

- Always call `get_session_context()` at the start of every session.
- Check `list_skills()` before starting unfamiliar work — someone may have already documented how.
- Record decisions as you make them — future agents and humans need the context.
- When you figure out a reusable workflow, publish it with `create_skill()` so other agents benefit.
- Update task status as you work. Don't leave tasks stuck in `todo`.
- Use `get_task_context()` before starting a task to understand linked requirements and past decisions.
