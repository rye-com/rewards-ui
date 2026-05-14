#!/usr/bin/env node
// Disallow Tailwind arbitrary values for sizing classes. Catalog tiles, PDPs,
// and checkout sheets should all read from the same `text-xs` / `tracking-widest`
// scale tokens so themes stay consistent and partner overrides apply cleanly.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SCAN_DIRS = ["registry/default", "playground", "src"];
const EXTENSIONS = /\.(tsx?|css)$/;

const PATTERNS = [
  { name: "text size", regex: /\btext-\[[\d.]+(?:px|rem|em)\]/g },
  { name: "tracking", regex: /-?\btracking-\[[-\d.]+(?:em|rem|px)\]/g },
  { name: "leading", regex: /\bleading-\[[\d.]+(?:px|em|rem)\]/g },
  { name: "font weight", regex: /\bfont-\[\d+\]/g },
];

const files = execSync(`git ls-files ${SCAN_DIRS.join(" ")}`, { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter((f) => f && EXTENSIONS.test(f));

let violations = 0;
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { name, regex } of PATTERNS) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        console.error(`${file}:${i + 1}: ${name} uses arbitrary value: ${match[0]}`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(
    `\n${violations} arbitrary-size class(es) found. Use Tailwind scale tokens (text-xs, tracking-widest, leading-snug, etc.) instead.`,
  );
  process.exit(1);
}
