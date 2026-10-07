// api/coding.js
// Vercel Serverless Function: Dedicated Coding Round backend.
// Supports:
// - Questions catalog and detail fetching
// - Isolated server-side code execution (sample tests & custom input)
// - Server-side solution submission with hidden test evaluation
// - Deterministic status ("Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded")
// - Code-specific AI Complexity Analysis (Time/Space/Confidence/Evidence/Reasoning)
// - Qualitative AI Code Review & Follow-up Questions via Gemini
// - Scorecard generation & MongoDB persistence under verified Clerk userId
// - Coding submission history for candidate dashboard

import { ObjectId } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import { handleCors } from "./_cors.js";
import { authenticateRequest } from "./_lib/auth.js";
import { getDb, ensureIndexes } from "./_lib/mongodb.js";
import { runCustomInput, evaluateCode } from "./_lib/codingJudge.js";
import { CODING_QUESTIONS } from "../src/data/codingQuestionsData.js";

let geminiClient = null;

function getGemini() {
  if (geminiClient) return geminiClient;
  let apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
  if (
    (apiKey.startsWith('"') && apiKey.endsWith('"')) ||
    (apiKey.startsWith("'") && apiKey.endsWith("'"))
  ) {
    apiKey = apiKey.slice(1, -1);
  }
  if (!apiKey) return null;
  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

/**
 * Heuristic fallback for algorithmic complexity when AI is unavailable.
 * Inspects loops, recursion, and data structures in the actual candidate code.
 */
function deriveHeuristicComplexity(code) {
  const cleanCode = code || "";

  // Check nested loops
  const hasNestedLoops =
    /for\s*\(.*?\)\s*\{[\s\S]*?for\s*\(.*?\)/m.test(cleanCode) ||
    /while\s*\(.*?\)\s*\{[\s\S]*?while\s*\(.*?\)/m.test(cleanCode) ||
    /for\s+\w+\s+in\s+.*?:[\s\S]*?for\s+\w+\s+in\s+.*?:/m.test(cleanCode);

  // Check single loop
  const hasSingleLoop =
    /\b(for|while)\b/.test(cleanCode) ||
    /\b(forEach|map|filter|reduce)\b/.test(cleanCode);

  // Check sorting
  const hasSort = /\.sort\(|sorted\(|std::sort|Arrays\.sort/.test(cleanCode);

  // Check auxiliary space (Map, Set, dictionary, dynamic collections)
  const hasAuxiliarySpace =
    /new\s+(Map|Set|Array)|dict\(|\bset\(|\bHashMap\b|\bunordered_map\b|\bDictionary\b|\.push\(|\.append\(|\.add\(/.test(cleanCode) ||
    /(?:const|let|var)\s+\w+\s*=\s*\{\s*\}/.test(cleanCode);

  let timeComplexity = "O(1)";
  let evidence = [];

  if (hasNestedLoops) {
    timeComplexity = "O(n²)";
    evidence.push("Detected nested loop structure traversing input collections.");
  } else if (hasSort) {
    timeComplexity = "O(n log n)";
    evidence.push("Detected sorting routine on input collection.");
  } else if (hasSingleLoop) {
    timeComplexity = "O(n)";
    evidence.push("Detected linear iteration loop over input elements.");
  } else {
    timeComplexity = "O(1)";
    evidence.push("No iterative loops or recursion detected; arithmetic / direct operations.");
  }

  const spaceComplexity = hasAuxiliarySpace && timeComplexity !== "O(1)" ? "O(n)" : "O(1)";
  if (spaceComplexity === "O(n)") {
    evidence.push("Allocates dynamic data structure (map/set/array) scaling with input size.");
  } else {
    evidence.push("Uses constant auxiliary variables O(1).");
  }

  return {
    timeComplexity,
    spaceComplexity,
    confidence: 0.85,
    evidence,
    reasoning: `Code structure analysis: Time complexity is ${timeComplexity} and auxiliary space is ${spaceComplexity} based on loop depth and data structure allocations.`,
  };
}

/**
 * Generate AI Code Review, Code-Specific Complexity Analysis, and Follow-up Questions.
 */
async function generateAiCodeReview({ question, language, code, testResult }) {
  const heuristic = deriveHeuristicComplexity(code);
  const optimalTime = question.optimalComplexity?.time || "O(n)";
  const optimalSpace = question.optimalComplexity?.space || "O(1)";

  const defaultReview = {
    codeQuality: testResult.success ? 9 : 6,
    correctnessScore: testResult.passedCount > 0 ? Math.round((testResult.passedCount / (testResult.totalCount || 1)) * 10) : 0,
    readability: 8,
    timeComplexity: heuristic.timeComplexity,
    spaceComplexity: heuristic.spaceComplexity,
    complexityConfidence: heuristic.confidence,
    complexityEvidence: heuristic.evidence,
    complexityReasoning: heuristic.reasoning,
    optimalComplexity: { time: optimalTime, space: optimalSpace },
    strengths: [
      testResult.success
        ? `Clean functional implementation passing all ${testResult.totalCount} test cases.`
        : "Clear code structure and function signature established.",
    ],
    issues: testResult.success
      ? []
      : [`Failed ${testResult.totalCount - testResult.passedCount} test case(s). Check edge cases and boundary conditions.`],
    suggestions: [
      heuristic.timeComplexity !== optimalTime
        ? `Consider optimizing time complexity from ${heuristic.timeComplexity} towards the optimal ${optimalTime}.`
        : "Code matches optimal algorithmic bounds.",
    ],
    followUpQuestions: [
      `What are the edge case inputs where your ${heuristic.timeComplexity} approach might encounter performance limits?`,
      "How would you adapt this solution if incoming data arrived as an unbounded stream?",
    ],
  };

  const ai = getGemini();
  if (!ai) return defaultReview;

  const prompt = `You are a Principal Software Engineer and Staff Technical Interviewer evaluating a candidate's submitted code.

PROBLEM CONTEXT:
Title: "${question.title}"
Category: ${question.category}
Difficulty: ${question.difficulty}
Problem Description:
${question.description}

Optimal Reference Complexity: Time: ${optimalTime}, Space: ${optimalSpace}

CANDIDATE SUBMISSION:
Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`

DETERMINISTIC TEST RESULTS (GROUND TRUTH):
Status: ${testResult.status}
Passed Tests: ${testResult.passedCount} / ${testResult.totalCount}
Execution Time: ${testResult.executionTime}
Memory: ${testResult.memory}

STRICT EVALUATION RULES:
1. DO NOT fabricate test results. Status "${testResult.status}" and ${testResult.passedCount}/${testResult.totalCount} passed are objective facts.
2. DO NOT assume the candidate's complexity matches the problem's optimal complexity!
   - Analyze the CANDIDATE'S ACTUAL CODE structure.
   - If candidate used nested loops: Time = O(n²) or O(n*m), even if optimal is O(n).
   - If candidate used a single loop: Time = O(n).
   - If candidate used sorting: Time = O(n log n).
   - If candidate used direct arithmetic / no loops / no recursion: Time = O(1).
   - Space complexity MUST reflect AUXILIARY space (extra memory allocated by data structures or call stack, NOT input size).
3. If candidate's solution is suboptimal (e.g. O(n²) when O(n) is possible), point this out in suggestions without claiming their code is O(n).
4. Strengths and Issues MUST cite specific identifiers, functions, or lines from the candidate's submitted code.
5. Provide 2-3 technical follow-up questions tailored to their specific implementation.

Return ONLY a valid JSON object matching this schema:
{
  "codeQuality": 8,
  "readability": 8,
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "complexityConfidence": 0.95,
  "complexityEvidence": ["Single for loop at line 3 iterates through array", "Single integer accumulator used"],
  "complexityReasoning": "Detailed explanation of why this complexity applies to THIS code.",
  "strengths": ["Quoting specific code practice from candidate"],
  "issues": ["Specific edge cases or code smell in candidate code"],
  "suggestions": ["Actionable optimization suggestions"],
  "followUpQuestions": [
    "Question specifically referencing candidate's algorithm or language constructs"
  ]
}`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-2.5-flash",
      input: prompt,
      response_format: { type: "json_object" },
    });

    const outputText = interaction?.output_text || "";
    const parsed = JSON.parse(outputText);

    return {
      codeQuality: Number(parsed.codeQuality) || defaultReview.codeQuality,
      correctnessScore: defaultReview.correctnessScore,
      readability: Number(parsed.readability) || defaultReview.readability,
      timeComplexity: parsed.timeComplexity || heuristic.timeComplexity,
      spaceComplexity: parsed.spaceComplexity || heuristic.spaceComplexity,
      complexityConfidence: Number(parsed.complexityConfidence) || 0.95,
      complexityEvidence: Array.isArray(parsed.complexityEvidence) && parsed.complexityEvidence.length > 0
        ? parsed.complexityEvidence
        : heuristic.evidence,
      complexityReasoning: parsed.complexityReasoning || heuristic.reasoning,
      optimalComplexity: { time: optimalTime, space: optimalSpace },
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : defaultReview.strengths,
      issues: Array.isArray(parsed.issues) ? parsed.issues : defaultReview.issues,
      suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : defaultReview.suggestions,
      followUpQuestions: Array.isArray(parsed.followUpQuestions) && parsed.followUpQuestions.length > 0
        ? parsed.followUpQuestions
        : defaultReview.followUpQuestions,
    };
  } catch (err) {
    console.warn("[Gemini Code Review Fallback]", err.message);
    return defaultReview;
  }
}

/**
 * Generate AI progressive hint without revealing the complete solution.
 */
async function generateAiHint({ question, hintLevel, currentCode, language }) {
  const staticHint = question.hints?.find((h) => h.level === Number(hintLevel));
  const fallbackText = staticHint ? staticHint.text : "Focus on breaking the problem down into smaller sub-tasks.";

  const ai = getGemini();
  if (!ai || !currentCode || currentCode.trim().length < 15) {
    return {
      hintLevel: Number(hintLevel),
      hintText: fallbackText,
    };
  }

  const prompt = `You are a technical interview coach.
The candidate is solving "${question.title}".
Problem description:
${question.description}

Candidate's current code in ${language}:
\`\`\`${language}
${currentCode}
\`\`\`

The candidate requested Hint Level ${hintLevel}:
- Level 1: High-level conceptual direction / intuition.
- Level 2: Algorithmic guidance / appropriate data structure recommendation.
- Level 3: Concrete pseudo-code or step-by-step logic.

CRITICAL INSTRUCTIONS:
- Analyze their CURRENT CODE to identify what they have already written and where they might be stuck.
- Do NOT reveal the full working solution or write the entire code for them.
- Be concise (2-4 sentences max), encouraging, and pedagogical.
`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-2.5-flash",
      input: prompt,
    });
    return {
      hintLevel: Number(hintLevel),
      hintText: (interaction?.output_text || fallbackText).trim(),
    };
  } catch {
    return {
      hintLevel: Number(hintLevel),
      hintText: fallbackText,
    };
  }
}

export default async function handler(req, res) {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    const isAllowed = handleCors(req, res);
    if (!isAllowed) {
      return res.status(403).json({ error: "Origin not permitted by CORS policy." });
    }
    return res.status(204).end();
  }

  const isAllowed = handleCors(req, res);
  if (req.headers?.origin && !isAllowed) {
    return res.status(403).json({ error: "Origin not permitted by CORS policy." });
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const action = req.query.action || url.searchParams.get("action");

  try {
    // ── 2. GET /questions: Public question catalog ───────────────────────────
    if (req.method === "GET" && action === "questions") {
      const publicQuestions = CODING_QUESTIONS.map((q) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        category: q.category,
        shortDescription: q.shortDescription,
        executionMode: q.executionMode || "function",
        optimalComplexity: q.optimalComplexity || { time: "O(n)", space: "O(1)" },
        supportedLanguages: ["javascript", "python", "java", "cpp", "csharp", "dart"],
      }));
      return res.status(200).json({ questions: publicQuestions });
    }

    // ── 3. GET /question: Single problem details & sample test cases ────────
    if (req.method === "GET" && action === "question") {
      const id = req.query.id || url.searchParams.get("id");
      if (!id) {
        return res.status(400).json({ error: "Missing 'id' parameter." });
      }

      const question = CODING_QUESTIONS.find((q) => q.id === id);
      if (!question) {
        return res.status(404).json({ error: `Question '${id}' not found.` });
      }

      // Return problem definition without exposing hidden tests
      const questionData = {
        id: question.id,
        title: question.title,
        difficulty: question.difficulty,
        category: question.category,
        shortDescription: question.shortDescription,
        description: question.description,
        examples: question.examples,
        constraints: question.constraints,
        sampleTestCases: question.sampleTestCases,
        starterCode: question.starterCode,
        hints: (question.hints || []).map((h) => ({ level: h.level, title: h.title })),
        executionMode: question.executionMode || "function",
        optimalComplexity: question.optimalComplexity || { time: "O(n)", space: "O(1)" },
      };

      return res.status(200).json({
        ...questionData,
        question: questionData,
      });
    }

    // Authenticate user for all remaining actions
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return res.status(401).json({
        error: "Unauthorized. Please sign in to practice coding problems.",
      });
    }

    const { userId } = auth;

    // ── 4. POST /run: Execute code against sample tests or custom input ─────
    if (req.method === "POST" && action === "run") {
      const { questionId, language, code, customInput, isCustom } = req.body || {};

      if (!code || typeof code !== "string" || code.trim().length === 0) {
        return res.status(400).json({ error: "Code cannot be empty." });
      }

      if (!language) {
        return res.status(400).json({ error: "Missing 'language' parameter." });
      }

      // Custom input execution
      if (isCustom) {
        const customResult = await runCustomInput({
          code,
          language,
          customInput: typeof customInput === "string" ? customInput : "",
        });
        return res.status(200).json(customResult);
      }

      // Sample test cases execution
      if (!questionId) {
        return res.status(400).json({ error: "Missing 'questionId'." });
      }

      const evalResult = await evaluateCode({
        questionId,
        language,
        code,
        isSubmission: false, // Sample test cases only
      });

      return res.status(200).json(evalResult);
    }

    // ── 5. POST /submit: Run against sample + hidden tests & save scorecard ─
    if (req.method === "POST" && action === "submit") {
      const { questionId, language, code } = req.body || {};

      if (!code || typeof code !== "string" || code.trim().length === 0) {
        return res.status(400).json({ error: "Code cannot be empty." });
      }

      const question = CODING_QUESTIONS.find((q) => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: `Question '${questionId}' not found.` });
      }

      // Run against BOTH sample and hidden test cases in isolated sandbox
      const testResult = await evaluateCode({
        questionId,
        language,
        code,
        isSubmission: true, // Sample + Hidden
      });

      // Generate AI code review and complexity breakdown
      const aiReview = await generateAiCodeReview({
        question,
        language,
        code,
        testResult,
      });

      // Objective score strictly reflects test pass rate
      const passRate = testResult.totalCount > 0 ? testResult.passedCount / testResult.totalCount : 0;
      const objectiveScore = Math.round(passRate * 100);

      // Save submission to MongoDB
      const db = await getDb();
      await ensureIndexes(db);

      const submissionDoc = {
        userId,
        questionId,
        questionTitle: question.title,
        difficulty: question.difficulty,
        category: question.category,
        language,
        code,
        status: testResult.status, // "Accepted" | "Wrong Answer" | "Compilation Error" | "Runtime Error" | "Time Limit Exceeded"
        score: objectiveScore,
        passedCount: testResult.passedCount,
        totalCount: testResult.totalCount,
        executionTime: testResult.executionTime,
        memory: testResult.memory,
        timeComplexity: aiReview.timeComplexity,
        spaceComplexity: aiReview.spaceComplexity,
        complexityAnalysis: {
          timeComplexity: aiReview.timeComplexity,
          spaceComplexity: aiReview.spaceComplexity,
          optimalTime: question.optimalComplexity?.time || "O(n)",
          optimalSpace: question.optimalComplexity?.space || "O(1)",
          confidence: aiReview.complexityConfidence || 0.95,
          evidence: aiReview.complexityEvidence || [],
          reasoning: aiReview.complexityReasoning || "",
        },
        aiReview,
        createdAt: new Date(),
      };

      const insertResult = await db.collection("codingSubmissions").insertOne(submissionDoc);
      const submissionId = insertResult.insertedId.toString();

      return res.status(200).json({
        submissionId,
        success: testResult.success,
        status: testResult.status,
        score: objectiveScore,
        objectiveScore,
        passedCount: testResult.passedCount,
        totalCount: testResult.totalCount,
        executionTime: testResult.executionTime,
        memory: testResult.memory,
        testResults: testResult.testResults, // Hidden test inputs and expected outputs are omitted
        complexityAnalysis: submissionDoc.complexityAnalysis,
        aiReview,
        error: testResult.error,
      });
    }

    // ── 6. POST /hint: Request progressive AI hint ───────────────────────────
    if (req.method === "POST" && action === "hint") {
      const { questionId, hintLevel, currentCode, language } = req.body || {};

      const question = CODING_QUESTIONS.find((q) => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: `Question '${questionId}' not found.` });
      }

      const hintResult = await generateAiHint({
        question,
        hintLevel: Number(hintLevel) || 1,
        currentCode: currentCode || "",
        language: language || "javascript",
      });

      return res.status(200).json(hintResult);
    }

    // ── 7. GET /history: Get user's coding submission history ─────────────────
    if (req.method === "GET" && action === "history") {
      const db = await getDb();
      await ensureIndexes(db);

      const filter = { userId }; // Strictly enforce authenticated userId

      const qId = req.query?.questionId || url?.searchParams?.get("questionId");
      if (qId) {
        filter.questionId = qId;
      }
      if (req.query?.difficulty || url?.searchParams?.get("difficulty")) {
        filter.difficulty = req.query?.difficulty || url?.searchParams?.get("difficulty");
      }
      if (req.query?.language || url?.searchParams?.get("language")) {
        filter.language = req.query?.language || url?.searchParams?.get("language");
      }
      if (req.query?.status || url?.searchParams?.get("status")) {
        filter.status = req.query?.status || url?.searchParams?.get("status");
      }

      const submissions = await db
        .collection("codingSubmissions")
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      const formatted = submissions.map((s) => ({
        id: s._id.toString(),
        questionId: s.questionId,
        questionTitle: s.questionTitle,
        difficulty: s.difficulty,
        category: s.category,
        language: s.language,
        code: s.code || "",
        status: s.status,
        score: s.score,
        passedCount: s.passedCount,
        totalCount: s.totalCount,
        executionTime: s.executionTime,
        memory: s.memory,
        timeComplexity: s.timeComplexity,
        spaceComplexity: s.spaceComplexity,
        complexityAnalysis: s.complexityAnalysis,
        aiReview: s.aiReview,
        createdAt: s.createdAt,
      }));

      return res.status(200).json({ submissions: formatted });
    }

    // ── 8. GET /submission: Get single submission details for scorecard ──────
    if (req.method === "GET" && action === "submission") {
      const id = req.query.id || url.searchParams.get("id");
      if (!id) {
        return res.status(400).json({ error: "Missing 'id' parameter." });
      }

      const db = await getDb();
      let query;
      try {
        query = { _id: new ObjectId(id), userId };
      } catch {
        query = { id, userId };
      }

      const sub = await db.collection("codingSubmissions").findOne(query);
      if (!sub) {
        return res.status(404).json({ error: "Submission not found or access denied." });
      }

      const subData = {
        id: sub._id.toString(),
        questionId: sub.questionId,
        questionTitle: sub.questionTitle,
        difficulty: sub.difficulty,
        category: sub.category,
        language: sub.language,
        code: sub.code,
        status: sub.status,
        score: sub.score,
        passedCount: sub.passedCount,
        totalCount: sub.totalCount,
        executionTime: sub.executionTime,
        memory: sub.memory,
        testResults: sub.testResults,
        timeComplexity: sub.timeComplexity,
        spaceComplexity: sub.spaceComplexity,
        complexityAnalysis: sub.complexityAnalysis,
        aiReview: sub.aiReview,
        createdAt: sub.createdAt,
      };

      return res.status(200).json({
        ...subData,
        submission: subData,
      });
    }

    // ── 9. DELETE /submission: Delete single submission owned by user ─────────
    if (
      (req.method === "DELETE" && (action === "submission" || action === "delete")) ||
      (req.method === "POST" && action === "delete")
    ) {
      const id = req.query.id || url.searchParams.get("id") || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: "Missing 'id' parameter." });
      }

      const db = await getDb();
      let query;
      try {
        query = { _id: new ObjectId(id), userId };
      } catch {
        query = { id, userId };
      }

      const deleteResult = await db.collection("codingSubmissions").deleteOne(query);
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: "Submission not found or access denied." });
      }

      return res.status(200).json({ success: true, message: "Submission deleted successfully." });
    }

    return res.status(400).json({ error: `Unknown action '${action}' or method '${req.method}'.` });
  } catch (error) {
    console.error("[api/coding] Server error:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
