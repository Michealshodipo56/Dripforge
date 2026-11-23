# DripForge MVP deployment — not production hardened

This is an **experimental vertical slice**, not the completed DripForge specification. It can browse assigned GitHub issues and attempt a draft PR using a containerized coding worker, but it does **not** monitor and repair GitHub CI, manage multiple GitHub identities, or implement the production PostgreSQL and Redis architecture. Do not use with untrusted repositories or broad-scope credentials.

## Prerequisites
- Dedicated Linux VM with Docker and Compose; do not share a Docker host with unrelated production services.
- Scoped GitHub token with access to selected repositories, issues, contents and pull requests.
- AI provider API key for an OpenAI-compatible chat-completions endpoint.
- Reverse proxy with HTTPS, authentication, and restricted access.
- Sufficient disk, memory and outbound connectivity for cloning and package installation.

## Commands (from repository root)
1. Copy `.env.example` to `.env` and fill in secrets. Generate a long random ADMIN_TOKEN. Never commit it.
2. Build worker: `docker build -f workers/runner/Dockerfile -t dripforge-runner:local .`
3. Start API: `docker compose -f deploy/compose.yml up -d --build`
4. Verify: `curl http://127.0.0.1:4118/health`
5. Authenticate with `Authorization: Bearer <ADMIN_TOKEN>` to `GET /api/me`, `GET /api/issues`, `GET /api/jobs`, and `POST /api/jobs` with JSON `{"repo":"owner/name","issue":123}`.

**Security warning:** The MVP API container mounts `/var/run/docker.sock`, which grants effectively host-level privileges. Replace this architecture with a separately authenticated worker service before production or multi-user deployment. Worker network egress is not restricted. Model-generated test commands execute untrusted repository code inside the worker; do not run on a shared Oracle VM. Do not expose the API publicly without an HTTPS reverse proxy and access controls.

## Limitations
- Single GitHub token and one active job.
- JSON-file state storage; PostgreSQL migration exists but is not wired.
- Draft PR creation after local tests only; no GitHub Actions check reconciliation.
- No automated retry of interrupted jobs, no fork PR support.
- No fully integrated web frontend.
- A created draft PR is **not** proof of passing CI.
