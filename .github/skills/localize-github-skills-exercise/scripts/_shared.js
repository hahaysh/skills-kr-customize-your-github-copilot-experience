'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const IGNORED = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build']);

function fail(message) {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

function normalize(value) {
  return value.replace(/\\/g, '/').replace(/^\.\//, '');
}

function rootFrom(value) {
  const root = path.resolve(value || process.cwd());
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`repository root is not a directory: ${root}`);
  }
  return root;
}

function walk(root, predicate = () => true) {
  const results = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && predicate(absolute)) results.push(absolute);
    }
  }
  visit(root);
  return results.sort();
}

function readUtf8(file) {
  const buffer = fs.readFileSync(file);
  const text = buffer.toString('utf8');
  if (text.includes('\uFFFD')) throw new Error(`invalid or replacement UTF-8 character in ${file}`);
  return text;
}

function git(root, args, options = {}) {
  const probe = cp.spawnSync('git', ['-C', root, 'rev-parse', '--is-inside-work-tree'], {
    encoding: 'utf8'
  });
  if (probe.status !== 0 || probe.stdout.trim() !== 'true') {
    throw new Error(`Git operation requires a repository: ${root}`);
  }
  const result = cp.spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    ...options
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new Error(`git ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return result.stdout;
}

function stripYamlValue(value) {
  const trimmed = value.trim().replace(/\s+#.*$/, '').trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function indentation(line) {
  return (line.match(/^ */) || [''])[0].length;
}

function listUnder(lines, keyPattern, parentStart = 0, parentEnd = lines.length) {
  for (let i = parentStart; i < parentEnd; i++) {
    const match = lines[i].match(keyPattern);
    if (!match) continue;
    const base = indentation(lines[i]);
    const values = [];
    for (let j = i + 1; j < parentEnd; j++) {
      if (!lines[j].trim() || lines[j].trimStart().startsWith('#')) continue;
      const level = indentation(lines[j]);
      if (level <= base) break;
      const item = lines[j].trim().match(/^-\s+(.+)$/);
      if (item) values.push(stripYamlValue(item[1]));
    }
    return values;
  }
  return [];
}

function parseWorkflow(file, root, source) {
  const text = source === undefined ? readUtf8(file) : source;
  const lines = text.split(/\r?\n/);
  const relative = normalize(path.relative(root, file));
  const nameLine = lines.find(line => /^name:\s*/.test(line));
  const name = nameLine ? stripYamlValue(nameLine.replace(/^name:\s*/, '')) : path.basename(file);
  const onIndex = lines.findIndex(line => /^on:\s*(?:#.*)?$/.test(line));
  let push = false;
  let branches = [];
  let paths = [];
  let pathsIgnore = [];
  if (onIndex >= 0) {
    const onIndent = indentation(lines[onIndex]);
    let onEnd = lines.length;
    for (let i = onIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() && indentation(lines[i]) <= onIndent) { onEnd = i; break; }
    }
    const pushIndex = lines.findIndex((line, i) =>
      i > onIndex && i < onEnd && /^\s+push:\s*(?:#.*)?$/.test(line));
    if (pushIndex >= 0) {
      push = true;
      let pushEnd = onEnd;
      const pushIndent = indentation(lines[pushIndex]);
      for (let i = pushIndex + 1; i < onEnd; i++) {
        if (lines[i].trim() && indentation(lines[i]) <= pushIndent) { pushEnd = i; break; }
      }
      branches = listUnder(lines, /^\s+branches:\s*$/, pushIndex + 1, pushEnd);
      paths = listUnder(lines, /^\s+paths:\s*$/, pushIndex + 1, pushEnd);
      pathsIgnore = listUnder(lines, /^\s+paths-ignore:\s*$/, pushIndex + 1, pushEnd);
    }
  } else {
    const inlineOn = lines.find(line => /^on:\s*\S/.test(line));
    if (inlineOn) {
      const raw = inlineOn.replace(/^on:\s*/, '').replace(/\s+#.*$/, '').trim();
      const events = raw.startsWith('[') && raw.endsWith(']')
        ? raw.slice(1, -1).split(',').map(stripYamlValue)
        : [stripYamlValue(raw)];
      push = events.includes('push');
    }
  }

  const envFiles = [];
  const directFiles = [];
  const fileValues = [];
  const textFileValues = [];
  const keyphrases = [];
  const scriptLiterals = [];
  let currentTextFile = null;
  for (let i = 0; i < lines.length; i++) {
    let match = lines[i].match(/^\s*([A-Za-z_][A-Za-z0-9_]*FILE):\s*(.+)$/);
    if (match) {
      const value = stripYamlValue(match[2]);
      envFiles.push({ variable: match[1], value });
      if (!value.includes('${{')) directFiles.push(value);
    }
    match = lines[i].match(/^\s*(file|text-file):\s*(.+)$/);
    if (match) {
      const kind = match[1];
      const value = stripYamlValue(match[2]);
      (kind === 'file' ? fileValues : textFileValues).push(value);
      let stepAction = '';
      for (let j = i - 1; j >= 0 && !/^\s*-\s+name:/.test(lines[j]); j--) {
        const uses = lines[j].match(/^\s*uses:\s*(.+)$/);
        if (uses) { stepAction = stripYamlValue(uses[1]); break; }
      }
      const isExistenceProbe = /file-exists/i.test(stepAction);
      if (kind === 'file' && !isExistenceProbe &&
          !value.includes('${{') && !value.startsWith('exercise-toolkit/')) {
        directFiles.push(value);
      }
      currentTextFile = kind === 'text-file' ? value : null;
    }
    match = lines[i].match(/^\s*keyphrase:\s*(.+)$/);
    if (match) {
      keyphrases.push({ file: currentTextFile, phrase: stripYamlValue(match[1]), line: i + 1 });
    }
    const literalPatterns = [
      /fs\.(?:readFileSync|writeFileSync|existsSync)\(\s*['"`]([^'"`]+)['"`]/g,
      /gh\s+workflow\s+(?:enable|disable)\s+["']([^"']+)["']/g
    ];
    for (const pattern of literalPatterns) {
      let literal;
      while ((literal = pattern.exec(lines[i])) !== null) {
        scriptLiterals.push({ value: literal[1], line: i + 1 });
      }
    }
  }
  return {
    file: relative, name, push, branches, paths, pathsIgnore,
    envFiles, fileValues, textFileValues, directFiles: [...new Set(directFiles)],
    keyphrases, scriptLiterals,
    limitations: [
      'Indentation-based YAML subset only; anchors, aliases, flow mappings, folded scalars, and expressions are not fully evaluated.',
      'Reported contracts are conservative candidates, not an exact GitHub Actions semantic model.'
    ]
  };
}

