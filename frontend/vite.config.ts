import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "0.0.0.0", // ✅ ensures compatibility with Render, Vercel, etc.
      port: 5173, // default vite port
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8080", // ✅ Proxy backend calls
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env": env, // ✅ allows access to .env vars in components
    },
  };
});
