---
name: localize-github-skills-exercise
description: Safely localize Markdown content in a repository-based GitHub Skills exercise into Korean when the request involves translating exercise steps, assignments, templates, Copilot instruction/agent/skill files, or README content while preserving GitHub Actions triggers, checks, file contracts, and intentional learner-facing defects.
---

# Localize a GitHub Skills exercise

Preserve exercise behavior over translation completeness. A polished translation
that changes a trigger, checked phrase, path, expression, or expected defect is
incorrect.

## Required workflow

1. Inspect before editing. Inventory Markdown and inspect workflow contracts,
   trigger impact, protected tokens, and the policies in `references/`.
2. Identify intentional exercise defects (missing learner-created files,
   incomplete sections, placeholders, and checks expected to fail initially).
   Preserve them. Do not “helpfully” complete the exercise.
3. Create a protected-token manifest outside this skill directory. Translate only
   prose allowed by the policies. Keep paths, expressions, code, metadata keys,
   action inputs, keyphrases, and structural contracts unchanged unless the user
   explicitly requests a reviewed contract change.
4. Never push, commit, enable/disable a workflow, change workflow activation, or
   run GitHub/workflow commands automatically. Do not edit workflow files merely
   to make translated prose pass.
5. Run static validation first. Static checks inspect files and model contracts;
   they do not prove a workflow succeeds on GitHub.
6. Describe end-to-end validation separately. It requires an authorized human to
   commit/push in a disposable or intended repository and observe GitHub Actions.
   Never perform that step automatically.

## Exact CLI examples

Run from the repository to localize. Scripts accept an optional repository root;
use `.` explicitly for clarity.

```console
node .github/skills/localize-github-skills-exercise/scripts/inventory-markdown.js . --json
node .github/skills/localize-github-skills-exercise/scripts/analyze-workflow-contracts.js . --json
node .github/skills/localize-github-skills-exercise/scripts/analyze-trigger-impact.js . --base HEAD
node .github/skills/localize-github-skills-exercise/scripts/analyze-trigger-impact.js . --files README.md .github/steps/1-step.md
node .github/skills/localize-github-skills-exercise/scripts/extract-protected-tokens.js . --output .localization/protected-tokens.json
node .github/skills/localize-github-skills-exercise/scripts/validate-protected-tokens.js .localization/protected-tokens.json .
node .github/skills/localize-github-skills-exercise/scripts/validate-markdown.js .
node .github/skills/localize-github-skills-exercise/scripts/validate-markdown.js . README.md .github/steps/1-step.md
node .github/skills/localize-github-skills-exercise/scripts/validate-links.js .
node .github/skills/localize-github-skills-exercise/scripts/validate-links.js . README.md
node .github/skills/localize-github-skills-exercise/scripts/validate-workflow-contracts.js . --base HEAD
node .github/skills/localize-github-skills-exercise/scripts/validate-workflow-contracts.js . --base HEAD --allow-workflow-changes
```

Use `--allow-workflow-changes` only after an explicitly authorized workflow
change; it does not waive missing-file or keyphrase checks. Use `--help` on every
public script for its contract.

## Decision rules

- Read `references/workflow-safety.md` before touching content referenced by a
  workflow or matching a push path.
- Follow `references/protected-tokens.md` and
  `references/markdown-policy.md` while translating.
- Follow `references/translation-policy.md` and
  `references/terminology-ko.md` for Korean prose.
- Complete `references/validation-checklist.md` before reporting completion.
- If preservation and natural Korean conflict, preserve the contract and explain
  the untranslated token.
- Treat parser output as conservative. Review flagged YAML manually; the scripts
  deliberately do not claim full YAML semantics.