function workflows(root) {
  const directory = path.join(root, '.github', 'workflows');
  if (!fs.existsSync(directory)) return [];
  return walk(directory, file => /\.ya?ml$/i.test(file)).map(file => parseWorkflow(file, root));
}

function globToRegExp(pattern) {
  let result = '^';
  const value = normalize(pattern);
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '*') {
      if (value[i + 1] === '*') {
        i++;
        if (value[i + 1] === '/') { i++; result += '(?:.*/)?'; }
        else result += '.*';
      } else result += '[^/]*';
    } else if (char === '?') result += '[^/]';
    else result += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`${result}$`);
}

function matchesPush(workflow, file) {
  if (!workflow.push) return false;
  const relative = normalize(file);
  const included = workflow.paths.length === 0 ||
    workflow.paths.some(pattern => globToRegExp(pattern).test(relative));
  const ignored = workflow.pathsIgnore.some(pattern => globToRegExp(pattern).test(relative));
  return included && !ignored;
}

function markdownTokens(text) {
  const links = [];
  const images = [];
  let fence = null;
  const prose = text.split(/\r?\n/).map(line => {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence && match) {
      fence = { marker: match[1][0], length: match[1].length };
      return '';
    }
    if (fence) {
      if (match && match[1][0] === fence.marker &&
          match[1].length >= fence.length && !match[2].trim()) fence = null;
      return '';
    }
    return line;
  }).join('\n');
  const linkPattern = /(!?)\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match;
  while ((match = linkPattern.exec(prose)) !== null) {
    (match[1] ? images : links).push(match[2]);
  }
  const definitions = new Map();
  const definitionPattern = /^ {0,3}\[([^\]]+)]:\s*(?:<([^>]+)>|(\S+))/gm;
  while ((match = definitionPattern.exec(prose)) !== null) {
    definitions.set(normalizeReferenceLabel(match[1]), match[2] || match[3]);
  }
  const imageLabels = referenceLabels(prose, true);
  const linkLabels = referenceLabels(prose, false);
  for (const [label, destination] of definitions) {
    const usedAsImage = imageLabels.has(label);
    const usedAsLink = linkLabels.has(label);
    if (usedAsImage) images.push(destination);
    if (usedAsLink || !usedAsImage) links.push(destination);
  }
  const templateExpressions = text.match(/\{\{[\s\S]*?\}\}/g) || [];
  const githubExpressions = text.match(/\$\{\{[\s\S]*?\}\}/g) || [];
  const inlineCode = [];
  const inlinePattern = /(?<!`)`([^`\r\n]+)`(?!`)/g;
  while ((match = inlinePattern.exec(text)) !== null) {
    const value = match[1].trim();
    if (!/\s/.test(value) || /[./\\${}:@=+*-]/.test(value)) inlineCode.push(match[1]);
  }
  const fences = [];
  const fencePattern = /^(?: {0,3})(`{3,}|~{3,})([^\r\n]*)$/gm;
  while ((match = fencePattern.exec(text)) !== null) {
    fences.push({ marker: match[1][0], length: match[1].length, language: match[2].trim().split(/\s+/)[0] || '' });
  }
  const frontmatterKeys = [];
  const lines = text.split(/\r?\n/);
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      for (const line of lines.slice(1, end)) {
        const key = line.match(/^([A-Za-z0-9_-]+):/);
        if (key) frontmatterKeys.push(key[1]);
      }
    }
  }
  return { templateExpressions, githubExpressions, links, images, frontmatterKeys, inlineCode, fences };
}

