const types = new Set(["queued","started","planning","reading","editing","testing","repairing","committing","pushing","pr_created","ci_pending","ci_failed","ci_passed","blocked","failed","completed"]);
export function createJobEvent({ jobId, type, payload = {}, at = new Date().toISOString() }) {
  if (typeof jobId !== "string" || !jobId || !types.has(type)) throw new TypeError("Invalid job event");
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new TypeError("Invalid event payload");
  if (Number.isNaN(Date.parse(at))) throw new TypeError("Invalid event timestamp");
  return Object.freeze({ jobId, type, payload: Object.freeze({ ...payload }), at });
}
export function summarizeJobEvents(events) {
  if (!Array.isArray(events)) throw new TypeError("Events required");
  const summary = { status: "unknown", lastEventAt: null, eventCount: events.length };
  for (const event of events) {
    if (!types.has(event.type)) throw new TypeError("Unrecognized event");
    summary.status = event.type;
    summary.lastEventAt = event.at;
  }
  return summary;
}
