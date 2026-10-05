// api/interviews/[id].js
// Dynamic Vercel Serverless route for single-interview operations (/api/interviews/:id).

import interviewHandler from "../interviews.js";

export default async function handler(req, res) {
  // Ensure req.query.id is populated from dynamic route segment
  if (!req.query.id && req.query["[id]"]) {
    req.query.id = req.query["[id]"];
  }
  return interviewHandler(req, res);
}