function normalizeReferenceLabel(label) {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

function referenceLabels(text, image) {
  const labels = new Set();
  const prefix = image ? '!' : '(?<!!)';
  const pattern = new RegExp(`${prefix}\\[([^\\]]*)\\]\\[([^\\]]*)\\]`, 'g');
  let match;
  while ((match = pattern.exec(text)) !== null) {
    labels.add(normalizeReferenceLabel(match[2] || match[1]));
  }
  if (image) {
    const shortcut = /!\[([^\]]+)](?![\[(])/g;
    while ((match = shortcut.exec(text)) !== null) {
      labels.add(normalizeReferenceLabel(match[1]));
    }
  }
  return labels;
}

function counts(values, serialize = value => typeof value === 'string' ? value : JSON.stringify(value)) {
  const result = {};
  for (const value of values) {
    const key = serialize(value);
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

function parseArgs(argv, valueOptions = []) {
  const options = { _: [] };
  const values = new Set(valueOptions);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) options._.push(arg);
    else {
      const [raw, inline] = arg.slice(2).split(/=(.*)/s, 2);
      if (values.has(raw)) {
        const value = inline !== undefined ? inline : argv[++i];
        if (value === undefined || value.startsWith('--')) throw new Error(`--${raw} requires a value`);
        options[raw] = value;
      } else options[raw] = true;
    }
  }
  return options;
}

module.exports = {
  counts, fail, git, globToRegExp, markdownTokens, matchesPush, normalize,
  parseArgs, parseWorkflow, readUtf8, rootFrom, walk, workflows
};
