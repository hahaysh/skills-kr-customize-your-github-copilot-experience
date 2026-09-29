#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  counts, fail, markdownTokens, parseArgs, readUtf8, rootFrom, workflows
} = require('./_shared');

const HELP = `Usage: node validate-protected-tokens.js MANIFEST [repository-root]

Compare current Markdown token counts with a manifest. Additional tokens are
allowed; every protected token and count from the manifest must remain.`;

const TOKEN_FIELDS = [
  ['templateExpressions', 'template expressions'],
  ['githubExpressions', 'GitHub expressions'],
  ['linkTargets', 'link targets'],
  ['imageSources', 'image sources'],
  ['frontmatterKeys', 'frontmatter keys'],
  ['technicalInlineCode', 'technical inline-code tokens'],
  ['fencedCode', 'fenced-code language/count']
];

function contractTokens(contract) {
  return [
    `name:${contract.name}`,
    `push:${Boolean(contract.push)}`,
    ...(contract.branches || []).map(value => `branch:${value}`),
    ...(contract.paths || []).map(value => `path:${value}`),
    ...(contract.pathsIgnore || []).map(value => `paths-ignore:${value}`),
    ...(contract.envFiles || []).map(value => `env:${value.variable}=${value.value}`),
    ...(contract.fileValues || []).map(value => `file:${value}`),
    ...(contract.textFileValues || []).map(value => `text-file:${value}`),
    ...(contract.keyphrases || []).map(value => `keyphrase:${value.file || ''}=${value.phrase}`),
    ...(contract.scriptLiterals || []).map(value => `script:${value.value}`)
  ];
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(HELP);
  if (!args._[0]) throw new Error('MANIFEST path is required');
  const manifestPath = path.resolve(args._[0]);
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest not found: ${manifestPath}`);
  let manifest;
  try { manifest = JSON.parse(readUtf8(manifestPath)); }
  catch (error) { throw new Error(`invalid manifest JSON ${manifestPath}: ${error.message}`); }
  if (!manifest.files || typeof manifest.files !== 'object') throw new Error(`manifest has no files object: ${manifestPath}`);
  const root = rootFrom(args._[1]);
  const missing = [];
  for (const [relative, expected] of Object.entries(manifest.files)) {
    const file = path.resolve(root, relative);
    if (!fs.existsSync(file)) {
      missing.push(`${relative}: file is missing`);
      continue;
    }
    const tokens = markdownTokens(readUtf8(file));
    const actual = {
      templateExpressions: counts(tokens.templateExpressions),
      githubExpressions: counts(tokens.githubExpressions),
      linkTargets: counts(tokens.links),
      imageSources: counts(tokens.images),
      frontmatterKeys: counts(tokens.frontmatterKeys),
      technicalInlineCode: counts(tokens.inlineCode),
      fencedCode: counts(tokens.fences)
    };
    for (const [field, label] of TOKEN_FIELDS) {
      for (const [token, expectedCount] of Object.entries(expected[field] || {})) {
        const actualCount = actual[field][token] || 0;
        if (actualCount < expectedCount) {
          missing.push(`${relative}: ${label} ${JSON.stringify(token)} missing ${expectedCount - actualCount} occurrence(s) (expected ${expectedCount}, found ${actualCount})`);
        }
      }
    }
  }
  const currentWorkflows = new Map(workflows(root).map(item => [item.file, item]));
  for (const expected of manifest.workflowContracts || []) {
    const current = currentWorkflows.get(expected.file);
    if (!current) {
      missing.push(`${expected.file}: protected workflow is missing`);
      continue;
    }
    const expectedCounts = counts(contractTokens(expected));
    const actualCounts = counts(contractTokens(current));
    for (const [token, expectedCount] of Object.entries(expectedCounts)) {
      const actualCount = actualCounts[token] || 0;
      if (actualCount < expectedCount) {
        missing.push(`${expected.file}: workflow contract ${JSON.stringify(token)} missing ${expectedCount - actualCount} occurrence(s) (expected ${expectedCount}, found ${actualCount})`);
      }
    }
  }
  if (missing.length) {
    for (const item of missing) console.error(`MISSING: ${item}`);
    throw new Error(`${missing.length} protected-token requirement(s) failed`);
  }
  console.log(`Protected tokens valid for ${Object.keys(manifest.files).length} Markdown file(s) and ${(manifest.workflowContracts || []).length} workflow(s); additional tokens were permitted.`);
}

try { main(); } catch (error) { fail(error.message); }
