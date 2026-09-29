#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  counts, fail, markdownTokens, normalize, parseArgs, readUtf8, rootFrom, walk, workflows
} = require('./_shared');

const HELP = `Usage: node extract-protected-tokens.js [repository-root] --output PATH [FILE ...]

Create a protected-token JSON manifest. FILE values are repository-relative
Markdown paths; when omitted, all Markdown files are included. The output path
is resolved from the caller's current directory; the script never chooses a
location inside the skill automatically.`;

function main() {
  const args = parseArgs(process.argv.slice(2), ['output']);
  if (args.help) return console.log(HELP);
  if (!args.output) throw new Error('--output PATH is required');
  const positional = [...args._];
  const root = rootFrom(positional.shift());
  const output = path.resolve(args.output);
  const files = positional.length
    ? positional.map(value => path.resolve(root, value))
    : walk(root, file => /\.md$/i.test(file));
  const manifestFiles = {};
  for (const file of files) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Markdown file not found: ${file}`);
    const relative = normalize(path.relative(root, file));
    if (relative.startsWith('../')) throw new Error(`file is outside repository root: ${file}`);
    const tokens = markdownTokens(readUtf8(file));
    manifestFiles[relative] = {
      templateExpressions: counts(tokens.templateExpressions),
      githubExpressions: counts(tokens.githubExpressions),
      linkTargets: counts(tokens.links),
      imageSources: counts(tokens.images),
      frontmatterKeys: counts(tokens.frontmatterKeys),
      technicalInlineCode: counts(tokens.inlineCode),
      fencedCode: counts(tokens.fences)
    };
  }
  const contracts = workflows(root).map(item => ({
    file: item.file,
    name: item.name,
    push: item.push,
    branches: item.branches,
    paths: item.paths,
    pathsIgnore: item.pathsIgnore,
    envFiles: item.envFiles,
    fileValues: item.fileValues,
    textFileValues: item.textFileValues,
    directFiles: item.directFiles,
    keyphrases: item.keyphrases,
    scriptLiterals: item.scriptLiterals
  }));
  const manifest = {
    version: 1,
    repositoryRootHint: path.basename(root),
    createdAt: new Date().toISOString(),
    files: manifestFiles,
    workflowContracts: contracts
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${Object.keys(manifestFiles).length} file record(s) and ${contracts.length} workflow contract(s) to ${output}`);
}

try { main(); } catch (error) { fail(error.message); }
