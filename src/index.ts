import ts from "typescript";
import transformJsx from "typescript-transform-jsx";
import { basename } from "path";

function compileJs(code: string) {
  return eval(code)();
}

export function compile(
  fileNames: string[],
  options: {
    html: boolean;
    stdout: boolean;
    strict: boolean;
    outDir?: string;
    rootDir?: string;
  }
) {
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

  return { allDiagnostics, emitResult };
}
