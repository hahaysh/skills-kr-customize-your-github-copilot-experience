#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { fail, normalize, parseArgs, readUtf8, rootFrom, walk } = require('./_shared');

const HELP = `Usage: node validate-markdown.js [repository-root] [FILE ...]

Validate explicit repository-relative Markdown FILE paths, or every Markdown
file when no FILE is supplied. Checks UTF-8 readability, U+FFFD, frontmatter
delimiter pairing, and balanced fenced code blocks.`;

function validate(file, relative) {
  const errors = [];
  const text = readUtf8(file);
  const lines = text.split(/\r?\n/);
  if (lines[0] === '---' && !lines.slice(1).includes('---')) {
    errors.push('opening frontmatter delimiter has no closing delimiter');
  }
  if (lines[0] !== '---' && lines.findIndex(line => line === '---') === 1) {
    errors.push('closing frontmatter delimiter has no opening delimiter on line 1');
  }
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!match) continue;
    const marker = match[1][0];
    if (!fence) fence = { marker, length: match[1].length, line: i + 1 };
    else if (marker === fence.marker && match[1].length >= fence.length && !match[2].trim()) fence = null;
  }
  if (fence) errors.push(`unclosed ${fence.marker.repeat(fence.length)} fence opened on line ${fence.line}`);
  return errors.map(message => `${relative}: ${message}`);
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
  for (const file of files) {
    const relative = normalize(path.relative(root, file));
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      errors.push(`${relative}: file does not exist`);
      continue;
    }
    if (!/\.md$/i.test(file)) {
      errors.push(`${relative}: explicit path is not a Markdown file`);
      continue;
    }
    try { errors.push(...validate(file, relative)); }
    catch (error) { errors.push(`${relative}: ${error.message}`); }
  }
  if (errors.length) {
    for (const error of errors) console.error(`INVALID: ${error}`);
    throw new Error(`${errors.length} Markdown validation error(s)`);
  }
  console.log(`Markdown valid: ${files.length} file(s).`);
}

try { main(); } catch (error) { fail(error.message); }
