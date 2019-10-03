#!/usr/bin/env node
import globby from "globby";
import yargs from "yargs";
import ts from "typescript";
import { compile } from ".";

function logDiagnostic(diagnostic: ts.Diagnostic) {
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!
    );
    console.error(
      `${diagnostic.file.fileName} (${line + 1},${character +
        1}): ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
    );
  } else {
    console.error(
      `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
    );
  }
}

function main() {
  const { _: patterns, ...options } = yargs
    .usage("Usage: $0 <files glob pattern> [options]")
    .option("rootDir", {
      string: true,
      description: "Same as in tsconfig.json"
    })
    .option("outDir", { string: true, description: "Same as in tsconfig.json" })
    .option("strict", {
      boolean: true,
      description: "Same as in tsconfig.json",
      default: false
    })
    .option("html", {
      boolean: true,
      description: "Outputs html files",
      default: false
    })
    .option("stdout", {
      boolean: true,
      description: "Outputs to stdout",
      default: false
    })
    .version()
    .help().argv;
  if (patterns.length === 0) return;
  const files = globby.sync([...patterns]);

  const { allDiagnostics, emitResult } = compile(files, options);

  allDiagnostics.forEach(logDiagnostic);

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  if (exitCode > 0) {
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
  }
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
