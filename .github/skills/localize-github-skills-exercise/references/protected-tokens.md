# Protected tokens

Protect these tokens and their occurrence counts:

- template expressions such as `{{ variable }}`
- GitHub expressions such as `${{ github.repository }}`
- Markdown link targets and image sources
- frontmatter keys
- technical inline-code tokens
- fenced-code language labels and fence counts
- workflow names, branch/path filters, `*FILE` values, repository file inputs,
  keyphrases, and relevant script literals

The manifest records zero-count categories too, so files without links or images
remain valid. Validation permits additions but fails when any protected token
occurs fewer times than in the manifest.

A manifest is a guardrail, not proof of correctness. Review moved tokens,
context-sensitive duplicates, HTML links, YAML constructs outside the supported
subset, and semantic changes manually. Store generated manifests in a
caller-selected working path, not inside this reusable skill.

