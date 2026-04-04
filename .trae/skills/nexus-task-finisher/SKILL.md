---
name: "nexus-task-finisher"
description: "Forces objective completion with clear done criteria and fast execution flow. Invoke when tasks are stalling, taking too long, or not reaching closure."
---

# Nexus Task Finisher

## Goal
- Eliminate task drift and finish requests end-to-end.
- Reduce perceived delay by enforcing strict completion checkpoints.
- Ensure every request ends with explicit closure and next concrete action.

## When To Invoke
- User says the work is taking too long.
- User asks why the task is not finishing.
- There are multi-step operations (code + commit + deploy + DB update).
- The process is stuck in partial status without final delivery.

## Operating Protocol
1) Define done criteria in one line:
   - Example: `done = commit pushed + migration applied + deploy updated + health checks ok`.
2) Execute in sequence with hard checkpoints:
   - Code/changes
   - Build/lint/typecheck
   - Commit/push
   - DB migration/seed
   - Deploy update
   - Post-deploy verification
3) After each checkpoint, report:
   - `status: done|failed`
   - `evidence: command output summary`
   - `next step`
4) If a step fails:
   - Stop branching, fix only the blocker, retry immediately.
5) Do not end the response without:
   - Final state (completed vs blocked)
   - Exact blocker if blocked
   - One command/action to unblock

## Fast Execution Rules
- Batch independent checks in parallel when possible.
- Avoid long-running commands without immediate status checks.
- Prefer deterministic commands and short feedback loops.
- Keep final message objective and closure-focused.

## Completion Template
- Scope completed:
- Evidence:
- Remaining blockers:
- Next immediate action:
