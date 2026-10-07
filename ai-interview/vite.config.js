import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function attachExpressHelpers(res) {
  if (!res.status) {
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function (data) {
      if (!this.headersSent) {
        this.setHeader("Content-Type", "application/json");
      }
      this.end(JSON.stringify(data));
      return this;
    };
  }
}

/**
 * Vite plugin that serves serverless API routes locally during development
 * without requiring external deployment proxies or Firebase emulators.
 */
function localApiPlugin() {
  return {
    name: "local-api-handler",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) {
          return next();
        }

        const urlObj = new URL(req.url, "http://localhost:5173");
        const pathname = urlObj.pathname;
        let queryParams = Object.fromEntries(urlObj.searchParams.entries());
        let handler = null;

        try {
          if (pathname === "/api/users") {
            const mod = await import("./api/users.js");
            handler = mod.default;
          } else if (pathname === "/api/interviews") {
            const mod = await import("./api/interviews.js");
            handler = mod.default;
          } else if (pathname.startsWith("/api/interviews/")) {
            const id = pathname.slice("/api/interviews/".length);
            queryParams.id = id;
            const mod = await import("./api/interviews.js");
            handler = mod.default;
          } else if (pathname === "/api/user-answers") {
            const mod = await import("./api/user-answers.js");
            handler = mod.default;
          } else if (pathname === "/api/gemini") {
            const mod = await import("./api/gemini.js");
            handler = mod.default;
          } else if (pathname === "/api/coding" || pathname.startsWith("/api/coding/")) {
            const mod = await import("./api/coding.js");
            handler = mod.default;
          } else if (pathname === "/api/ats" || pathname.startsWith("/api/ats/")) {
            const mod = await import("./api/ats.js");
            handler = mod.default;
          }

          if (handler) {
            req.query = queryParams;

            const executeHandler = async () => {
              attachExpressHelpers(res);
              try {
                await handler(req, res);
              } catch (err) {
                console.error("[Vite Local API Error]", err);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "Internal server error" }));
                }
              }
            };

            if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
              let bodyData = "";
              req.on("data", (chunk) => {
                bodyData += chunk;
              });
              req.on("end", async () => {
                try {
                  req.body = bodyData ? JSON.parse(bodyData) : {};
                } catch {
                  req.body = {};
                }
                await executeHandler();
              });
              return;
            }

            await executeHandler();
            return;
          }
        } catch (routeErr) {
          console.error("[Vite Local API Routing Error]", routeErr);
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for the current mode into process.env so local APIs can access them
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), localApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

