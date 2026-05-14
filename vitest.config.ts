import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["registry/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
  resolve: {
    alias: [
      { find: /^@\/lib\/(.*)$/, replacement: new URL("./lib", import.meta.url).pathname + "/$1" },
      { find: "@", replacement: new URL("./registry/default", import.meta.url).pathname },
    ],
  },
});
