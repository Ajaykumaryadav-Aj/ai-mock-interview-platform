# 🎙️ AI Mock Interview Platform — Frontend & Client Application

This directory contains the primary React 18 single-page application (SPA), built with **Vite**, **Tailwind CSS**, **Shadcn UI**, and integrated with **Google Gemini AI**, **Clerk Authentication**, and **Firebase Firestore**.

For full architecture diagrams, feature breakdown, and system design details, please refer to the primary [Root README](../README.md).

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Start local development server
npm run dev

# 4. Run lint check
npm run lint

# 5. Build production bundle
npm run build
```

---

## 🛠️ Key Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server at `http://localhost:5173` |
| `npm run build` | Builds optimized production bundle to `dist/` |
| `npm run preview` | Locally serves the production build |
| `npm run lint` | Runs ESLint across all `.js` and `.jsx` files |
| `npm run emulators` | Launches Firebase local emulators for Firestore & Functions |

---

## 📁 Source Directory Layout

- `src/Routes/`: Page components for Dashboard, Live AI Interview, Practice Interview, Feedback Report, and Home.
- `src/components/`: Reusable interface components and Shadcn UI primitives.
- `src/services/`:
  - `gemini.js`: Google Gemini API prompts, adaptive turn dialogues, and schema definitions.
  - `firebase.js`: Firebase client initialization.
  - `firebaseAuthBridge.js`: Clerk-to-Firebase custom authentication bridge hook.
  - `interviewService.js`: CRUD data operations with Firestore.
  - `resumeService.js`: Client-side text parsing for `.pdf` and `.docx` resumes.
