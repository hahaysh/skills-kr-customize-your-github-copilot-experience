#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { fail, normalize, parseArgs, readUtf8, rootFrom, walk } = require('./_shared');

const HELP = `Usage: node validate-links.js [repository-root] [FILE ...]

Verify local relative Markdown links and image sources in explicit FILE paths,
or all Markdown files. URLs, mailto:, vscode:, anchors, absolute paths, and
template expressions are skipped. Fenced examples are ignored. Directories are
valid targets; relative targets outside the repository are reported as
unverifiable rather than broken.`;

function withoutFencedCode(text) {
  let fence = null;
  return text.split(/\r?\n/).map(line => {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence && match) {
      fence = { marker: match[1][0], length: match[1].length };
      return '';
    }
    if (fence) {
      if (match && match[1][0] === fence.marker &&
          match[1].length >= fence.length && !match[2].trim()) {
        fence = null;
      }
      return '';
    }
    return line;
  }).join('\n');
}

function targets(text) {
  text = withoutFencedCode(text);
  const values = [];
  const inline = /!?\[[^\]]*]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
  const definitions = /^\s*\[[^\]]+]:\s*(<[^>]+>|\S+)/gm;
  let match;
  while ((match = inline.exec(text)) !== null) values.push(match[1]);
  while ((match = definitions.exec(text)) !== null) values.push(match[1]);
  return values;
}

function isSkipped(target) {
  return !target || target.startsWith('#') || target.startsWith('/') ||
    /^[A-Za-z]:[\\/]/.test(target) ||
    /^(?:https?:|mailto:|vscode:|data:|tel:)/i.test(target) ||
    /\$\{\{|\{\{/.test(target);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(HELP);
  const positional = [...args._];
  const root = rootFrom(positional.shift());
  const files = positional.length
    ? positional.map(value => path.resolve(root, value))
    : walk(root, file => /\.md$/i.test(file));
  const errors = [];
  let checked = 0;
  let skippedOutside = 0;
  for (const file of files) {
    const relative = normalize(path.relative(root, file));
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      errors.push(`${relative}: Markdown source does not exist`);
      continue;
    }
    for (let target of targets(readUtf8(file))) {
      target = target.replace(/^<|>$/g, '');
      if (isSkipped(target)) continue;
      const withoutFragment = target.split('#', 1)[0].split('?', 1)[0];
      if (!withoutFragment) continue;
      let decoded;
      try { decoded = decodeURIComponent(withoutFragment); }
      catch (error) {
        errors.push(`${relative}: invalid URL encoding in ${JSON.stringify(target)} (${error.message})`);
        continue;
      }
      const resolved = path.resolve(path.dirname(file), decoded.replace(/\//g, path.sep));
      const fromRoot = path.relative(root, resolved);
      if (fromRoot === '..' || fromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(fromRoot)) {
        skippedOutside++;
        console.log(`SKIPPED: ${relative}: ${JSON.stringify(target)} resolves outside the repository and is unverifiable locally`);
        continue;
      }
      checked++;
      if (!fs.existsSync(resolved)) {
        errors.push(`${relative}: missing target ${JSON.stringify(target)} -> ${normalize(path.relative(root, resolved))}`);
      }
    }
  }
  if (skippedOutside) {
    console.log(`Skipped as unverifiable: ${skippedOutside} target(s) resolving outside ${root}.`);
  }
  if (errors.length) {
    for (const error of errors) console.error(`BROKEN: ${error}`);
    throw new Error(`${errors.length} local link validation error(s)`);
  }
  console.log(`Local links valid: ${checked} in-repository target(s) across ${files.length} Markdown file(s); ${skippedOutside} outside target(s) skipped.`);
}

try { main(); } catch (error) { fail(error.message); }
