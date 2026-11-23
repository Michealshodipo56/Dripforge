# Test status

Foundation unit tests live in `packages/core/test`. Run with Node 22: `node --test packages/core/test/*.test.mjs`.

The API/worker MVP in `apps/api` and `workers/runner` is **not yet integration tested** against GitHub, a model provider, Docker or Oracle. Do not mark a job successful from a model claim; a draft PR is not a validated merge-ready PR. The core GitHub Actions workflow checks only core tests and syntax, not the complete MVP. Before deployment, add API authorization tests, mocked GitHub/LLM integration, sandbox adversarial tests and end-to-end checks.
