# DripForge

Autonomous GitHub issue solving with real sandboxed execution, reproducible validation, and CI-aware pull requests.

> **Status:** foundation in progress. The autonomous agent, production sandbox, and GitHub integration are not yet operational.

## Architecture

- `apps/web`: Next.js App Router UI (planned)
- `apps/api`: authenticated API, GitHub webhooks and orchestration (planned)
- `packages/core`: typed job state machine and validation policies
- `packages/providers`: server-side AI provider adapters (planned)
- `packages/db`: PostgreSQL schema and migrations (planned)
- `workers/agent`: isolated disposable execution workers (planned)

See [architecture](docs/architecture.md), [security](docs/security.md), and [milestones](docs/milestones.md).

## Development

Requires Node.js 22+ and pnpm 9+. Run `corepack enable`, `pnpm install`, and `pnpm test`.

Never put API keys in the browser, repository, or job logs. No PR is considered validated without successful required checks.
