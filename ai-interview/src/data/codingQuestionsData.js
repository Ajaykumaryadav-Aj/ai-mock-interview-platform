// src/data/codingQuestionsData.js
// Curated dataset of popular coding interview problems across common topics.
// Public metadata and starter templates for all 6 supported languages.

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node.js)", judgeId: 102, monacoLang: "javascript", ext: "js" },
  { id: "python", label: "Python 3", judgeId: 100, monacoLang: "python", ext: "py" },
  { id: "java", label: "Java (OpenJDK)", judgeId: 91, monacoLang: "java", ext: "java" },
  { id: "cpp", label: "C++ (GCC)", judgeId: 105, monacoLang: "cpp", ext: "cpp" },
  { id: "csharp", label: "C# (Mono)", judgeId: 51, monacoLang: "csharp", ext: "cs" },
  { id: "dart", label: "Dart", judgeId: 90, monacoLang: "dart", ext: "dart" },
];

export const CODING_CATEGORIES = [
  "All",
  "Basics & Arithmetic",
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Linked List",
  "Binary Search",
  "Trees",
  "Recursion",
  "Sorting & Intervals",
];

export const CODING_QUESTIONS = [
  {
    id: "sum-of-two-numbers",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    category: "Basics & Arithmetic",
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(1)",
      space: "O(1)",
    },
    shortDescription: "Given two numbers a and b, return their arithmetic sum.",
    description: `Given two numbers \`a\` and \`b\`, return their sum \`a + b\`.

This is a fundamental warm-up problem to test environment setup, variable arithmetic, and constant-time algorithmic operations.`,
    examples: [
      {
        input: "a = 2, b = 3",
        output: "5",
        explanation: "2 + 3 = 5",
      },
      {
        input: "a = 10, b = 20",
        output: "30",
        explanation: "10 + 20 = 30",
      },
      {
        input: "a = -5, b = 8",
        output: "3",
        explanation: "-5 + 8 = 3",
      },
    ],
    constraints: [
      "-10^9 <= a <= 10^9",
      "-10^9 <= b <= 10^9",
      "Answers fit inside standard 64-bit integer ranges.",
    ],
    sampleTestCases: [
      { input: "2, 3", expected: "5" },
      { input: "10, 20", expected: "30" },
      { input: "-5, 8", expected: "3" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "Think about basic arithmetic operators in your chosen language. The `+` operator adds two numeric values." },
      { level: 2, title: "Algorithm Guidance", text: "No loops, recursion, or auxiliary data structures are needed. Return the sum of a and b directly." },
      { level: 3, title: "Implementation Guidance", text: "In JavaScript/Python/C++/Dart, return `a + b`. In Java/C#, return `a + b` from the static method inside the `Solution` class." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function solve(a, b) {
  // Write your code here
  return a + b;
}`,
      python: `def solve(a, b):
    """
    :type a: int
    :type b: int
    :rtype: int
    """
    # Write your code here
    return a + b
`,
      java: `public class Solution {
    public static int solve(int a, int b) {
        // Write your code here
        return a + b;
    }
}`,
      cpp: `#include <iostream>

int solve(int a, int b) {
    // Write your code here
    return a + b;
}`,
      csharp: `using System;

public class Solution {
    public static int Solve(int a, int b) {
        // Write your code here
        return a + b;
    }
}`,
      dart: `int solve(int a, int b) {
  // Write your code here
  return a + b;
}`,
    },
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    executionMode: "function",
    expectedOutputType: "array",
    optimalComplexity: {
      time: "O(n)",
      space: "O(n)",
    },
    shortDescription: "Find two numbers in an array that add up to a specific target.",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    sampleTestCases: [
      { input: "[2, 7, 11, 15], 9", expected: "[0, 1]" },
      { input: "[3, 2, 4], 6", expected: "[1, 2]" },
      { input: "[3, 3], 6", expected: "[0, 1]" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "Think about how you can check if the complement (target - current_number) has already been seen as you traverse the array." },
      { level: 2, title: "Algorithm Guidance", text: "A brute force check takes O(n^2). You can reduce this to O(n) by using a hash table (or Map/dictionary) to store each number and its index as you iterate." },
      { level: 3, title: "Implementation Guidance", text: "For each element `x` at index `i`, check if `target - x` exists in your hash map. If yes, return `[map[target - x], i]`. Otherwise, insert `map[x] = i`." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  return [];
}`,
      python: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your code here
    return []
`,
      java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    return {};
}`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public static int[] TwoSum(int[] nums, int target) {
        // Write your code here
        return new int[0];
    }
}`,
      dart: `List<int> twoSum(List<int> nums, int target) {
  // Write your code here
  return [];
}`,
    },
  },

  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    executionMode: "function",
    expectedOutputType: "boolean",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    shortDescription: "Determine if two strings are anagrams of each other.",
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
      },
      {
        input: 's = "rat", t = "car"',
        output: "false",
      },
    ],
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters.",
    ],
    sampleTestCases: [
      { input: '"anagram", "nagaram"', expected: "true" },
      { input: '"rat", "car"', expected: "false" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "If two words are anagrams, they must have the exact same length and the exact same character frequencies." },
      { level: 2, title: "Algorithm Guidance", text: "Compare lengths first. Then count the frequency of each letter in string s and decrement for string t. If any count differs from 0, it's not an anagram." },
      { level: 3, title: "Implementation Guidance", text: "Use an array of size 26 for lowercase English letters, or a hash map. Increment counts for characters in s, decrement for t, then check if all values are 0." },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
  // Write your code here
  return false;
}`,
      python: `def is_anagram(s, t):
    """
    :type s: str
    :type t: str
    :rtype: bool
    """
    # Write your code here
    return False
`,
      java: `import java.util.*;

public class Solution {
    public static boolean isAnagram(String s, String t) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

bool isAnagram(string s, string t) {
    // Write your code here
    return false;
}`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public static bool IsAnagram(string s, string t) {
        // Write your code here
        return false;
    }
}`,
      dart: `bool isAnagram(String s, String t) {
  // Write your code here
  return false;
}`,
    },
  },

  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Sliding Window",
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    shortDescription: "Find the maximum profit you can achieve from buying and selling a stock once.",
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the *maximum profit* you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0.",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    sampleTestCases: [
      { input: "[7, 1, 5, 3, 6, 4]", expected: "5" },
      { input: "[7, 6, 4, 3, 1]", expected: "0" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "You must buy before you sell. What is the minimum price observed so far as you move forward in time?" },
      { level: 2, title: "Algorithm Guidance", text: "Maintain two variables: `min_price` seen so far and `max_profit`. Update `min_price` if the current day is lower, or update `max_profit` if selling today yields higher profit." },
      { level: 3, title: "Implementation Guidance", text: "Initialize `min_price = Infinity` and `max_profit = 0`. For each price `p`, `max_profit = max(max_profit, p - min_price)`, and `min_price = min(min_price, p)`." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Write your code here
  return 0;
}`,
      python: `def max_profit(prices):
    """
    :type prices: List[int]
    :rtype: int
    """
    # Write your code here
    return 0
`,
      java: `public class Solution {
    public static int maxProfit(int[] prices) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int maxProfit(vector<int>& prices) {
    // Write your code here
    return 0;
}`,
      csharp: `using System;

public class Solution {
    public static int MaxProfit(int[] prices) {
        // Write your code here
        return 0;
    }
}`,
      dart: `int maxProfit(List<int> prices) {
  // Write your code here
  return 0;
}`,
    },
  },

  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    executionMode: "function",
    expectedOutputType: "boolean",
    optimalComplexity: {
      time: "O(n)",
      space: "O(n)",
    },
    shortDescription: "Validate whether brackets in a string are closed in the correct order.",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    sampleTestCases: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "The most recently opened bracket must be the first one closed. What data structure has LIFO (Last In First Out) property?" },
      { level: 2, title: "Algorithm Guidance", text: "Push opening brackets onto a stack. When you encounter a closing bracket, check if the stack is non-empty and whether the top matches." },
      { level: 3, title: "Implementation Guidance", text: "Use a map of closing to opening pairs `{ ')': '(', '}': '{', ']': '[' }`. If character is in map, pop from stack and verify match. Return `stack.length === 0` at the end." },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  return false;
}`,
      python: `def is_valid(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your code here
    return False
`,
      java: `import java.util.*;

public class Solution {
    public static boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <string>
#include <stack>
using namespace std;

bool isValid(string s) {
    // Write your code here
    return false;
}`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public static bool IsValid(string s) {
        // Write your code here
        return false;
    }
}`,
      dart: `bool isValid(String s) {
  // Write your code here
  return false;
}`,
    },
  },

  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    shortDescription: "Find two lines that together with the x-axis form a container containing the most water.",
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the *maximum amount of water a container can store*.

