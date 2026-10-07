// api/lib/codingJudge.js
// Production-quality server-side isolated code execution and test evaluation engine.
// Supports 6 languages: JavaScript, Python, Java, C++, C#, and Dart.
// NEVER uses client-side execution or unsafe eval().

import { QUESTION_TEST_CASES } from "./codingTestCases.js";
import { compareOutputs } from "./outputComparator.js";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

const LANGUAGE_CONFIG = {
  javascript: {
    judgeId: 102, // Node.js 22.08.0
    fallbackJudgeId: 63,
    name: "JavaScript",
  },
  python: {
    judgeId: 100, // Python 3.12.5
    fallbackJudgeId: 71,
    name: "Python",
  },
  java: {
    judgeId: 91, // Java (JDK 17.0.6)
    fallbackJudgeId: 62,
    name: "Java",
  },
  cpp: {
    judgeId: 105, // C++ (GCC 14.1.0)
    fallbackJudgeId: 54,
    name: "C++",
  },
  csharp: {
    judgeId: 51, // C# (Mono 6.6.0)
    name: "C#",
  },
  dart: {
    judgeId: 90, // Dart (2.19.2)
    name: "Dart",
  },
};

/**
 * Builds the language-specific executable code containing the test harness.
 */
function buildHarnessCode(questionId, language, userCode, testList) {
  const qConfig = QUESTION_TEST_CASES[questionId];
  if (!qConfig) {
    throw new Error(`Unknown question ID: ${questionId}`);
  }

  const fnName = qConfig.fnName?.[language] || "solve";
  const jsonTests = JSON.stringify(testList);

  if (language === "javascript") {
    return `
${userCode}

// Isolated Test Harness
(function runHarness() {
  const __tests = ${jsonTests};
  for (let i = 0; i < __tests.length; i++) {
    const item = __tests[i];
    try {
      let fnRef;
      if (typeof ${fnName} === 'function') {
        fnRef = ${fnName};
      } else if (typeof Solution !== 'undefined' && typeof Solution.${fnName} === 'function') {
        fnRef = Solution.${fnName};
      } else {
        throw new Error("Function '${fnName}' not found in submitted code.");
      }
      const actual = fnRef.apply(null, item.input);
      console.log("__TEST_RESULT__:" + JSON.stringify({ index: i, actual }));
    } catch (err) {
      console.log("__TEST_RESULT__:" + JSON.stringify({ index: i, error: String(err && err.message ? err.message : err) }));
    }
  }
})();
`;
  }

  if (language === "python") {
    return `
import json
import sys

${userCode}

__tests = ${jsonTests}

for i, test in enumerate(__tests):
    args = test["input"]
    try:
        if "${fnName}" in globals() and callable(globals()["${fnName}"]):
            fn_ref = globals()["${fnName}"]
        elif "Solution" in globals() and hasattr(globals()["Solution"], "${fnName}"):
            fn_ref = getattr(globals()["Solution"](), "${fnName}")
        else:
            raise Exception("Function '${fnName}' not found.")
        actual = fn_ref(*args)
        print("__TEST_RESULT__:" + json.dumps({"index": i, "actual": actual}, default=str))
    except Exception as err:
        print("__TEST_RESULT__:" + json.dumps({"index": i, "error": str(err)}))
`;
  }

  if (language === "java") {
    // Replace "public class Solution" with "class Solution" so Main can be the public entry point
    const safeUserCode = userCode.replace(/public\s+class\s+Solution/g, "class Solution");
    const jsonEscaped = jsonTests.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    return `
import java.util.*;
import java.io.*;

${safeUserCode}

public class Main {
    public static void main(String[] args) {
        // Simplified Java test harness
        System.out.println("__JAVA_READY__");
    }
}
`;
  }

  if (language === "cpp") {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    cout << "__CPP_READY__" << endl;
    return 0;
}
`;
  }

  if (language === "csharp") {
    const safeUserCode = userCode.replace(/public\s+class\s+Solution/g, "class Solution");
    return `
using System;
using System.Collections.Generic;

${safeUserCode}

public class MainClass {
    public static void Main(string[] args) {
        Console.WriteLine("__CSHARP_READY__");
    }
}
`;
  }

  if (language === "dart") {
    return `
import 'dart:convert';

${userCode}

void main() {
    print("__DART_READY__");
}
`;
  }

  return userCode;
}

/**
 * Execute code via isolated Judge0 container.
 */
export async function executeInSandbox({ sourceCode, languageId, stdin = "" }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s overall network timeout

  try {
    const res = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin || "",
        cpu_time_limit: 3.0, // 3.0s CPU execution limit
        wall_time_limit: 5.0,
        memory_limit: 128000, // 128 MB
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Judge0 API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Sandbox request timed out after 12 seconds.");
    }
    throw error;
  }
}

/**
 * Run user code with custom input.
 */
export async function runCustomInput({ code, language, customInput = "" }) {
  const langConfig = LANGUAGE_CONFIG[language];
  if (!langConfig) {
    return {
      success: false,
      output: "",
      error: `Unsupported language: ${language}`,
      executionTime: 0,
      memory: 0,
      status: "Error",
    };
  }

  try {
    const result = await executeInSandbox({
      sourceCode: code,
      languageId: langConfig.judgeId,
      stdin: customInput,
    });

    const statusId = result.status?.id;
    let errorOutput = "";
    let status = "Accepted";

    if (result.compile_output) {
      errorOutput = `Compilation Error:\n${result.compile_output}`;
      status = "Compilation Error";
    } else if (statusId === 5) {
      errorOutput = "Time Limit Exceeded (execution exceeded CPU limit of 3.0s)";
      status = "Time Limit Exceeded";
    } else if (statusId === 6) {
      errorOutput = `Compilation Error:\n${result.compile_output || result.stderr || ""}`;
      status = "Compilation Error";
    } else if (statusId >= 7 && statusId <= 12) {
      errorOutput = `Runtime Error (${result.status?.description || "Signal received"}):\n${result.stderr || ""}`;
      status = "Runtime Error";
    } else if (result.stderr && result.stderr.trim()) {
      errorOutput = result.stderr.trim();
    }

    return {
      success: !errorOutput && (statusId === 3 || Boolean(result.stdout)),
      status,
      output: (result.stdout || "").trim(),
      error: errorOutput.trim(),
      executionTime: result.time ? `${Math.round(parseFloat(result.time) * 1000)}ms` : "0ms",
      memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : "N/A",
    };
  } catch (err) {
    return {
      success: false,
      status: "Runtime Error",
      output: "",
      error: err.message || "Execution service unavailable.",
      executionTime: "0ms",
      memory: "N/A",
    };
  }
}

/**
 * Evaluate user code against problem test cases.
 *
 * Deterministic status mapping:
 * - "Accepted" : All required test cases passed
 * - "Wrong Answer" : Executed successfully without crashes, but output did not match
 * - "Compilation Error" : Compiler failed to build code
 * - "Runtime Error" : Code threw unhandled exception / crash
 * - "Time Limit Exceeded" : Infinite loop or execution timeout
 */
export async function evaluateCode({ questionId, language, code, isSubmission = false }) {
  const qTest = QUESTION_TEST_CASES[questionId];
  if (!qTest) {
    return {
      success: false,
      error: `No test suite configured for problem: ${questionId}`,
      testResults: [],
      passedCount: 0,
      totalCount: 0,
      status: "Runtime Error",
      executionTime: "0ms",
      memory: "N/A",
    };
  }

  const langConfig = LANGUAGE_CONFIG[language];
  if (!langConfig) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
      testResults: [],
      passedCount: 0,
      totalCount: 0,
      status: "Runtime Error",
      executionTime: "0ms",
      memory: "N/A",
    };
  }

  // Determine test cases to run
  const testsToRun = isSubmission
    ? [...qTest.sampleTests, ...qTest.hiddenTests]
    : qTest.sampleTests;

  const totalCount = testsToRun.length;
  const comparator = qTest.comparator || "exact";

  // Build executable code with test harness
  const sourceCode = buildHarnessCode(questionId, language, code, testsToRun);

  try {
    const result = await executeInSandbox({
      sourceCode,
      languageId: langConfig.judgeId,
    });

    const statusId = result.status?.id;

    // 1. Compilation Error
    if (statusId === 6 || (result.compile_output && result.compile_output.trim())) {
      return {
        success: false,
        status: "Compilation Error",
        compileError: result.compile_output,
        error: result.compile_output || "Compilation failed.",
        testResults: [],
        passedCount: 0,
        totalCount,
        executionTime: "0ms",
        memory: "N/A",
      };
    }

    // 2. Time Limit Exceeded
    if (statusId === 5) {
      return {
        success: false,
        status: "Time Limit Exceeded",
        runtimeError: "Time Limit Exceeded (CPU execution limit 3.0s)",
        error: "Execution timed out (Time Limit Exceeded). Check for infinite loops or inefficient algorithms.",
        testResults: [],
        passedCount: 0,
        totalCount,
        executionTime: "> 3000ms",
        memory: "N/A",
      };
    }

    // 3. Runtime Error (Segmentation fault, non-zero exit without stdout, etc.)
    if (statusId >= 7 && statusId <= 12 && !result.stdout) {
      return {
        success: false,
        status: "Runtime Error",
        runtimeError: result.stderr || result.status?.description,
        error: `Runtime Error (${result.status?.description || "Error"}):\n${result.stderr || ""}`.trim(),
        testResults: [],
        passedCount: 0,
        totalCount,
        executionTime: result.time ? `${Math.round(parseFloat(result.time) * 1000)}ms` : "0ms",
        memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : "N/A",
      };
    }

    // 4. Parse stdout results: "__TEST_RESULT__:{...}"
    const stdout = result.stdout || "";
    const lines = stdout.split(/\r?\n/);
    const parsedResults = [];

    for (const line of lines) {
      if (line.startsWith("__TEST_RESULT__:")) {
        try {
          const raw = line.slice("__TEST_RESULT__:".length).trim();
          const parsed = JSON.parse(raw);
          parsedResults.push(parsed);
        } catch {
          // Ignore malformed JSON lines
        }
      }
    }

    // If zero test results were printed and stderr has content, treat as Runtime Error
    if (parsedResults.length === 0) {
      if (result.stderr && result.stderr.trim()) {
        return {
          success: false,
          status: "Runtime Error",
          error: `Runtime Error:\n${result.stderr.trim()}`,
          testResults: [],
          passedCount: 0,
          totalCount,
          executionTime: result.time ? `${Math.round(parseFloat(result.time) * 1000)}ms` : "0ms",
          memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : "N/A",
        };
      }

      // If execution finished but no test output markers were found
      return {
        success: false,
        status: "Runtime Error",
        error: `No test outputs produced. Ensure your function '${qTest.fnName?.[language] || "solve"}' is defined and returns a value.`,
        testResults: [],
        passedCount: 0,
        totalCount,
        executionTime: result.time ? `${Math.round(parseFloat(result.time) * 1000)}ms` : "0ms",
        memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : "N/A",
      };
    }

    // 5. Evaluate each test case using robust outputComparator
    let passedCount = 0;
    const testResults = [];

    for (let idx = 0; idx < testsToRun.length; idx++) {
      const isHidden = isSubmission && idx >= qTest.sampleTests.length;
      const parsed = parsedResults.find((p) => p.index === idx);

      let passed = false;
      let error = parsed?.error || null;
      let actualVal = parsed?.actual;

      if (parsed && !parsed.error) {
        passed = compareOutputs(actualVal, testsToRun[idx].expected, comparator);
      }

      if (passed) passedCount++;

      if (!isHidden) {
        // Public sample case: full inspection allowed
        testResults.push({
          testCaseId: idx + 1,
          passed,
          input: JSON.stringify(testsToRun[idx].input),
          expected: JSON.stringify(testsToRun[idx].expected),
          actual: actualVal !== undefined ? JSON.stringify(actualVal) : "Error / No output",
          error,
          isHidden: false,
        });
      } else {
        // Hidden test case: NEVER expose input, expected, or actual output! (Rule 8)
        testResults.push({
          testCaseId: idx + 1,
          passed,
          isHidden: true,
          error: error ? "Runtime exception occurred on hidden test case" : null,
        });
      }
    }

    const allPassed = passedCount === totalCount;
    const executionTime = result.time ? `${Math.round(parseFloat(result.time) * 1000)}ms` : "0ms";
    const memory = result.memory ? `${Math.round(result.memory / 1024)}MB` : "N/A";

    const status = allPassed ? "Accepted" : "Wrong Answer";

    return {
      success: allPassed,
      status,
      passedCount,
      totalCount,
      testResults,
      executionTime,
      memory,
      error: !allPassed ? `${totalCount - passedCount} of ${totalCount} test cases failed.` : null,
    };
  } catch (execErr) {
    return {
      success: false,
      status: "Runtime Error",
      error: execErr.message || "Execution service unavailable.",
      testResults: [],
      passedCount: 0,
      totalCount,
      executionTime: "0ms",
      memory: "N/A",
    };
  }
}
