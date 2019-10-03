#!/usr/bin/env node
import globby from "globby";
import yargs from "yargs";
import ts from "typescript";
import transformJsx from "typescript-transform-jsx";
import { resolve } from "path";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit(undefined, undefined, undefined, undefined, {
    after: [transformJsx(program)]
  });

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
      );
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

function main() {
  const { _: patterns } = yargs.argv;
  if (patterns.length === 0) return;
  const files = globby.sync([...patterns, resolve(__dirname, "../types.d.ts")]);

  compile(files, {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.Preserve,
    noEmitOnError: true,
    noImplicitAny: true
  });
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
