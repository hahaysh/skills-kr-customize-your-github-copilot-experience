#!/usr/bin/env node
'use strict';

const { fail, git, matchesPush, normalize, parseArgs, rootFrom, workflows } = require('./_shared');

const HELP = `Usage:
  node analyze-trigger-impact.js [repository-root] [--base REF] [--json]
  node analyze-trigger-impact.js [repository-root] --files PATH [PATH ...] [--json]

Without --files, combine changed files from git diff against --base (default
HEAD) with untracked, non-ignored files reported by git ls-files. This command
only models push path filters; it never runs workflows or GitHub CLI.`;

function main() {
  const args = parseArgs(process.argv.slice(2), ['base']);
  if (args.help) return console.log(HELP);
  let positional = [...args._];
  let rootArg;
  let files = [];
  if (args.files) {
    rootArg = positional.shift();
    files = positional;
    if (!files.length) throw new Error('--files requires one or more positional file paths after the repository root');
  } else {
    rootArg = positional.shift();
    if (positional.length) throw new Error('unexpected positional paths; use --files before explicit file paths');
  }
  const root = rootFrom(rootArg);
  if (!args.files) {
    const base = args.base || 'HEAD';
    const changed = git(root, ['diff', '--name-only', '--diff-filter=ACMRD', base, '--'])
      .split(/\r?\n/).filter(Boolean);
    const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '--'])
      .split(/\r?\n/).filter(Boolean);
    files = [...changed, ...untracked];
  }
  files = [...new Set(files.map(normalize))];
  const impacts = workflows(root).map(workflow => {
    const matchedFiles = files.filter(file => matchesPush(workflow, file));
    const risk = matchedFiles.length
      ? (workflow.paths.length === 0 ? 'critical' : 'high')
      : 'none';
    return { workflow: workflow.file, name: workflow.name, push: workflow.push, matchedFiles, risk };
  });
  const result = { root, base: args.base || 'HEAD', files, impacts };
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Trigger impact for ${files.length} changed file(s):`);
    if (!files.length) console.log('  No changed files found.');
    for (const item of impacts) {
      console.log(`- [${item.risk}] ${item.workflow} (${item.name})`);
      if (item.matchedFiles.length) console.log(`  matched: ${item.matchedFiles.join(', ')}`);
    }
    console.log('Static path-filter analysis only; no workflow or GitHub command was executed.');
  }
}

try { main(); } catch (error) { fail(error.message); }
