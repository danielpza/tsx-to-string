import { relative, resolve, basename, dirname } from "path";
import mkdirp from "mkdirp";
import { writeFileSync } from "fs";
import { execSync } from "child_process";

function getOutFile(
  file: string,
  { rootDir, outDir }: { rootDir: string; outDir: string }
) {
  const root = resolve(rootDir);
  const resolvedFile = resolve(rootDir, resolve(file));
  return resolve(
    outDir,
    dirname(relative(root, resolvedFile)),
    basename(file, ".tsx") + ".html"
  );
}

function createCompilerCode(
  fileNames: string[],
  options: { outDir: string; rootDir: string }
): string {
  return `\
const { writeFileSync } = require("fs");
const { default: tsxTransformer } = require("typescript-transform-jsx");
const { register } = require("ts-node");
const { dirname } = require("path");
const mkdirp = require("mkdirp");

register({
  dir: "${resolve(options.rootDir)}",
  transformers: { after: [tsxTransformer] },
});

const files = [
${fileNames
  .map((file) => `["${resolve(file)}", "${getOutFile(file, options)}"]`)
  .join("\n")}
];

files.forEach(([path, out]) => {
  const mod = require(path);
  const outDir = dirname(out);
  const result = mod.default();

  mkdirp.sync(outDir);
  writeFileSync(out, result);
});
`;
}

function createCompilerFile(
  fileNames: string[],
  options: { outDir: string; rootDir: string }
): string {
  const wrapperDir = resolve(__dirname, "__compiler_wrapper");
  mkdirp.sync(wrapperDir);
  const compilerFile = resolve(wrapperDir, "compiler.js");
  const code = createCompilerCode(fileNames, options);
  writeFileSync(compilerFile, code);
  return compilerFile;
}

function runCompilerFile(fileName: string) {
  execSync(`node ${fileName}`);
}

export function compile(
  fileNames: string[],
  options: { outDir?: string; rootDir?: string }
) {
  const outDir = options.outDir || ".";
  const rootDir = options.rootDir || ".";
  const file = createCompilerFile(fileNames, { outDir, rootDir });
  runCompilerFile(file);
}