Notice that you may not slant the container.`,
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The vertical lines are at indices 1 and 8 with heights 8 and 7. The width is 7. Area = min(8, 7) * 7 = 49.",
      },
      {
        input: "height = [1,1]",
        output: "1",
      },
    ],
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4",
    ],
    sampleTestCases: [
      { input: "[1, 8, 6, 2, 5, 4, 8, 3, 7]", expected: "49" },
      { input: "[1, 1]", expected: "1" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "The volume of water is limited by the shorter line: `min(height[left], height[right]) * (right - left)`. Start with the widest possible width." },
      { level: 2, title: "Algorithm Guidance", text: "Place one pointer at index 0 and one at the last index. To potentially find a taller boundary, move the pointer pointing to the shorter line inward." },
      { level: 3, title: "Implementation Guidance", text: "While `left < right`, compute area, update `max_area`, and if `height[left] < height[right]`, increment `left`; otherwise decrement `right`." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your code here
  return 0;
}`,
      python: `def max_area(height):
    """
    :type height: List[int]
    :rtype: int
    """
    # Write your code here
    return 0
`,
      java: `public class Solution {
    public static int maxArea(int[] height) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int maxArea(vector<int>& height) {
    // Write your code here
    return 0;
}`,
      csharp: `using System;

public class Solution {
    public static int MaxArea(int[] height) {
        // Write your code here
        return 0;
    }
}`,
      dart: `int maxArea(List<int> height) {
  // Write your code here
  return 0;
}`,
    },
  },

  {
    id: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Binary Search",
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(log n)",
      space: "O(1)",
    },
    shortDescription: "Search for a target value in an ascending sorted array that has been rotated.",
    description: `There is an integer array \`nums\` sorted in ascending order (with distinct values).

Prior to being passed to your function, \`nums\` is possibly rotated at an unknown pivot index \`k\` (\`1 <= k < nums.length\`).

Given the array \`nums\` after the possible rotation and an integer \`target\`, return the *index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`*.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
      { input: "nums = [1], target = 0", output: "-1" },
    ],
    constraints: [
      "1 <= nums.length <= 5000",
      "-10^4 <= nums[i] <= 10^4",
      "All values of nums are unique.",
      "-10^4 <= target <= 10^4",
    ],
    sampleTestCases: [
      { input: "[4, 5, 6, 7, 0, 1, 2], 0", expected: "4" },
      { input: "[4, 5, 6, 7, 0, 1, 2], 3", expected: "-1" },
      { input: "[1], 0", expected: "-1" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "Even if rotated, whenever you divide the array in half, at least one of the two halves is guaranteed to be strictly sorted." },
      { level: 2, title: "Algorithm Guidance", text: "In binary search with `mid = (low + high) / 2`, check if `nums[low] <= nums[mid]` (left is sorted) or right is sorted. Then check if target falls within the sorted half's boundaries." },
      { level: 3, title: "Implementation Guidance", text: "If left half is sorted and `nums[low] <= target < nums[mid]`, search left (`high = mid - 1`), else search right. Mirror logic if right half is sorted." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Write your code here
  return -1;
}`,
      python: `def search(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    # Write your code here
    return -1
`,
      java: `public class Solution {
    public static int search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`,
      cpp: `#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    // Write your code here
    return -1;
}`,
      csharp: `using System;

public class Solution {
    public static int Search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`,
      dart: `int search(List<int> nums, int target) {
  // Write your code here
  return -1;
}`,
    },
  },

  {
    id: "fibonacci-number",
    title: "Fibonacci Number",
    difficulty: "Easy",
    category: "Recursion",
    executionMode: "function",
    expectedOutputType: "number",
    optimalComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    shortDescription: "Calculate the nth number in the Fibonacci sequence.",
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`. That is,

\`F(0) = 0, F(1) = 1\`
\`F(n) = F(n - 1) + F(n - 2)\`, for \`n > 1\`.

Given \`n\`, calculate \`F(n)\`.`,
    examples: [
      { input: "n = 2", output: "1", explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1." },
      { input: "n = 3", output: "2", explanation: "F(3) = F(2) + F(1) = 1 + 1 = 2." },
      { input: "n = 4", output: "3", explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3." },
    ],
    constraints: ["0 <= n <= 30"],
    sampleTestCases: [
      { input: "2", expected: "1" },
      { input: "3", expected: "2" },
      { input: "4", expected: "3" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "F(0) = 0 and F(1) = 1 are base cases. Naive recursion recalculates overlapping subproblems." },
      { level: 2, title: "Algorithm Guidance", text: "Use dynamic programming with two state variables to compute from 2 up to n in O(n) time and O(1) space." },
      { level: 3, title: "Implementation Guidance", text: "Initialize `a = 0, b = 1`. Loop from 2 to n: `temp = a + b; a = b; b = temp;` Return `b`." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function fib(n) {
  // Write your code here
  return 0;
}`,
      python: `def fib(n):
    """
    :type n: int
    :rtype: int
    """
    # Write your code here
    return 0
`,
      java: `public class Solution {
    public static int fib(int n) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `int fib(int n) {
    // Write your code here
    return 0;
}`,
      csharp: `public class Solution {
    public static int Fib(int n) {
        // Write your code here
        return 0;
    }
}`,
      dart: `int fib(int n) {
  // Write your code here
  return 0;
}`,
    },
  },

  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Sorting & Intervals",
    executionMode: "function",
    expectedOutputType: "array",
    optimalComplexity: {
      time: "O(n log n)",
      space: "O(n)",
    },
    shortDescription: "Merge all overlapping intervals in an array.",
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
      },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4",
    ],
    sampleTestCases: [
      { input: "[[1, 3], [2, 6], [8, 10], [15, 18]]", expected: "[[1, 6], [8, 10], [15, 18]]" },
      { input: "[[1, 4], [4, 5]]", expected: "[[1, 5]]" },
    ],
    hints: [
      { level: 1, title: "Conceptual Direction", text: "Sorting intervals by their starting points makes overlapping intervals adjacent to one another." },
      { level: 2, title: "Algorithm Guidance", text: "Sort by start time. Iterate through sorted intervals; if the current interval starts before or at the end of the last merged interval, update the last interval's end to `max(last.end, current.end)`." },
      { level: 3, title: "Implementation Guidance", text: "Append the first interval to `merged`. For each subsequent interval `[s, e]`, if `s <= merged.last.end`, set `merged.last.end = max(merged.last.end, e)`. Else push `[s, e]`." },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your code here
  return [];
}`,
      python: `def merge(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: List[List[int]]
    """
    # Write your code here
    return []
`,
      java: `import java.util.*;

public class Solution {
    public static int[][] merge(int[][] intervals) {
        // Write your code here
        return new int[][]{};
    }
}`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // Write your code here
    return {};
}`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public static int[][] Merge(int[][] intervals) {
        // Write your code here
        return new int[0][];
    }
}`,
      dart: `List<List<int>> merge(List<List<int>> intervals) {
  // Write your code here
  return [];
}`,
    },
  },
];
