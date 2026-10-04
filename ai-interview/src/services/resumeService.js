/**
 * resumeService.js
 * Production-quality client-side resume validation, text extraction (PDF, DOCX, TXT),
 * and structured analysis integration.
 * Zero external native binary dependencies; uses standard Web APIs and robust stream parsing.
 */

import { analyzeResume as aiAnalyzeResume } from "./gemini";

// Maximum supported resume file size: 5MB
export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file MIME types and extensions
export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".doc"];

/**
 * Validates the uploaded resume file.
 *
 * @param {File} file
 * @throws {Error} User-facing error message if invalid
 */
export const validateResumeFile = (file) => {
  if (!file) {
    throw new Error("No resume file selected. Please select a PDF or DOCX file.");
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty. Please upload a valid resume.");
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please upload a smaller file.`
    );
  }

  const name = (file.name || "").toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime =
    ALLOWED_RESUME_TYPES.includes(file.type) ||
    file.type === "" || // Some browsers leave type empty for docx/txt
    file.type === "application/octet-stream";

  if (!hasValidExt && !hasValidMime) {
    throw new Error("Please upload a PDF or DOCX resume (TXT is also supported).");
  }

  return true;
};

/**
 * Extracts readable plain text from a DOCX file buffer.
 * A DOCX file is a ZIP archive containing `word/document.xml`.
 * We locate the `word/document.xml` entry in the ZIP directory and decompress it
 * using the browser's native DecompressionStream('deflate-raw').
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
export const extractTextFromDocx = async (buffer) => {
  const bytes = new Uint8Array(buffer);
  const dataView = new DataView(buffer);

  // Search for ZIP Local File Header (PK\x03\x04 = 0x04034b50)
  let offset = 0;
  let documentXmlBytes = null;

  while (offset + 30 < bytes.length) {
    const sig = dataView.getUint32(offset, true);
    if (sig === 0x04034b50) {
      const compMethod = dataView.getUint16(offset + 8, true);
      const compSize = dataView.getUint32(offset + 18, true);
      const uncompSize = dataView.getUint32(offset + 22, true);
      const nameLen = dataView.getUint16(offset + 26, true);
      const extraLen = dataView.getUint16(offset + 28, true);

      const fileNameBytes = bytes.subarray(offset + 30, offset + 30 + nameLen);
      const fileName = new TextDecoder("utf-8").decode(fileNameBytes);

      const fileDataStart = offset + 30 + nameLen + extraLen;

      if (fileName === "word/document.xml") {
        const fileData = bytes.subarray(fileDataStart, fileDataStart + compSize);
        if (compMethod === 0) {
          // Stored (no compression)
          documentXmlBytes = fileData;
        } else if (compMethod === 8) {
          // Deflated: decompress with browser native DecompressionStream
          if (typeof DecompressionStream !== "undefined") {
            try {
              const ds = new DecompressionStream("deflate-raw");
              const writer = ds.writable.getWriter();
              writer.write(fileData);
              writer.close();
              const response = new Response(ds.readable);
              const decompressed = await response.arrayBuffer();
              documentXmlBytes = new Uint8Array(decompressed);
            } catch (err) {
              console.warn("[resumeService] Native deflate-raw failed, falling back to raw scan:", err);
            }
          }
        }
        break;
      }

      offset = fileDataStart + compSize;
    } else {
      offset++;
    }
  }

  let xmlString = "";
  if (documentXmlBytes) {
    xmlString = new TextDecoder("utf-8").decode(documentXmlBytes);
  } else {
    // Fallback: scan whole buffer for text segments if zip index structure differed
    xmlString = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  // Extract all text inside <w:t> tags and preserve line breaks with </w:p>
  const paragraphs = [];
  const pRegex = /<w:p(?:\s[^>]*)?>(.*?)<\/w:p>/gs;
  let pMatch;

  while ((pMatch = pRegex.exec(xmlString)) !== null) {
    const pContent = pMatch[1];
    const textPieces = [];
    const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      textPieces.push(tMatch[1]);
    }
    const paraText = textPieces.join("").trim();
    if (paraText) {
      paragraphs.push(paraText);
    }
  }

  // If paragraph regex found text, join with newlines
  if (paragraphs.length > 0) {
    return unescapeXml(paragraphs.join("\n"));
  }

  // Fallback: extract all <w:t> tags directly
  const allText = [];
  const tRegex = /<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g;
  let match;
  while ((match = tRegex.exec(xmlString)) !== null) {
    allText.push(match[1]);
  }

  return unescapeXml(allText.join(" "));
};

/**
 * Extracts text from a PDF file.
 * Uses a two-tier strategy:
 * 1. Attempts dynamic load of Mozilla's official pdfjs-dist if accessible.
 * 2. Fallback: Native stream decompressor that decompresses all /FlateDecode streams
 *    and extracts text operators (BT ... ET, Tj, TJ).
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
export const extractTextFromPdf = async (buffer) => {
  // Strategy 1: Attempt pdfjs-dist from CDN if browser is online
  if (typeof window !== "undefined") {
    try {
      let pdfjs = window.pdfjsLib;
      if (!pdfjs) {
        // Try dynamic import from reliable CDN with a short timeout
        const cdnPromise = import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("PDF.js CDN timeout")), 2500)
        );
        await Promise.race([cdnPromise, timeoutPromise]);
        pdfjs = window.pdfjsLib;
        if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
      }

      if (pdfjs) {
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const textParts = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          if (pageText.trim()) {
            textParts.push(pageText.trim());
          }
        }

        const combined = textParts.join("\n\n").trim();
        if (combined.length >= 40) {
          return combined;
        }
      }
    } catch {
      // CDN or worker failed or offline — seamlessly continue to native stream decoder
    }
  }

  // Strategy 2: Native PDF stream parser (zero-dependency, offline-ready)
  return extractPdfTextFromStreams(buffer);
};

/**
 * Native PDF stream extraction: locates all `stream...endstream` blocks,
 * decompresses any `/FlateDecode` streams via native DecompressionStream,
 * and parses text strings from PDF operators.
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
const extractPdfTextFromStreams = async (buffer) => {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder("latin1");
  const rawString = textDecoder.decode(bytes);

  const textBlocks = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamStart = match.index + match[0].indexOf("\n") + 1;
    const streamEnd = match.index + match[0].lastIndexOf("endstream") - 1;
    const streamBytes = bytes.subarray(streamStart, streamEnd);

    let decodedString = "";

    // Check if stream was compressed with /FlateDecode
    const objHeader = rawString.slice(Math.max(0, match.index - 350), match.index);
    const isFlate = objHeader.includes("/FlateDecode");

    if (isFlate && typeof DecompressionStream !== "undefined") {
      try {
        const ds = new DecompressionStream("deflate");
        const writer = ds.writable.getWriter();
        writer.write(streamBytes);
        writer.close();
        const resp = new Response(ds.readable);
        const decompressed = await resp.arrayBuffer();
        decodedString = new TextDecoder("latin1").decode(new Uint8Array(decompressed));
      } catch {
        try {
          // Some PDFs use raw deflate without zlib wrapper
          const dsRaw = new DecompressionStream("deflate-raw");
          const writer = dsRaw.writable.getWriter();
          writer.write(streamBytes);
          writer.close();
          const resp = new Response(dsRaw.readable);
          const decompressed = await resp.arrayBuffer();
          decodedString = new TextDecoder("latin1").decode(new Uint8Array(decompressed));
        } catch {
          // If decompression fails, check if plain text is readable
          decodedString = new TextDecoder("utf-8", { fatal: false }).decode(streamBytes);
        }
      }
    } else {
      decodedString = new TextDecoder("utf-8", { fatal: false }).decode(streamBytes);
    }

    if (decodedString) {
      const extractedText = parsePdfContentOperators(decodedString);
      if (extractedText.trim()) {
        textBlocks.push(extractedText.trim());
      }
    }
  }

  // Also scan literal strings outside streams if any
  const literalStrings = [];
  const parenRegex = /\(([^()]{3,})\)/g;
  let pMatch;
  while ((pMatch = parenRegex.exec(rawString)) !== null) {
    const candidate = pMatch[1].trim();
    if (
      candidate.length > 3 &&
      !candidate.includes("PDF-") &&
      !candidate.includes("Font") &&
      !candidate.includes("Catalog") &&
      /^[a-zA-Z0-9\s.,;:'"()\-–—/@#+&]+$/.test(candidate)
    ) {
      literalStrings.push(candidate);
    }
  }

  const combinedStreams = textBlocks.join("\n\n");
  if (combinedStreams.length >= 50) {
    return combinedStreams;
  }

  if (literalStrings.length >= 5) {
    return literalStrings.join(" ");
  }

  return combinedStreams;
};

/**
 * Parses PDF graphics and text operators (Tj, TJ, ', ") inside a decompressed content stream.
 *
/**
 * Decodes PDF hex-encoded strings e.g. <48656c6c6f>
 */
const decodeHexPdfString = (hex) => {
  const cleanHex = hex.replace(/\s+/g, "");
  if (!cleanHex) return "";
  let str = "";
  if (cleanHex.startsWith("feff") || cleanHex.startsWith("FEFF")) {
    for (let i = 4; i < cleanHex.length; i += 4) {
      const code = parseInt(cleanHex.substr(i, 4), 16);
      if (!isNaN(code) && code >= 32 && code < 65534) {
        str += String.fromCharCode(code);
      }
    }
  } else {
    for (let i = 0; i < cleanHex.length; i += 2) {
      const code = parseInt(cleanHex.substr(i, 2), 16);
      if (!isNaN(code) && code >= 32 && code <= 126) {
        str += String.fromCharCode(code);
      } else if (code === 10 || code === 13 || code === 9) {
        str += " ";
      }
    }
  }
  return str.trim();
};

/**
 * Parses PDF graphics and text operators (Tj, TJ, ', ") inside a decompressed content stream.
 *
 * @param {string} content
 * @returns {string}
 */
const parsePdfContentOperators = (content) => {
  const result = [];

  // Match (Text) Tj or (Text) ' or (Text) "
  const tjRegex = /\(([^)]*)\)\s*(?:Tj|'|")/g;
  let match;
  while ((match = tjRegex.exec(content)) !== null) {
    const decoded = decodePdfString(match[1]);
    if (decoded) result.push(decoded);
  }

  // Match <HEX> Tj or <HEX> ' or <HEX> "
  const hexTjRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g;
  let hMatch;
  while ((hMatch = hexTjRegex.exec(content)) !== null) {
    const decoded = decodeHexPdfString(hMatch[1]);
    if (decoded) result.push(decoded);
  }

  // Match [ (Text) 20 <HEX> ] TJ
  const arrayTjRegex = /\[(.*?)\]\s*TJ/gs;
  while ((match = arrayTjRegex.exec(content)) !== null) {
    const arrayContent = match[1];
    const itemRegex = /(?:\(([^)]*)\)|<([0-9a-fA-F]+)>)/g;
    let itemMatch;
    const words = [];
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      if (itemMatch[1] !== undefined) {
        const decoded = decodePdfString(itemMatch[1]);
        if (decoded) words.push(decoded);
      } else if (itemMatch[2] !== undefined) {
        const decoded = decodeHexPdfString(itemMatch[2]);
        if (decoded) words.push(decoded);
      }
    }
    if (words.length > 0) {
      result.push(words.join(""));
    }
  }

  return result.join(" ");
};

/**
 * Decodes PDF escape sequences: \(, \), \\, \r, \n, \t, \ooo (octal).
 *
 * @param {string} str
 * @returns {string}
 */
const decodePdfString = (str) => {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\r?\n/g, " ")
    .trim();
};

/**
 * Helper to unescape XML entities in extracted DOCX content.
 */
const unescapeXml = (str) => {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
};

/**
 * Normalizes extracted text: collapses redundant whitespace, removes null bytes,
 * preserves readable paragraph spacing.
 *
 * @param {string} text
 * @returns {string}
 */
export const normalizeResumeText = (text) => {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/\0/g, "") // remove null characters
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]{2,}/g, " ") // collapse multiple spaces/tabs
    .replace(/\n{3,}/g, "\n\n") // collapse multiple newlines into double newlines
    .trim();
};

/**
 * Orchestrates file validation, text extraction, normalization, and structured AI analysis.
 *
 * @param {File} file
 * @returns {Promise<{rawText: string, analysis: Object, claims: Array<Object>, fileName: string, fileSize: number}>}
 */
export const processResume = async (file) => {
  validateResumeFile(file);

  const name = (file.name || "resume.pdf").toLowerCase();
  let extractedRaw = "";

  try {
    if (name.endsWith(".docx")) {
      const buffer = await file.arrayBuffer();
      extractedRaw = await extractTextFromDocx(buffer);
    } else if (name.endsWith(".pdf")) {
      const buffer = await file.arrayBuffer();
      extractedRaw = await extractTextFromPdf(buffer);
    } else {
      // Text or Markdown
      extractedRaw = await file.text();
    }
  } catch (err) {
    console.error("[resumeService] Extraction error:", err);
    throw new Error(
      "Unable to read this resume. Please upload a text-based PDF or DOCX file."
    );
  }

  const normalized = normalizeResumeText(extractedRaw);

  if (!normalized || normalized.length < 50) {
    throw new Error(
      "Unable to read this resume. Please upload a text-based PDF or DOCX file (scanned image PDFs without selectable text are not supported)."
    );
  }

  // Pass normalized text to Gemini structured analysis engine
  const analysis = await aiAnalyzeResume(normalized);

  return {
    rawText: normalized,
    analysis,
    claims: analysis.resumeClaims || [],
    fileName: file.name,
    fileSize: file.size,
  };
};

export default {
  validateResumeFile,
  extractTextFromDocx,
  extractTextFromPdf,
  normalizeResumeText,
  processResume,
};
