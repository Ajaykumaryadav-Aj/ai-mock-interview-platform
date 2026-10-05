// ai-interview/tests/api.test.mjs
// Comprehensive automated API test suite covering all migration requirements

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure test environment variables are loaded from .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}
process.env.NODE_ENV = "test";

// Import API handlers directly
import usersHandler from "../api/users.js";
import interviewsHandler from "../api/interviews.js";
import interviewDetailHandler from "../api/interviews/[id].js";
import userAnswersHandler from "../api/user-answers.js";
import geminiHandler from "../api/gemini.js";
import { getDb, closeConnection } from "../api/lib/mongodb.js";

function createMockReqRes({ method = "GET", url = "/", headers = {}, body = null, query = {} } = {}) {
  const req = {
    method,
    url,
    headers: {
      origin: "http://localhost:5173",
      host: "localhost:5173",
      ...headers,
    },
    body,
    query,
  };

  let statusCode = 200;
  let headersSent = {};
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(name, value) {
      headersSent[name] = value;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    send(data) {
      responseData = data;
      return res;
    },
    end() {
      return res;
    },
    getResponse() {
      return { status: statusCode, headers: headersSent, data: responseData };
    },
  };

  return { req, res };
}

describe("API & Security Integration Tests", () => {
  const userA = "test_user_alpha_" + Date.now();
  const userB = "test_user_beta_" + Date.now();
  let createdInterviewId = null;

  before(async () => {
    try {
      const db = await getDb();
      await db.collection("users").deleteMany({ userId: { $in: [userA, userB] } });
      await db.collection("interviews").deleteMany({ userId: { $in: [userA, userB] } });
      await db.collection("userAnswers").deleteMany({ userId: { $in: [userA, userB] } });
    } catch (e) {
      console.warn("Pre-test cleanup note:", e.message);
    }
  });

  after(async () => {
    try {
      const db = await getDb();
      await db.collection("users").deleteMany({ userId: { $in: [userA, userB] } });
      await db.collection("interviews").deleteMany({ userId: { $in: [userA, userB] } });
      await db.collection("userAnswers").deleteMany({ userId: { $in: [userA, userB] } });
    } catch (e) {
      console.warn("Post-test cleanup note:", e.message);
    }
    await closeConnection();
  });

  // 1. Unauthenticated Requests -> 401
  describe("Authentication Enforcement", () => {
    it("GET /api/users without token returns 401", async () => {
      const { req, res } = createMockReqRes({ method: "GET", url: "/api/users" });
      await usersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 401);
      assert.match(result.data.error, /Authentication required/);
    });

    it("GET /api/interviews without token returns 401", async () => {
      const { req, res } = createMockReqRes({ method: "GET", url: "/api/interviews" });
      await interviewsHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 401);
      assert.match(result.data.error, /Authentication required/);
    });

    it("GET /api/user-answers without token returns 401", async () => {
      const { req, res } = createMockReqRes({ method: "GET", url: "/api/user-answers" });
      await userAnswersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 401);
      assert.match(result.data.error, /Authentication required/);
    });
  });

  // 2. User Profile Management
  describe("User Profile Flow", () => {
    it("POST /api/users creates a new user profile with Clerk userId", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        url: "/api/users",
        headers: { "x-test-user-id": userA },
        body: {
          name: "User Alpha",
          email: "alpha@example.com",
          imageUrl: "https://example.com/avatar.png",
        },
      });
      await usersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.equal(result.data.success, true);
      assert.equal(result.data.user.userId, userA);
      assert.equal(result.data.user.email, "alpha@example.com");
    });

    it("GET /api/users retrieves current authenticated user profile", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: "/api/users",
        headers: { "x-test-user-id": userA },
      });
      await usersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.equal(result.data.userId, userA);
      assert.equal(result.data.name, "User Alpha");
    });
  });

  // 3. Interview CRUD & Security
  describe("Interview Flow & Security Isolation", () => {
    it("POST /api/interviews creates an interview with authenticated userId", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        url: "/api/interviews",
        headers: { "x-test-user-id": userA },
        body: {
          position: "Frontend Engineer",
          description: "React, CSS, Modern JS",
          experience: "3",
          questions: [{ question: "What is React?", answer: "A JS library" }],
        },
      });
      await interviewsHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 201);
      assert.ok(result.data.id);
      assert.equal(result.data.userId, userA);
      assert.equal(result.data.position, "Frontend Engineer");
      createdInterviewId = result.data.id;
      assert.ok(createdInterviewId);
    });

    it("GET /api/interviews retrieves only User A's interviews", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: "/api/interviews",
        headers: { "x-test-user-id": userA },
      });
      await interviewsHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.ok(Array.isArray(result.data));
      assert.equal(result.data.length, 1);
      assert.equal(result.data[0].id, createdInterviewId);
    });

    it("GET /api/interviews for User B returns empty array (zero data leakage)", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: "/api/interviews",
        headers: { "x-test-user-id": userB },
      });
      await interviewsHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.ok(Array.isArray(result.data));
      assert.equal(result.data.length, 0);
    });

    it("User B cannot access User A interview by ID -> 403 Forbidden", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: `/api/interviews/${createdInterviewId}`,
        headers: { "x-test-user-id": userB },
        query: { id: createdInterviewId },
      });
      await interviewDetailHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 403);
      assert.match(result.data.error, /Forbidden/);
    });

    it("User A can access their own interview by ID -> 200 OK", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: `/api/interviews/${createdInterviewId}`,
        headers: { "x-test-user-id": userA },
        query: { id: createdInterviewId },
      });
      await interviewDetailHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.equal(result.data.id, createdInterviewId);
    });
  });

  // 4. User Answers & Interview Ownership Scoping
  describe("User Answers Scoping & Cascade Deletion", () => {
    it("POST /api/user-answers saves answer for User A's interview", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        url: "/api/user-answers",
        headers: { "x-test-user-id": userA },
        body: {
          mockIdRef: createdInterviewId,
          question: "What is React?",
          correct_ans: "A JS library",
          user_ans: "React is a JavaScript library for building UI.",
          feedback: "Great answer with clear explanation.",
          rating: 9,
        },
      });
      await userAnswersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 201);
      assert.equal(result.data.created, true);
      assert.equal(result.data.mockIdRef, createdInterviewId);
    });

    it("User B cannot fetch answers for User A's interview -> 403 Forbidden", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: `/api/user-answers?interviewId=${createdInterviewId}`,
        headers: { "x-test-user-id": userB },
        query: { interviewId: createdInterviewId },
      });
      await userAnswersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 403);
      assert.match(result.data.error, /Forbidden/);
    });

    it("User A can retrieve answers for their own interview -> 200 OK", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: `/api/user-answers?interviewId=${createdInterviewId}`,
        headers: { "x-test-user-id": userA },
        query: { interviewId: createdInterviewId },
      });
      await userAnswersHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.ok(Array.isArray(result.data));
      assert.equal(result.data.length, 1);
      assert.equal(result.data[0].question, "What is React?");
    });

    it("DELETE /api/interviews/:id deletes interview and cascades answers", async () => {
      const { req, res } = createMockReqRes({
        method: "DELETE",
        url: `/api/interviews/${createdInterviewId}`,
        headers: { "x-test-user-id": userA },
        query: { id: createdInterviewId },
      });
      await interviewDetailHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 200);
      assert.equal(result.data.success, true);

      // Verify answers were cascade-deleted
      const db = await getDb();
      const remainingAnswers = await db.collection("userAnswers").countDocuments({ mockIdRef: createdInterviewId });
      assert.equal(remainingAnswers, 0);
    });
  });

  // 5. Input Validation & Error Handling
  describe("Input Validation & Error Responses", () => {
    it("POST /api/interviews with missing fields -> 400 Bad Request", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        url: "/api/interviews",
        headers: { "x-test-user-id": userA },
        body: {
          position: "", // missing required field
        },
      });
      await interviewsHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 400);
      assert.match(result.data.error, /Position\/Role is required/);
    });

    it("GET /api/interviews/:id with non-existent ID -> 404 Not Found", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        url: "/api/interviews/nonexistent123",
        headers: { "x-test-user-id": userA },
        query: { id: "nonexistent123" },
      });
      await interviewDetailHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 404);
      assert.match(result.data.error, /Interview not found/);
    });

    it("POST /api/gemini with missing prompt -> 400 Bad Request", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        url: "/api/gemini",
        body: {},
      });
      await geminiHandler(req, res);
      const result = res.getResponse();
      assert.equal(result.status, 400);
      assert.match(result.data.error, /Missing or invalid 'input'/);
    });
  });
});
