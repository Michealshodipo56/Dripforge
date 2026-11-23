import test from "node:test";
import assert from "node:assert/strict";
import { checkBudget, BudgetExceededError } from "../src/budget.mjs";

test("accepts usage at the limit", () => {
  assert.equal(checkBudget({ inputTokens: 100, costUsd: 2 }, { inputTokens: 80, costUsd: 1 }, { inputTokens: 20, costUsd: 1 }), true);
});
test("rejects overspending before a request", () => {
  assert.throws(() => checkBudget({ costUsd: 1 }, { costUsd: 0.9 }, { costUsd: 0.2 }), BudgetExceededError);
});
test("rejects invalid usage and limits", () => {
  assert.throws(() => checkBudget({ costUsd: NaN }, {}), TypeError);
  assert.throws(() => checkBudget({ inputTokens: 10 }, { inputTokens: -1 }), TypeError);
});
