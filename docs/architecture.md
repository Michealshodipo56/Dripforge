# Architecture

DripForge separates its control plane from its execution plane.

## Control plane
The web UI communicates with an authenticated API. The API persists user, repository, issue, job, credential, audit and cost records in PostgreSQL. Redis/BullMQ schedules work; durable database state is authoritative. GitHub App installation tokens are minted server-side with minimal scopes.

## Execution plane
A worker leases a job and creates a fresh, resource-limited sandbox with an isolated workspace and network policy. Repository files, issue text, tool output, and agent suggestions are untrusted. Workers do not receive long-lived provider keys or cloud credentials. All commands produce exit codes and bounded, redacted logs.

## Job state
A durable state machine controls investigation, planning, implementation, validation, PR submission and CI repair. Retries are bounded. Idempotency keys prevent duplicate issue jobs and pull requests. A worker restart must reconcile external side effects before retrying.

## Validation
Only observed command exits and GitHub required-check conclusions count as validation. Missing required checks, ambiguous check status, blocked secrets, or infrastructure errors cannot be treated as success.

## Development principle
Implement end-to-end vertical slices; do not substitute static issue examples or fake terminal logs for integrations.
