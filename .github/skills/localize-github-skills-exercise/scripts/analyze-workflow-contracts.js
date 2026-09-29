#!/usr/bin/env node
'use strict';

const { fail, parseArgs, rootFrom, workflows } = require('./_shared');

const HELP = `Usage: node analyze-workflow-contracts.js [repository-root] [--json]

Conservatively inspect .github/workflows/*.yml and *.yaml for names, push
branches/path filters, *FILE environment values, file/text-file/keyphrase inputs,
and relevant script literals. This is not a complete YAML parser.`;

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(HELP);
  const root = rootFrom(args._[0]);
  const data = workflows(root);
  if (args.json) return console.log(JSON.stringify({ root, workflows: data }, null, 2));
  console.log(`Workflow contract analysis: ${data.length} workflow(s)`);
  for (const item of data) {
    console.log(`\n${item.file}: ${item.name}`);
    console.log(`  push: ${item.push ? 'yes' : 'no'}; branches: ${item.branches.join(', ') || '(not resolved)'}`);
    console.log(`  paths: ${item.paths.join(', ') || (item.push ? '(all paths)' : '(none)')}`);
    if (item.pathsIgnore.length) console.log(`  paths-ignore: ${item.pathsIgnore.join(', ')}`);
    for (const env of item.envFiles) console.log(`  env contract: ${env.variable}=${env.value}`);
    for (const value of item.fileValues) console.log(`  file value: ${value}`);
    for (const value of item.textFileValues) console.log(`  text-file value: ${value}`);
    for (const file of item.directFiles) console.log(`  repository file: ${file}`);
    for (const key of item.keyphrases) console.log(`  keyphrase: ${key.file || '(unresolved file)'} -> ${key.phrase}`);
    for (const literal of item.scriptLiterals) console.log(`  script literal (line ${literal.line}): ${literal.value}`);
  }
  console.log('\nLimitations: indentation-based YAML subset; anchors, aliases, flow mappings, folded scalars, and expressions are not fully evaluated.');
  console.log('Treat these as conservative contract candidates, not exact GitHub Actions semantics.');
}

try { main(); } catch (error) { fail(error.message); }
