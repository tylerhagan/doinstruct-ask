# CLAUDE.md

**Read [`AGENTS.md`](AGENTS.md) first and completely. It is the rules file for
this repository and it wins over your training defaults.**

This file exists because Claude Code loads `CLAUDE.md` automatically. It is a
pointer, not a copy. Two files of rules become two versions of the rules, and
the one you are not reading is the one that is current.

## The short version, so you know what you are walking into

- **Svelte 5 runes and Tailwind v4.** Both post-date most training data, so the
  confident answer is usually the wrong one here. `runes: true` is forced, which
  makes Svelte 4 syntax a compile error rather than a warning.
- **Two registers.** The floor is a gloved hand under washdown glare; the office
  is a supervisor at a desk. Work out which one you are in before you write a
  class name. `scripts/check-register.mjs` fails the build if floor code uses an
  office token.
- **Never write a user-facing string in a component.** All copy goes through
  `t()` or `tOffice()`, in three languages, including `aria-label`.
- **No raw hex, no raw px, no arbitrary values.** Every value exists as a token.
- **Verification is one command:** `npm run check`. It runs the type checker,
  four rule checks and 51 tests. `npm run build` then `npm run check:budget`
  covers the bundle.

## What to load, and when

| Task                                           | Load                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ |
| Any code change                                | [`docs/rules/behaviour.md`](docs/rules/behaviour.md)         |
| Anything a person reads or hears               | [`docs/rules/content.md`](docs/rules/content.md)             |
| An interactive element, screen or state change | [`docs/rules/accessibility.md`](docs/rules/accessibility.md) |
| A chart, scale or stat tile                    | [`docs/rules/dataviz.md`](docs/rules/dataviz.md)             |

Load what the task needs rather than everything. A rules file long enough to
cover the whole system is a rules file that gets diluted halfway through a long
session, which is why they are split and why each has a stated trigger.

## If a check fails

Fix the code. **Never weaken the check.** If `check-contrast.mjs` reports 6.4:1
against a 7:1 minimum, darken the colour; do not lower the threshold. If
`check-i18n.mjs` finds a literal string, translate it; do not add the file to the
allow-list. These encode safety and accessibility commitments, and a check edited
to pass is worse than no check, because it now certifies something false.

If a rule genuinely blocks the task, stop and say so, with the reason. That is a
human decision.
