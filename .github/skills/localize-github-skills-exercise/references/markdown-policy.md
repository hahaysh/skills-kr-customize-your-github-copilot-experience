# Markdown policy

- Preserve heading levels, list nesting, blockquote depth, tables, task-list
  markers, HTML tags, comments, and details/summary structure.
- Preserve frontmatter delimiters, keys, scalar types, and machine-readable
  values. Translate only clearly human-facing values.
- Preserve fenced-code markers, fence count, language labels, and code content.
- Preserve inline-code tokens exactly unless they contain prose only and are
  proven not to be machine significant.
- Preserve link destinations and image sources; translate visible link text and
  alt text only.
- Preserve GitHub/Mustache expressions and placeholders byte-for-byte.
- Do not normalize intentional whitespace inside code or expressions.
- Keep files UTF-8 and never introduce U+FFFD.

Run `validate-markdown.js`, `validate-links.js`, and
`validate-protected-tokens.js` after editing.

