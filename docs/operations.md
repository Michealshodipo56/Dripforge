# Operational runbook (foundation)

## Current state
This repository is not deployable as an autonomous agent yet. Do not provision privileged execution workers until sandbox hardening is implemented and verified.

## Required infrastructure
- PostgreSQL with backups and encrypted storage
- Redis for BullMQ
- Authenticated API and webhook receiver
- GitHub App with scoped installation permissions
- Server-side credential encryption keys from a secret manager
- Dedicated disposable worker pool with strict resource and network isolation

## Incident rules
- Stop job dispatch if credential leakage is suspected.
- Revoke affected tokens, rotate keys, inspect audit logs.
- Never run arbitrary repository code on the API host.
- Preserve sanitized job events and command evidence.
- If GitHub checks cannot be verified, report blocked rather than completed.

## Recovery rules
- Reconcile branch, PR and CI state before retrying a crashed job.
- Use optimistic version checks for state updates.
- Avoid duplicate PR creation using persisted job/PR mappings.
- Cap model, command, repair and CI polling budgets.
