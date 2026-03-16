# A2A Message Metadata Contract for Automation

**Version:** 1.0
**Status:** Draft
**Scope:** All A2A messages generated or consumed by automated collaborator runners.

---

## Overview

A2A messages carry an optional `metadata` field (JSON object). For automation, this field is the structured contract between senders (runners, orchestrators) and receivers (agents, the API). All fields are optional unless marked **required**. Consumers must tolerate unknown fields for forward compatibility.

---

## Fields

### Task Context

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_id` | `string (UUID)` | Yes (for task-related messages) | The task being delegated, claimed, or updated. |
| `project_id` | `string (UUID)` | Yes | Project containing the task. Used for workflow discovery. |
| `run_id` | `string (UUID)` | No | Idempotency key for this processing attempt. Runners generate a fresh UUID per tick/attempt. Receivers use this to deduplicate. |

### Workflow State

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from_status` | `string` | No | The task's status at message send time. Must match a `WorkflowStatus.name` in the project. |
| `to_status` | `string` | No | The desired target status. Must match a `WorkflowStatus.name`. |
| `expected_status` | `string` | No | CAS (compare-and-swap) guard: the receiver should only act if the task's current status equals this value. Prevents double-transitions. |
| `stage_name` | `string` | No | Display name of the workflow stage the task belongs to at send time. Informational only — do not use for routing logic. |

### Agent Routing

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eligible_agent_roles` | `string[]` | No | Roles that may claim this task (e.g. `["reviewer", "qa"]`). Agents should self-screen before claiming. |
| `agent_hints` | `string[]` | No | Free-form hints about desired skills or context (e.g. `["python", "database"]`). Non-binding. |

### Retry / Attempt Tracking

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attempt` | `integer` | No | 1-based attempt counter. First attempt = `1`. |
| `max_attempts` | `integer` | No | Maximum attempts the sender is willing to retry. Receivers beyond this should escalate or drop. |
| `retry_after` | `string (ISO-8601)` | No | Earliest time the receiver should retry if not ready. |

### Outcome / Artifacts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `outcome` | `"success" \| "failure" \| "partial" \| "skipped"` | No | Result reported by the completing agent. |
| `artifacts` | `object` | No | Arbitrary key-value result payload (e.g. `{"pr_url": "...", "test_results": "..."`}). |
| `error` | `string` | No | Human-readable error description when `outcome` is `"failure"`. |

### Claim / Conflict

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `claim_mode` | `"exclusive" \| "collaborative"` | No | `"exclusive"` means first CAS-claim wins; others must abort. `"collaborative"` allows parallel work. Defaults to `"exclusive"`. |
| `conflict_reason` | `string` | No | Human-readable explanation when a claim attempt is rejected. |
| `conflict_code` | `"already_claimed" \| "status_mismatch" \| "not_eligible" \| "run_id_seen"` | No | Machine-readable conflict code for programmatic handling. |

---

## Message Types and Expected Metadata

| `message_type` | Core metadata fields |
|----------------|----------------------|
| `task_delegation` | `task_id`, `project_id`, `run_id`, `to_status`, `eligible_agent_roles`, `agent_hints` |
| `status_update` | `task_id`, `project_id`, `run_id`, `from_status`, `to_status`, `outcome`, `artifacts` |
| `question` | `task_id` (optional), `project_id` (optional) |
| `hello` | none required |

---

## CAS (Compare-And-Swap) Semantics

When a runner sends a `task_delegation` with `expected_status = "todo"` and `to_status = "in_progress"`:

1. The receiving agent calls `PATCH /api/tasks/{id}` with `{"status": "in_progress"}`.
2. The atomic claim API (see task `a5521314`) checks `current_status == expected_status` before writing.
3. If the check fails (another runner already claimed it), the agent receives a `409` with `conflict_code = "status_mismatch"` and should abort this attempt.

This is the **exclusive-first-CAS-wins** model. All runners are expected to implement this check before beginning work.

---

## Workflow Discovery Requirement

Runners **must not hardcode** status values. Before processing any task, a runner must:

1. Call `GET /api/projects/{project_id}/workflow` to retrieve current statuses and stages.
2. Map stage assignments to eligible agents via `claimed_agents` on each stage.
3. Re-discover on soft-retry if a mid-run workflow change is detected (e.g. `409` with `conflict_code = "status_mismatch"` where current status is unrecognized).

---

## Versioning

The contract is forward-compatible: add fields freely, never remove or repurpose existing ones. Consumers must ignore unknown fields. Breaking changes require a new contract version and migration path.

---

## Example

```json
{
  "message_type": "task_delegation",
  "metadata": {
    "task_id": "abc123",
    "project_id": "proj456",
    "run_id": "run-uuid-789",
    "from_status": "todo",
    "to_status": "in_progress",
    "expected_status": "todo",
    "stage_name": "In Progress",
    "eligible_agent_roles": ["engineer"],
    "agent_hints": ["python", "fastapi"],
    "attempt": 1,
    "max_attempts": 3,
    "claim_mode": "exclusive"
  }
}
```
