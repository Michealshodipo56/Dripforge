export const ApprovalActions = Object.freeze(["write_repository", "open_pull_request", "install_dependencies", "run_untrusted_tests"]);
export function requireApproval({ action, decisions, jobId }) {
  if (!ApprovalActions.includes(action)) throw new TypeError("Unknown approval action");
  if (!jobId || !Array.isArray(decisions)) throw new TypeError("Approval context missing");
  const approved = decisions.some(decision =>
    decision.jobId === jobId && decision.action === action &&
    decision.status === "approved" && decision.revoked !== true
  );
  if (!approved) throw new Error(`Approval required: ${action}`);
  return true;
}
