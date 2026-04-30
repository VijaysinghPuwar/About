import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // React + Radix must share a chunk. Radix calls React.forwardRef at
          // module-evaluation time; if a separate radix-vendor chunk is parsed
          // before react-vendor, React is undefined and the page crashes in
          // production (this happened on the first deploy of PR #2).
          // Combining them guarantees React is initialized first.
          if (
            id.includes("@radix-ui") ||
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/")
          ) {
            return "react-radix-vendor";
          }
          if (
            id.includes("@supabase") ||
            id.includes("@tanstack/react-query") ||
            id.includes("@lovable.dev")
          ) {
            return "supabase-vendor";
          }
          if (id.includes("/recharts/") || id.includes("/d3-")) return "charts-vendor";
          if (id.includes("/framer-motion/")) return "motion-vendor";
        },
      },
    },
  },
}));
