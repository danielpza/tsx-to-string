#!/usr/bin/env node
import globby from "globby";
import yargs from "yargs";
import ts from "typescript";
import transformJsx from "typescript-transform-jsx";
import { resolve, basename } from "path";

function compileJs(code: string) {
  return eval(code)();
}

function compile(
  fileNames: string[],
  options: { html: boolean; outDir?: string; rootDir?: string }
): void {
  let program = ts.createProgram(
    fileNames,
    {
      outDir: options.outDir,
      rootDir: options.rootDir,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactNative,
      noEmitOnError: true,
      noImplicitAny: true
    },
    {
      ...ts.createCompilerHost({}),
      writeFile(fileName, data) {
        if (options.html)
          ts.sys.writeFile(
            basename(fileName, ".js") + ".html",
            compileJs(data)
          );
        else ts.sys.writeFile(fileName, data);
      }
    }
  );
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
  const { _: patterns, html } = yargs.boolean("html").argv;
  if (patterns.length === 0) return;
  const files = globby.sync([...patterns, resolve(__dirname, "../types.d.ts")]);
  compile(files, { html: !!html });
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
