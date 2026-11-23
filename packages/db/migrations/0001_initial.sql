-- DripForge initial durable control-plane schema (PostgreSQL 16+).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE github_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_user_id bigint NOT NULL,
  login text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, github_user_id)
);
CREATE TABLE github_installations (
  id bigint PRIMARY KEY,
  connection_id uuid NOT NULL REFERENCES github_connections(id) ON DELETE CASCADE,
  account_login text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE repositories (
  id bigint PRIMARY KEY,
  installation_id bigint NOT NULL REFERENCES github_installations(id),
  full_name text NOT NULL,
  default_branch text NOT NULL,
  archived boolean NOT NULL DEFAULT false
);
CREATE TABLE issues (
  repository_id bigint NOT NULL REFERENCES repositories(id),
  number integer NOT NULL CHECK (number > 0),
  title text NOT NULL,
  body text,
  state text NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY(repository_id, number)
);
CREATE TABLE provider_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  ciphertext bytea NOT NULL,
  key_version integer NOT NULL CHECK(key_version > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE model_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model_id text NOT NULL,
  purpose text NOT NULL,
  UNIQUE(user_id, purpose)
);
CREATE TABLE agent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  repository_id bigint NOT NULL,
  issue_number integer NOT NULL,
  connection_id uuid NOT NULL REFERENCES github_connections(id),
  idempotency_key text NOT NULL UNIQUE,
  target_branch text NOT NULL,
  state text NOT NULL DEFAULT 'queued',
  version integer NOT NULL DEFAULT 0,
  blocked_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(repository_id, issue_number) REFERENCES issues(repository_id, number)
);
CREATE TABLE job_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES agent_jobs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX job_events_by_job ON job_events(job_id, id);
CREATE TABLE execution_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES agent_jobs(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL CHECK(attempt_number > 0),
  worker_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  UNIQUE(job_id, attempt_number)
);
CREATE TABLE command_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES execution_attempts(id),
  command_label text NOT NULL,
  exit_code integer,
  timed_out boolean NOT NULL DEFAULT false,
  log_reference text,
  started_at timestamptz NOT NULL,
  finished_at timestamptz
);
CREATE TABLE file_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES agent_jobs(id),
  path text NOT NULL,
  change_type text NOT NULL,
  diff_reference text
);
CREATE TABLE commits (
  sha text PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES agent_jobs(id),
  branch text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE pull_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL UNIQUE REFERENCES agent_jobs(id),
  repository_id bigint NOT NULL REFERENCES repositories(id),
  number integer NOT NULL,
  head_sha text,
  url text NOT NULL,
  UNIQUE(repository_id, number)
);
CREATE TABLE ci_runs (
  id bigint PRIMARY KEY,
  pull_request_id uuid NOT NULL REFERENCES pull_requests(id),
  head_sha text NOT NULL,
  status text NOT NULL,
  conclusion text,
  required_checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE token_usage (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES agent_jobs(id),
  provider text NOT NULL,
  model_id text NOT NULL,
  input_tokens bigint NOT NULL CHECK(input_tokens >= 0),
  output_tokens bigint NOT NULL CHECK(output_tokens >= 0),
  reported_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE cost_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES agent_jobs(id),
  amount_usd numeric(18,8) NOT NULL CHECK(amount_usd >= 0),
  estimate boolean NOT NULL DEFAULT true,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES agent_jobs(id),
  action text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
