## What changed, and why

<!-- One or two sentences. The why is the part that is hard to recover later. -->

## Register

- [ ] Floor (`src/lib/components/floor/`, `src/routes/+page.svelte`)
- [ ] Office (`src/lib/components/office/`, `src/routes/office/`)
- [ ] Shared (tokens, domain, state, i18n runtime)

## Definition of done

Copied from `AGENTS.md` so it is in front of a human at the moment it matters.
CI runs the first three; the rest are judgement.

- [ ] `npm run check` passes: 0 type errors, contrast, no literal text, tokens
      agree, no office tokens on the floor, tests green
- [ ] `npm run build` succeeds and `npm run check:budget` passes
- [ ] Any new copy exists in all three languages
- [ ] No raw hex, no raw px, no arbitrary Tailwind values
- [ ] Targets meet the register's floor: 64px and 12px apart on the floor,
      36px and 8px apart in the office
- [ ] A new colour was added to `tokens.css` **and** documented in `tokens.json`
      with the reason. Both or neither.
- [ ] No new runtime dependency
- [ ] A new pure function that encodes a rule has a test beside it

## Anything a check could have caught but did not

<!-- This project's recurring failure is rules that live in prose. If you found
     something by eye that a check should own, say so here rather than fixing it
     quietly; that is how the check list grew from two to five. -->
