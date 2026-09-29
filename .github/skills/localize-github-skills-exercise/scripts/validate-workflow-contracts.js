#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  fail, git, normalize, parseArgs, parseWorkflow, rootFrom, workflows
} = require('./_shared');

const HELP = `Usage: node validate-workflow-contracts.js [repository-root] [--base REF] [--allow-workflow-changes]

Compare workflow files with --base (default HEAD), reject workflow changes unless
explicitly allowed, verify direct repository file references, and preserve
baseline keyphrases. Static validation only: no workflows or GitHub commands run.`;

function gitFile(root, ref, relative) {
  return git(root, ['show', `${ref}:${normalize(relative)}`]);
}

function main() {
  const args = parseArgs(process.argv.slice(2), ['base']);
  if (args.help) return console.log(HELP);
  const root = rootFrom(args._[0]);
  const base = args.base || 'HEAD';
  git(root, ['rev-parse', '--verify', `${base}^{commit}`]);

  const baselinePaths = git(root, ['ls-tree', '-r', '--name-only', base, '--', '.github/workflows'])
    .split(/\r?\n/).filter(value => /\.ya?ml$/i.test(value));
  const current = workflows(root);
  const currentByFile = new Map(current.map(item => [item.file, item]));
  const allWorkflowFiles = new Set([...baselinePaths.map(normalize), ...current.map(item => item.file)]);
  const modified = [];
  for (const relative of allWorkflowFiles) {
    const currentFile = path.join(root, ...relative.split('/'));
    const baselineExists = baselinePaths.map(normalize).includes(relative);
    const currentExists = fs.existsSync(currentFile);
    if (!baselineExists || !currentExists) {
      modified.push(relative);
      continue;
    }
    const baselineText = gitFile(root, base, relative).replace(/\r\n/g, '\n');
    const currentText = fs.readFileSync(currentFile, 'utf8').replace(/\r\n/g, '\n');
    if (baselineText !== currentText) modified.push(relative);
  }

  const errors = [];
  const reports = [];
  if (modified.length && !args['allow-workflow-changes']) {
    errors.push(`workflow files differ from ${base}: ${modified.join(', ')}`);
  } else if (modified.length) {
    reports.push(`Allowed workflow changes: ${modified.join(', ')}`);
  }

  for (const workflow of current) {
    for (const referenced of workflow.directFiles) {
      if (referenced.includes('${{')) continue;
      const target = path.resolve(root, ...normalize(referenced).split('/'));
      if (!fs.existsSync(target)) errors.push(`${workflow.file}: referenced repository file is missing: ${referenced}`);
    }
  }

  for (const relative of baselinePaths) {
    const baselineText = gitFile(root, base, relative);
    const baseline = parseWorkflow(path.join(root, ...relative.split('/')), root, baselineText);
    for (const contract of baseline.keyphrases) {
      if (!contract.file || contract.file.includes('${{')) {
        reports.push(`${baseline.file}:${contract.line}: keyphrase file could not be resolved for ${JSON.stringify(contract.phrase)}`);
        continue;
      }
      let baselineTarget = null;
      try { baselineTarget = gitFile(root, base, contract.file); }
      catch (error) {
        reports.push(`${baseline.file}:${contract.line}: baseline target absent for ${contract.file}; ${JSON.stringify(contract.phrase)} is an intentional/incomplete exercise candidate`);
      }
      const currentTargetPath = path.resolve(root, ...normalize(contract.file).split('/'));
      const currentTarget = fs.existsSync(currentTargetPath) ? fs.readFileSync(currentTargetPath, 'utf8') : null;
      const wasPresent = baselineTarget !== null && baselineTarget.includes(contract.phrase);
      const isPresent = currentTarget !== null && currentTarget.includes(contract.phrase);
      if (wasPresent && !isPresent) {
        errors.push(`${contract.file}: removed baseline keyphrase ${JSON.stringify(contract.phrase)} required by ${baseline.file}:${contract.line}`);
      } else if (!wasPresent && !isPresent) {
        reports.push(`${contract.file}: keyphrase ${JSON.stringify(contract.phrase)} absent in both baseline and current (reported only; exercises may start incomplete)`);
      }
    }
  }

  for (const report of reports) console.log(`INFO: ${report}`);
  if (errors.length) {
    for (const error of errors) console.error(`INVALID: ${error}`);
    throw new Error(`${errors.length} workflow contract validation error(s)`);
  }
  console.log(`Workflow contracts valid: ${currentByFile.size} current workflow(s), base ${base}.`);
  console.log('Static validation only; no workflow or GitHub command was executed.');
}

try { main(); } catch (error) { fail(error.message); }
