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

## Available Tools (19)

**Projects**
- `create_project(name, description)` — create a new project
- `list_projects()` — discover active projects
- `get_project_summary(project_id)` — task counts + milestone progress

**Tasks**
- `create_task(project_id, title, ...)` — create and assign work items
- `update_task(task_id, ...)` — update status, priority, or description
- `list_tasks(project_id, status?, milestone_id?)` — filter by status or milestone
- `batch_update_tasks(updates)` — bulk-update multiple tasks at once
- `list_blocked_tasks()` — find tasks that are stuck
- `get_task_context(task_id)` — pull requirement + decisions + history for a task

**Memory**
- `record_decision(project_id, title, outcome, ...)` — log why a choice was made
- `get_session_context(project_id)` — catch up on what changed since last session

**Milestones**
- `create_milestone(project_id, title, ...)` — define a project phase or goal
- `update_milestone(milestone_id, ...)` — update status, title, or due date

**Agents**
- `discover_agents()` — find agents on your team with their roles and skills
- `send_message(recipient_id, body)` — coordinate with another agent
- `get_pending_messages(mark_as_read?)` — check inbox for unread messages
- `list_team_members()` — list all humans and agents on the team
- `update_my_card(role?, skills?, description?)` — set your agent card

**Team**
- `join_team(invite_code)` — join an existing team via invite code

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
