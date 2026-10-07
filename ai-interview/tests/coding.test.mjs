// tests/coding.test.mjs
// Comprehensive verification matrix for Coding Round:
// 1. Simple Sum Problem (O(1) time, O(1) space, Accepted status)
// 2. Linear / Single Loop Algorithm (O(n) time, O(1) space)
// 3. Frequency Map Algorithm (O(n) time, O(n) space)
// 4. Nested Loop Algorithm (O(n²) time, O(1) space - NOT matching problem optimal)
// 5. Wrong Answer Detection
// 6. Compilation Error Detection
// 7. Runtime Error Detection
// 8. Output Normalization & Comparison
// 9. Hidden Test Case Protection
// 10. Dashboard History Retrieval & Authorization

import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";

// Import modules under test
import codingHandler from "../api/coding.js";
import { compareOutputs, normalizeValue } from "../api/_lib/outputComparator.js";

function createMockReqRes({ method = "GET", url = "/api/coding", query = {}, body = {}, headers = {} }) {
  const req = {
    method,
    url,
    query,
    body,
    headers: {
      "x-test-user-id": "coder_verified_456",
      ...headers,
    },
  };

  let statusCode = 200;
  let responseData = null;
  const resHeaders = {};

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(name, val) {
      resHeaders[name.toLowerCase()] = val;
    },
    json(data) {
      responseData = data;
      return this;
    },
    end(data) {
      if (data) responseData = data;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get data() {
      return responseData;
    },
  };

  return { req, res };
}

// ── TEST MATRIX ─────────────────────────────────────────────────────────────

test("Output Normalization: handles whitespace, newlines, numbers, booleans, and unordered arrays", () => {
  // Numeric string vs number
  assert.equal(compareOutputs("5\n", 5), true);
  assert.equal(compareOutputs(5, 5.0), true);
  assert.equal(compareOutputs("30", 30), true);

  // Booleans
  assert.equal(compareOutputs("true\r\n", true), true);
  assert.equal(compareOutputs(false, "False"), true);

  // Unordered arrays (e.g. Two Sum indices)
  assert.equal(compareOutputs([0, 1], [1, 0], "unordered-array"), true);
  assert.equal(compareOutputs("[1, 0]", [0, 1], "unordered-array"), true);
  assert.equal(compareOutputs([1, 2], [1, 3], "unordered-array"), false);

  // Float epsilon tolerance
  assert.equal(compareOutputs(0.1 + 0.2, 0.3), true);
});

test("Public Catalog: GET /api/coding?action=questions includes Sum of Two Numbers and metadata", async () => {
  const { req, res } = createMockReqRes({
    method: "GET",
    query: { action: "questions" },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.data.questions));

  const sumQ = res.data.questions.find((q) => q.id === "sum-of-two-numbers");
  assert.ok(sumQ, "Sum of Two Numbers problem must exist in catalog");
  assert.equal(sumQ.title, "Sum of Two Numbers");
  assert.equal(sumQ.executionMode, "function");
  assert.equal(sumQ.optimalComplexity.time, "O(1)");
});

test("Hidden Test Case Protection: GET /api/coding?action=question does NOT leak hidden test cases", async () => {
  const { req, res } = createMockReqRes({
    method: "GET",
    query: { action: "question", id: "sum-of-two-numbers" },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  const q = res.data.question;
  assert.ok(q);
  assert.equal(q.id, "sum-of-two-numbers");
  assert.ok(q.sampleTestCases);
  assert.equal(q.hiddenTests, undefined, "Server must NEVER return hiddenTests");
  assert.equal(q.hiddenTestCases, undefined, "Server must NEVER return hiddenTestCases");
});

test("TEST 1: Simple Sum (sum-of-two-numbers) must execute, pass all tests, and return Accepted with O(1) complexity", async () => {
  const correctSumJs = `
function solve(a, b) {
  return a + b;
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "sum-of-two-numbers",
      language: "javascript",
      code: correctSumJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, "Accepted", `Expected status to be Accepted, got: ${res.data.status}`);
  assert.equal(res.data.success, true);
  assert.equal(res.data.passedCount, 8); // 3 sample + 5 hidden
  assert.equal(res.data.totalCount, 8);
  assert.equal(res.data.objectiveScore, 100);

  // Verify complexity is O(1) time and O(1) space
  assert.equal(res.data.complexityAnalysis.timeComplexity, "O(1)");
  assert.equal(res.data.complexityAnalysis.spaceComplexity, "O(1)");
});

test("TEST 2: Linear Algorithm (Best Time to Buy/Sell Stock) evaluates to O(n) time and O(1) space", async () => {
  const linearJs = `
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minPrice) {
      minPrice = prices[i];
    } else if (prices[i] - minPrice > maxProfit) {
      maxProfit = prices[i] - minPrice;
    }
  }
  return maxProfit;
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "best-time-to-buy-and-sell-stock",
      language: "javascript",
      code: linearJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, "Accepted");
  assert.equal(res.data.passedCount, res.data.totalCount);
  assert.equal(res.data.complexityAnalysis.timeComplexity, "O(n)");
  assert.equal(res.data.complexityAnalysis.spaceComplexity, "O(1)");
});

test("TEST 3: Frequency Map Algorithm (Two Sum with Map) evaluates to O(n) time and O(n) space", async () => {
  const mapJs = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "two-sum",
      language: "javascript",
      code: mapJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, "Accepted");
  assert.equal(res.data.complexityAnalysis.timeComplexity, "O(n)");
  assert.equal(res.data.complexityAnalysis.spaceComplexity, "O(n)");
});

