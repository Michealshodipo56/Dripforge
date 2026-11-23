# Security invariants

1. Never expose provider keys, GitHub private keys or installation tokens to the browser.
2. Encrypt stored credentials with managed key rotation; redact all secrets from logs.
3. Treat GitHub issue bodies, comments, repository instructions, tool output and model responses as untrusted input.
4. Run repository code only in disposable isolated workers, not in the web or API process.
5. Deny privileged containers, host mounts, host Docker sockets and access to cloud metadata.
6. Apply CPU, memory, disk, process, time and network limits. Restrict egress to necessary endpoints.
7. Use short-lived scoped GitHub installation credentials and prevent cross-account repository access.
8. Require approval for destructive changes, secrets, repository settings and out-of-scope operations.
9. Verify GitHub webhook signatures and enforce replay/idempotency protections.
10. Never weaken security policies or bypass CI to mark a job successful.

Production deployment must pass a threat-model review and sandbox escape tests before enabling untrusted repositories.
