import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const targets = ["README.md", "app", "components/landing"];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);
const riskyTerms = [
  "production-ready",
  "zero-knowledge verification",
  "AI fraud scoring",
  "universal verification engine",
  "cryptographic fraud prevention platform",
];
const complianceLanguage = /\b(?:HIPAA|SOC 2|GDPR)\b/i;

async function collectFiles(path) {
  const entries = await readdir(path, { withFileTypes: true }).catch((error) => {
    if (error?.code === "ENOTDIR") return null;
    throw error;
  });

  if (!entries) return [path];

  const files = [];
  for (const entry of entries) {
    if (entry.name === ".next" || entry.name === "node_modules") continue;
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(child)));
    else if (entry.isFile() && textExtensions.has(extname(entry.name).toLowerCase())) files.push(child);
  }
  return files;
}

function findMatches(file, content) {
  const matches = [];
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    for (const term of riskyTerms) {
      if (line.toLowerCase().includes(term.toLowerCase())) {
        matches.push({ file, line: index + 1, reason: `flagged term: ${term}` });
      }
    }
    if (complianceLanguage.test(line)) {
      matches.push({ file, line: index + 1, reason: "unsupported compliance language" });
    }
  }
  return matches;
}

console.log("Checking public-facing website messaging for risky terms...");

const files = (await Promise.all(targets.map((target) => collectFiles(resolve(projectRoot, target))))).flat();
const matches = [];

for (const file of files) {
  const content = await readFile(file, "utf8");
  matches.push(...findMatches(relative(projectRoot, file), content));
}

if (matches.length > 0) {
  for (const match of matches) {
    console.error(`${match.file}:${match.line} ${match.reason}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Website messaging guardrail check passed (${files.length} files checked).`);
}
