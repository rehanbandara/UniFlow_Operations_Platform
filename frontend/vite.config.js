import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: true, // set to false if you want no full-screen error overlay
    },
  },
});