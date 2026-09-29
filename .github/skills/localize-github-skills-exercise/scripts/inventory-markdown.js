#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  fail, matchesPush, normalize, parseArgs, rootFrom, walk, workflows
} = require('./_shared');

const HELP = `Usage: node inventory-markdown.js [repository-root] [--json]

Enumerate Markdown files, infer their role, workflow references, push-path matches,
and localization risk. The repository root defaults to the current directory.`;

function role(file) {
  const value = normalize(file).toLowerCase();
  if (/(?:^|\/)steps?\//.test(value) || /(?:^|\/)\d+-step\.md$/.test(value)) return 'step';
  if (/(?:^|\/)assignments\//.test(value)) return 'assignment';
  if (/(?:^|\/)templates\//.test(value)) return 'template';
  if (value.startsWith('.github/skills/')) return 'skill';
  if (value.endsWith('.agent.md') || /(?:^|\/)agents\//.test(value)) return 'agent';
  if (value.endsWith('.instructions.md') || value.includes('copilot-instructions')) return 'instructions';
  if (path.basename(value) === 'readme.md') return 'readme';
  return 'other';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(HELP);
  const root = rootFrom(args._[0]);
  const workflowData = workflows(root);
  const records = walk(root, file => /\.md$/i.test(file)).map(file => {
    const relative = normalize(path.relative(root, file));
    const directReferences = workflowData
      .filter(workflow => workflow.directFiles.includes(relative) ||
        workflow.fileValues.includes(relative) ||
        workflow.textFileValues.includes(relative) ||
        workflow.envFiles.some(item => item.value === relative))
      .map(workflow => workflow.file);
    const pushMatches = workflowData.filter(workflow => matchesPush(workflow, relative))
      .map(workflow => workflow.file);
    const likelyRole = role(relative);
    const risk = directReferences.length ? 'critical'
      : pushMatches.length ? 'high'
        : ['step', 'template', 'skill', 'agent', 'instructions'].includes(likelyRole) ? 'medium' : 'low';
    return { file: relative, role: likelyRole, directReferences, pushMatches, risk };
  });
  if (args.json) console.log(JSON.stringify({ root, files: records }, null, 2));
  else {
    console.log(`Markdown inventory: ${records.length} file(s) under ${root}`);
    for (const item of records) {
      console.log(`- [${item.risk}] ${item.file} (${item.role})`);
      if (item.directReferences.length) console.log(`  direct workflow references: ${item.directReferences.join(', ')}`);
      if (item.pushMatches.length) console.log(`  matching push triggers: ${item.pushMatches.join(', ')}`);
    }
  }
}

try { main(); } catch (error) { fail(error.message); }
