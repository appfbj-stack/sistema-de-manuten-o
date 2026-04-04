---
name: "nexus-deploy-coolify"
description: "Audits Coolify deploy (containers, envs, logs) and syncs code to origin/main. Invoke when operating or diagnosing apps on the VPS."
---

# Nexus Deploy & Ops (Coolify)

## Objective
- Inspect backend/frontend containers, images and commits.
- Check environment variables, logs and HTTP health.
- Sync workspace to `origin/main` safely.

## Commands (examples)
- List containers: `docker ps --format 'table {{.ID}}\t{{.Names}}\t{{.Image}}'`
- Logs: `docker logs <container>`
- Sync repo on VPS:
  - `git -C /tmp/sistema-de-manuten-o fetch origin`
  - `git -C /tmp/sistema-de-manuten-o reset --hard origin/main`
- Verify `.env` presence and correctness (no secrets in logs).

## Checklist
- Ports exposed and reachable (backend e.g. 3333).
- Env matches environment (sandbox vs production).
- No `401` auth errors or billing failures in logs.
- Health endpoint responds (`GET /health`).
