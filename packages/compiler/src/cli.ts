#!/usr/bin/env node
// ============================================================
// CLI — Compile .sdui files to JSON schema files
// Usage: node dist/cli.js [input-dir] [output-dir]
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, basename } from "path";
import { compile } from "./index.js";

const inputDir = process.argv[2] ?? join(process.cwd(), "screens");
const outputDir = process.argv[3] ?? join(process.cwd(), "dist", "screens");

mkdirSync(outputDir, { recursive: true });

const files = readdirSync(inputDir).filter((f) => f.endsWith(".sdui"));

if (files.length === 0) {
  console.log(`No .sdui files found in ${inputDir}`);
  process.exit(0);
}

console.log(`Compiling ${files.length} screen(s)...\n`);

let hasErrors = false;

for (const file of files) {
  const source = readFileSync(join(inputDir, file), "utf-8");
  const outputName = basename(file, ".sdui") + ".json";

  try {
    const result = compile(source);

    if (result.errors.length > 0) {
      console.error(`  ✗ ${file}`);
      for (const err of result.errors) {
        console.error(`    ERROR: ${err}`);
      }
      hasErrors = true;
    } else {
      writeFileSync(
        join(outputDir, outputName),
        JSON.stringify(result.screen, null, 2)
      );
      console.log(`  ✓ ${file} → ${outputName}`);
    }

    for (const warn of result.warnings) {
      console.warn(`    WARN: ${warn}`);
    }
  } catch (err) {
    console.error(`  ✗ ${file}: ${err instanceof Error ? err.message : err}`);
    hasErrors = true;
  }
}

console.log("");
if (hasErrors) {
  console.error("Compilation finished with errors.");
  process.exit(1);
} else {
  console.log("All screens compiled successfully.");
}
