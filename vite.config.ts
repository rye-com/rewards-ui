import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Dev playground only. We do not ship a built bundle of the component
 * library — partners get source via `shadcn add` (see registry.json). This
 * config exists so we can `pnpm dev` and look at the components in a real
 * browser while building them.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
});
