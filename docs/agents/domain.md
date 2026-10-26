# Domain Docs

## Glossary

Read the root [`GLOSSARY.md`](../../GLOSSARY.md) when exploring or changing
project behavior. Use its canonical terms in code, documentation, and discussion.

When a change introduces or changes a project-specific concept, update the
glossary in the same change. Review new domain nouns in behavior, data models,
APIs, and user-facing language. Add concepts whose meaning is specific to this
application; if the meaning is unclear, ask rather than inventing a definition.

Keep each entry to a one- or two-sentence definition of what the concept is.
Choose one canonical term and list meaningful synonyms under `_Avoid_`. Group
terms under headings when the glossary develops distinct areas. Keep technical
implementation details, general programming terms, feature specifications, and
unresolved ideas out of the glossary.

## Architecture decisions

Record a decision in `docs/adr/` only when it is hard to reverse, surprising
without context, and the result of a real trade-off. Create the directory when
the first decision needs recording.
