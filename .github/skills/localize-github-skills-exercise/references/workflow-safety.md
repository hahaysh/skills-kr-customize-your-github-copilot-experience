# Workflow safety

GitHub Skills repositories commonly use Mona or `skills/exercise-toolkit`
workflows to post Markdown, detect learner changes, search for exact phrases, and
advance steps. Translation can silently break these contracts.

Before editing:

1. Run workflow-contract analysis.
2. Note Markdown files referenced through `*FILE`, `file`, and `text-file`.
3. Note exact `keyphrase` values and script literals.
4. Run trigger-impact analysis for proposed files.
5. Inspect the workflow manually when the parser reports uncertainty.

Never automatically edit `on`, `push`, `branches`, `paths`, `paths-ignore`,
workflow names, action versions, permissions, conditions, activation commands,
or checked values. Never run `gh workflow enable`, `gh workflow disable`, commit,
or push.

Static validation checks repository state and conservative extracted contracts.
It cannot validate permissions, event payloads, reusable workflows, marketplace
actions, or GitHub runtime behavior. End-to-end validation is a separate,
human-authorized push and Actions observation.

