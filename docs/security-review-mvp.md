# Security review: current MVP is not production approved

The control API uses one static admin bearer token and a single GitHub token. Credentials live in process environment. A Docker socket mount gives the control plane host-level authority. The worker runs model-generated test commands and allows repository-controlled package scripts. Network access is not egress-filtered; secrets are injected into the same worker that executes untrusted repository code. This is a **credential-exfiltration risk**, even with non-root and Linux capability drops.

**Do not deploy this on an Oracle VM that hosts other applications, secrets, or customer data.** The prototype must not be exposed publicly. Use a dedicated disposable VM for experiments with a test GitHub account and limited-scope temporary credentials.

Production remediation required: separate worker scheduler and container runtime; do not mount Docker socket into the API; per-job short-lived GitHub App installation tokens; restrict outbound network by allowlist/proxy; prevent secrets reaching test processes; immutable tool policy and sandbox mounts; protect against symlinks; signed and audited approvals; PostgreSQL persistence and encryption at rest; user authentication; CI verification and bounded repair.

The MVP may produce draft PRs, but that does not satisfy the full DripForge acceptance criteria.
