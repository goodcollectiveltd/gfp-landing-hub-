import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Dev server runs on 8080 to match the sibling clever-logistics-pal convention.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
  },
});
