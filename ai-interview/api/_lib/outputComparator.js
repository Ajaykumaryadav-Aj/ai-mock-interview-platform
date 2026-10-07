// api/lib/outputComparator.js
// Robust, deterministic output normalization and comparison engine for coding problems.
// Handles numbers, floats with epsilon tolerance, booleans, strings, arrays, and objects.

/**
 * Normalizes any value for comparison.
 */
export function normalizeValue(val) {
  if (val === null || val === undefined) return "";

  // If boolean
  if (typeof val === "boolean") return val;

  // If string, trim and normalize CRLF to LF
  if (typeof val === "string") {
    const trimmed = val.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    // Check if it's stringified boolean
    if (trimmed.toLowerCase() === "true") return true;
    if (trimmed.toLowerCase() === "false") return false;

    // Check if it's a valid JSON representation of array or number
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }

    // Check if it's a pure number string
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!Number.isNaN(num)) return num;
    }

    return trimmed;
  }

  // If number
  if (typeof val === "number") return val;

  // If array or object, clone or return as is
  return val;
}

/**
 * Safely compares actual vs expected values based on comparator strategy.
 *
 * @param {*} actual The actual value produced by the user code
 * @param {*} expected The expected test case output
 * @param {string} comparator Strategy: "exact" | "unordered-array" | "deep-array" | "float" | "case-insensitive"
 * @param {number} floatEpsilon Tolerance for float comparison
 * @returns {boolean} True if values match
 */
export function compareOutputs(actual, expected, comparator = "exact", floatEpsilon = 1e-6) {
  // Normalize both sides
  const normActual = normalizeValue(actual);
  const normExpected = normalizeValue(expected);

  // 1. Direct identity / primitive equality
  if (normActual === normExpected) return true;

  // 2. Numeric comparison (e.g. 5 vs 5.0 or "5" vs 5)
  if (typeof normActual === "number" && typeof normExpected === "number") {
    if (Number.isNaN(normActual) && Number.isNaN(normExpected)) return true;
    return Math.abs(normActual - normExpected) <= floatEpsilon;
  }

  // 3. Boolean comparison
  if (typeof normActual === "boolean" || typeof normExpected === "boolean") {
    return normActual === normExpected;
  }

  // 4. Array comparison
  if (Array.isArray(normActual) && Array.isArray(normExpected)) {
    if (normActual.length !== normExpected.length) return false;

    if (comparator === "unordered-array") {
      // Sort copies for comparison
      const sortFn = (a, b) => {
        if (typeof a === "number" && typeof b === "number") return a - b;
        return String(a).localeCompare(String(b));
      };
      const sortedActual = [...normActual].sort(sortFn);
      const sortedExpected = [...normExpected].sort(sortFn);

      for (let i = 0; i < sortedActual.length; i++) {
        if (!compareOutputs(sortedActual[i], sortedExpected[i], "exact", floatEpsilon)) {
          return false;
        }
      }
      return true;
    }

    // Default ordered array comparison
    for (let i = 0; i < normActual.length; i++) {
      if (!compareOutputs(normActual[i], normExpected[i], "exact", floatEpsilon)) {
        return false;
      }
    }
    return true;
  }

  // 5. String comparison with whitespace/newline normalization
  if (typeof normActual === "string" && typeof normExpected === "string") {
    const cleanActual = normActual.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    const cleanExpected = normExpected.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

    if (comparator === "case-insensitive") {
      return cleanActual.toLowerCase() === cleanExpected.toLowerCase();
    }

    // Collapse multiple internal spaces if comparator is lenient
    if (comparator === "lenient-whitespace") {
      return cleanActual.replace(/\s+/g, " ") === cleanExpected.replace(/\s+/g, " ");
    }

    return cleanActual === cleanExpected;
  }

  // 6. Object deep comparison via JSON fallback
  try {
    return JSON.stringify(normActual) === JSON.stringify(normExpected);
  } catch {
    return false;
  }
}
