// api/lib/codingTestCases.js
// SERVER-SIDE ONLY: Test cases, function signatures, and comparator configuration.
// NEVER bundled into or exposed to client-side bundles.

export const QUESTION_TEST_CASES = {
  "sum-of-two-numbers": {
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(1)",
      space: "O(1)",
    },
    fnName: {
      javascript: "solve",
      python: "solve",
      java: "solve",
      cpp: "solve",
      csharp: "Solve",
      dart: "solve",
    },
    comparator: "exact",
    sampleTests: [
      { input: [2, 3], expected: 5 },
      { input: [10, 20], expected: 30 },
      { input: [-5, 8], expected: 3 },
    ],
    hiddenTests: [
      { input: [0, 0], expected: 0 },
      { input: [-15, -25], expected: -40 },
      { input: [1000, 2345], expected: 3345 },
      { input: [999999, 1], expected: 1000000 },
      { input: [-100, 100], expected: 0 },
    ],
  },

  "two-sum": {
    executionMode: "function",
    expectedOutputType: "array",
    optimalComplexity: {
      time: "O(n)",
      space: "O(n)",
    },
    fnName: {
      javascript: "twoSum",
      python: "two_sum",
      java: "twoSum",
      cpp: "twoSum",
      csharp: "TwoSum",
      dart: "twoSum",
    },
    comparator: "unordered-array", // User can return indices in any order
    sampleTests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
    hiddenTests: [
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
      { input: [[0, 4, 3, 0], 0], expected: [0, 3] },
      { input: [[1, 5, 8, 11, 19, 25, 33, 39], 52], expected: [4, 6] },
      { input: [[1000000000, 5, 2, 500], 1000000500], expected: [0, 3] },
    ],
  },

  "valid-anagram": {
    executionMode: "function",
    expectedOutputType: "boolean",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)", // 26 alphabet characters is constant space
    },
    fnName: {
      javascript: "isAnagram",
      python: "is_anagram",
      java: "isAnagram",
      cpp: "isAnagram",
      csharp: "IsAnagram",
      dart: "isAnagram",
    },
    comparator: "exact",
    sampleTests: [
      { input: ["anagram", "nagaram"], expected: true },
      { input: ["rat", "car"], expected: false },
    ],
    hiddenTests: [
      { input: ["a", "a"], expected: true },
      { input: ["ab", "a"], expected: false },
      { input: ["listen", "silent"], expected: true },
      { input: ["triangle", "integral"], expected: true },
      { input: ["fluster", "restful"], expected: true },
    ],
  },

  "best-time-to-buy-and-sell-stock": {
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    fnName: {
      javascript: "maxProfit",
      python: "max_profit",
      java: "maxProfit",
      cpp: "maxProfit",
      csharp: "MaxProfit",
      dart: "maxProfit",
    },
    comparator: "exact",
    sampleTests: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1, 2]], expected: 1 },
      { input: [[2, 4, 1]], expected: 2 },
      { input: [[3, 2, 6, 5, 0, 3]], expected: 4 },
      { input: [[2, 1, 2, 1, 0, 1, 2]], expected: 2 },
    ],
  },

  "valid-parentheses": {
    executionMode: "function",
    expectedOutputType: "boolean",
    optimalComplexity: {
      time: "O(n)",
      space: "O(n)",
    },
    fnName: {
      javascript: "isValid",
      python: "is_valid",
      java: "isValid",
      cpp: "isValid",
      csharp: "IsValid",
      dart: "isValid",
    },
    comparator: "exact",
    sampleTests: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
    ],
    hiddenTests: [
      { input: ["([])"], expected: true },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
      { input: ["["], expected: false },
      { input: ["]"], expected: false },
    ],
  },

  "container-with-most-water": {
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    fnName: {
      javascript: "maxArea",
      python: "max_area",
      java: "maxArea",
      cpp: "maxArea",
      csharp: "MaxArea",
      dart: "maxArea",
    },
    comparator: "exact",
    sampleTests: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
      { input: [[1, 2, 1]], expected: 2 },
      { input: [[2, 3, 4, 5, 18, 17, 6]], expected: 17 },
    ],
  },

  "search-in-rotated-sorted-array": {
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(log n)",
      space: "O(1)",
    },
    fnName: {
      javascript: "search",
      python: "search",
      java: "search",
      cpp: "search",
      csharp: "Search",
      dart: "search",
    },
    comparator: "exact",
    sampleTests: [
      { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { input: [[1], 0], expected: -1 },
    ],
    hiddenTests: [
      { input: [[1], 1], expected: 0 },
      { input: [[1, 3], 3], expected: 1 },
      { input: [[5, 1, 3], 5], expected: 0 },
      { input: [[4, 5, 6, 7, 8, 1, 2, 3], 8], expected: 4 },
    ],
  },

  "fibonacci-number": {
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    fnName: {
      javascript: "fib",
      python: "fib",
      java: "fib",
      cpp: "fib",
      csharp: "Fib",
      dart: "fib",
    },
    comparator: "exact",
    sampleTests: [
      { input: [2], expected: 1 },
      { input: [3], expected: 2 },
      { input: [4], expected: 3 },
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [10], expected: 55 },
      { input: [20], expected: 6765 },
    ],
  },

  "merge-intervals": {
    executionMode: "function",
    expectedOutputType: "array",
    optimalComplexity: {
      time: "O(n log n)",
      space: "O(n)",
    },
    fnName: {
      javascript: "merge",
      python: "merge",
      java: "merge",
      cpp: "merge",
      csharp: "Merge",
      dart: "merge",
    },
    comparator: "deep-array",
    sampleTests: [
      { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
    ],
    hiddenTests: [
      { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
      { input: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
      { input: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expected: [[1, 10]] },
    ],
  },
};
