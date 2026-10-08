# 🎙️ MocInterview — Frontend & Full-Stack Application Package

This directory contains the primary **React 18** Single-Page Application (SPA) and integrated **Vercel Serverless Functions** backend.

For the complete architectural design, system diagrams, and feature documentation, refer to the [Root README](../README.md).

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp ../.env.example .env.local

# 3. Start local development server (with built-in API handler)
npm run dev

# 4. Run automated integration test suite
npm test

# 5. Run lint check
npm run lint

# 6. Build optimized production bundle
npm run build
```

---

## 🛠️ Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server with built-in serverless API emulation on `http://localhost:5173` |
| `npm test` | Runs the 17-test integration suite (`tests/api.test.mjs`) using native Node.js test runner |
| `npm run build` | Compiles optimized production bundle to `dist/` |
| `npm run preview` | Serves the production build locally for verification |
| `npm run lint` | Runs ESLint across all JavaScript/JSX modules |

---

## 📁 Source Code Organization

- `api/`: Vercel Serverless Functions (`users.js`, `interviews.js`, `user-answers.js`, `gemini.js`, `coding.js`, `ats.js`).
- `api/_lib/`: MongoDB database connection, ATS scoring heuristics, and Judge0 code evaluation utilities.
- `src/Routes/`: Core application views (Home, Dashboard, Live AI Interview, Practice Interview, Coding Round, ATS Resume Score, About, Contact, Blog).
- `src/components/`: Reusable UI components, Header, Footer, and Radix UI primitives.
- `src/services/`: Client-side abstraction services for AI generation, interview CRUD, and resume extraction.
- `src/layouts/`: Nested layouts with route-level Suspense boundaries for zero-flicker navigation.
- `tests/`: Automated integration tests ensuring zero multi-tenant data leakage and strict auth enforcement.