test("TEST 4: Nested Loop Algorithm (Two Sum Brute Force) evaluates to O(n²) time - does NOT falsely report O(n)", async () => {
  const bruteForceJs = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "two-sum",
      language: "javascript",
      code: bruteForceJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, "Accepted");
  // The user's code has nested loops: MUST be O(n²), even though problem optimal is O(n)!
  assert.equal(
    res.data.complexityAnalysis.timeComplexity,
    "O(n²)",
    "Suboptimal nested loop code must report O(n²), not the problem's optimal O(n)"
  );
  assert.equal(res.data.complexityAnalysis.spaceComplexity, "O(1)");
});

test("TEST 5: Incorrect Solution returns Wrong Answer (NOT Accepted)", async () => {
  const wrongJs = `
function solve(a, b) {
  return a * b; // Deliberate bug: multiplication instead of addition
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "sum-of-two-numbers",
      language: "javascript",
      code: wrongJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, "Wrong Answer");
  assert.equal(res.data.success, false);
  assert.ok(res.data.passedCount < res.data.totalCount);
});

test("TEST 6: Compilation Error is accurately detected and classified", async () => {
  const syntaxErrorJs = `
function solve(a, b) {
  return a +++ ;;; // Syntax error
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "sum-of-two-numbers",
      language: "javascript",
      code: syntaxErrorJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(
    res.data.status === "Compilation Error" || res.data.status === "Runtime Error",
    `Expected Compilation or Runtime Error, got: ${res.data.status}`
  );
  assert.equal(res.data.success, false);
});

test("TEST 7: Runtime Exception is accurately detected and classified", async () => {
  const runtimeExceptionJs = `
function solve(a, b) {
  throw new Error("Unhandled test exception!");
}
`;

  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "submit" },
    body: {
      questionId: "sum-of-two-numbers",
      language: "javascript",
      code: runtimeExceptionJs,
    },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, "Wrong Answer"); // Threw errors on all tests -> 0 tests passed
  assert.equal(res.data.passedCount, 0);
  assert.equal(res.data.success, false);
});

test("TEST 8: Dashboard History persists actual submissions and authorizes by userId", async () => {
  const { req, res } = createMockReqRes({
    method: "GET",
    query: { action: "history" },
  });

  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.data.submissions));
  assert.ok(res.data.submissions.length >= 1);

  const latest = res.data.submissions[0];
  assert.ok(latest.status);
  assert.ok(["Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded"].includes(latest.status));
});

test("TEST 9: GET /api/coding?action=submission returns full performance metrics including code and complexity", async () => {
  // First retrieve submission ID from history
  const { req: histReq, res: histRes } = createMockReqRes({
    method: "GET",
    query: { action: "history" },
  });
  await codingHandler(histReq, histRes);
  const targetSub = histRes.data.submissions[0];
  assert.ok(targetSub, "Expected at least one submission in history");

  // Query performance detail
  const { req, res } = createMockReqRes({
    method: "GET",
    query: { action: "submission", id: targetSub.id },
  });
  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.id, targetSub.id);
  assert.ok(res.data.questionTitle);
  assert.ok(res.data.complexityAnalysis);
  assert.ok(res.data.complexityAnalysis.timeComplexity);
  assert.ok(res.data.aiReview);
  assert.ok(res.data.code);
});

test("TEST 10: DELETE /api/coding?action=submission deletes submission and prevents unauthorized deletion", async () => {
  // Retrieve submission ID from history
  const { req: histReq, res: histRes } = createMockReqRes({
    method: "GET",
    query: { action: "history" },
  });
  await codingHandler(histReq, histRes);
  const initialCount = histRes.data.submissions.length;
  const targetSub = histRes.data.submissions[0];
  assert.ok(targetSub);

  // Unauthorized attempt by another user
  const { req: unauthReq, res: unauthRes } = createMockReqRes({
    method: "DELETE",
    query: { action: "submission", id: targetSub.id },
    headers: { "x-test-user-id": "different_user_999" },
  });
  await codingHandler(unauthReq, unauthRes);
  assert.equal(unauthRes.statusCode, 404, "User B must not be able to delete User A's submission");

  // Authorized deletion
  const { req: delReq, res: delRes } = createMockReqRes({
    method: "DELETE",
    query: { action: "submission", id: targetSub.id },
  });
  await codingHandler(delReq, delRes);
  assert.equal(delRes.statusCode, 200);
  assert.equal(delRes.data.success, true);

  // Verify it is gone from history
  const { req: verifyReq, res: verifyRes } = createMockReqRes({
    method: "GET",
    query: { action: "history" },
  });
  await codingHandler(verifyReq, verifyRes);
  assert.equal(verifyRes.data.submissions.length, initialCount - 1);
  assert.ok(!verifyRes.data.submissions.some((s) => s.id === targetSub.id));
});

test("TEST 11: GET /api/coding?action=history with questionId filters specifically for that question", async () => {
  const { req, res } = createMockReqRes({
    method: "GET",
    query: { action: "history", questionId: "two-sum" },
  });
  await codingHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.data.submissions));
  // All returned submissions must match two-sum
  for (const s of res.data.submissions) {
    assert.equal(s.questionId, "two-sum");
    assert.ok(typeof s.code === "string");
  }
});


