import ts from "typescript";
import transformJsx from "typescript-transform-jsx";

function logDiagnostic(diagnostic: ts.Diagnostic) {
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!
    );
    console.error(
      `${diagnostic.file.fileName} (${line + 1},${
        character + 1
      }): ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
    );
  } else {
    console.error(
      `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
    );
  }
}

export function preCompile(
  fileNames: string[],
  options: {
    // html: boolean;
    stdout: boolean;
    strict: boolean;
    outDir?: string;
    rootDir?: string;
  }
) {
  const { stdout, rootDir, outDir, strict } = options;
  let program = ts.createProgram(
    fileNames,
    {
      outDir,
      rootDir,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactNative,
      strict,
    },
    {
      ...ts.createCompilerHost({}),
      writeFile(fileName, data) {
        const content = data;
        if (stdout) process.stdout.write(content);
        else ts.sys.writeFile(fileName, content);
      },
    }
  );
  let emitResult = program.emit(undefined, undefined, undefined, undefined, {
    after: [transformJsx(program)],
  });

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(logDiagnostic);

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  if (exitCode > 0) {
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
  }
}
