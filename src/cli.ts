#!/usr/bin/env node
import globby from "globby";
import yargs from "yargs";
import ts from "typescript";
import { compile } from ".";
import { preCompile } from "./precompile";

function main() {
  const { _: patterns, ...options } = yargs
    .usage("Usage: $0 <files glob pattern> [options]")
    .option("rootDir", {
      string: true,
      description: "Same as in tsconfig.json",
    })
    .option("outDir", { string: true, description: "Same as in tsconfig.json" })
    .option("strict", {
      boolean: true,
      description: "Same as in tsconfig.json",
      default: false,
    })
    .option("html", {
      boolean: true,
      description: "Outputs html files",
      default: false,
    })
    .option("stdout", {
      boolean: true,
      description: "Outputs to stdout",
      default: false,
    })
    .version()
    .help().argv;
  if (patterns.length === 0) return;
  const files = globby.sync([...patterns]);

  if (options.html) {
    compile(files, options);
  } else {
    preCompile(files, options);
  }
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
