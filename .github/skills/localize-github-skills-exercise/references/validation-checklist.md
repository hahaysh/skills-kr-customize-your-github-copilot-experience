# Validation checklist

## Before editing

- [ ] Inventory Markdown roles, workflow references, path-trigger matches, risks.
- [ ] Analyze workflow contracts and manually review parser limitations.
- [ ] Identify intentional missing/incomplete learner artifacts.
- [ ] Extract a protected-token manifest outside the skill.

## After editing

- [ ] Validate protected-token counts.
- [ ] Validate Markdown structure and UTF-8.
- [ ] Validate local relative links and images.
- [ ] Analyze trigger impact for changed files.
- [ ] Validate workflow files against the chosen base.
- [ ] Review `git diff` to confirm only requested prose changed.
- [ ] Confirm intentional defects remain and no solutions were introduced.
- [ ] Confirm no workflow activation, commit, push, or GitHub command occurred.

## Reporting

State which checks passed, failed, or only reported intentional incompleteness.
Call all script results **static validation**. If end-to-end validation is
needed, state that an authorized human must push and observe GitHub Actions;
never imply static checks exercised GitHub-hosted behavior.

