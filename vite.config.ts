import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev playground only. Partners get component source via `shadcn add`
// (see registry.json); no built bundle is published.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\/lib\/(.*)$/, replacement: new URL("./lib", import.meta.url).pathname + "/$1" },
      { find: "@", replacement: new URL("./registry/default", import.meta.url).pathname },
    ],
  },
  server: {
    port: 5173,
    open: true,
  },
});
