import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget =
    env.VITE_API_PROXY_TARGET ||
    "https://ai-mock-interview-platform-pied-one.vercel.app";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/exchangeToken": {
          target: "http://127.0.0.1:5001/ai-interview-1842f/us-central1",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/exchangeToken/, "/exchangeToken"),
        },
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          headers: {
            Origin: apiTarget,
          },
        },
      },
    },
  };
});
