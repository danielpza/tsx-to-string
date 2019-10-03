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
  options: {
    html: boolean;
    stdout: boolean;
    strict: boolean;
    outDir?: string;
    rootDir?: string;
  }
): void {
  const { html, stdout, rootDir, outDir, strict } = options;
  let program = ts.createProgram(
    fileNames,
    {
      outDir,
      rootDir,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactNative,
      strict
    },
    {
      ...ts.createCompilerHost({}),
      writeFile(fileName, data) {
        const content = html ? compileJs(data) : data;
        if (stdout) process.stdout.write(content);
        else if (html)
          ts.sys.writeFile(basename(fileName, ".js") + ".html", content);
        else ts.sys.writeFile(fileName, content);
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
  if (exitCode > 0) {
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
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
  compile(files, options);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
