/**
 * Durable job state transition policy. Persistence and distributed locking
 * are intentionally delegated to the orchestration layer.
 */
export const JobState = Object.freeze({
  QUEUED: "queued",
  INVESTIGATING: "investigating",
  PLANNING: "planning",
  IMPLEMENTING: "implementing",
  VALIDATING: "validating",
  REPAIRING: "repairing",
  PUSHING: "pushing",
  PR_OPEN: "pr_open",
  CI_CHECKING: "ci_checking",
  CI_REPAIRING: "ci_repairing",
  WAITING_APPROVAL: "waiting_approval",
  PAUSED: "paused",
  BLOCKED: "blocked",
  FAILED: "failed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const transitions = {
  queued: ["investigating", "cancelled"],
  investigating: ["planning", "blocked", "failed", "cancelled"],
  planning: ["implementing", "waiting_approval", "blocked", "failed", "cancelled"],
  implementing: ["validating", "waiting_approval", "blocked", "failed", "cancelled"],
  validating: ["repairing", "pushing", "blocked", "failed", "cancelled"],
  repairing: ["validating", "blocked", "failed", "cancelled"],
  pushing: ["pr_open", "blocked", "failed", "cancelled"],
  pr_open: ["ci_checking", "blocked", "failed", "cancelled"],
  ci_checking: ["ci_repairing", "completed", "blocked", "failed", "cancelled"],
  ci_repairing: ["validating", "blocked", "failed", "cancelled"],
  waiting_approval: ["planning", "implementing", "blocked", "cancelled"],
  paused: ["investigating", "planning", "implementing", "validating", "repairing", "ci_checking", "cancelled"],
  blocked: ["investigating", "cancelled"],
  failed: [],
  completed: [],
  cancelled: [],
};

export function canTransition(from, to) {
  return Object.hasOwn(transitions, from) && transitions[from].includes(to);
}

export function transition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid job transition: ${from} -> ${to}`);
  }
  return to;
}

/** No model assertion can replace observed required CI conclusions. */
export function requiredChecksPassed(checks) {
  return Array.isArray(checks) &&
    checks.length > 0 &&
    checks.every(check => check.required === true &&
      check.status === "completed" &&
      check.conclusion === "success");
}
