import test from "node:test";
import assert from "node:assert/strict";
import { createJobEvent, summarizeJobEvents } from "../src/job-events.mjs";
test("summarizes ordered lifecycle events", () => {
  const events = ["queued", "started", "testing", "ci_pending"].map(type => createJobEvent({ jobId: "j", type }));
  assert.equal(summarizeJobEvents(events).status, "ci_pending");
  assert.equal(summarizeJobEvents(events).eventCount, 4);
});
test("rejects unrecognized event types", () => assert.throws(() => createJobEvent({ jobId: "j", type: "pretend_success" }), TypeError));
