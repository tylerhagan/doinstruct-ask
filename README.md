# doinstruct Ask

A worker scans the machine and asks. When no manual has the answer, it reaches
the person who does, and their reply becomes something the assistant can answer
forever after.

Two surfaces of one product: **the floor**, a worker's phone at a stopped
machine, and **the office**, a shift lead's desk. Case study for the Design
Engineer role, built in doinstruct's own stack: SvelteKit 2, Svelte 5 runes,
Tailwind v4, TypeScript, fully static.

**[Read the case study](docs/writeup.html)** for the argument. This file is for
getting the repository running and knowing where things are.

## Run it

```bash
nvm use            # Node 22, pinned in .nvmrc
npm install
npm run dev        # floor at /, office at /office, design system at /system
```

```bash
npm run check         # types, 4 rule checks, 51 tests. Must be 0 errors.
npm run build         # static output
npm run check:budget  # what the floor route actually costs a worker
npm run lint          # prettier
```

CI runs all of that on every push and pull request. The checks are this
project's argument, so leaving them as something you opt into locally would have
undercut it.

## The five minutes that matter

The product's whole claim is that a supervisor answers once and the assistant
answers it forever after. It is wired, not described, and it is worth seeing:

1. Open `/`, choose a language, and press **Demo** at the bottom right.
2. Pick the third scenario, **Not in any manual**, and ask. It escalates.
3. Follow the **See the loop close** link in that panel. The question is in the
   queue, marked "just arrived".
4. Answer it and publish.
5. Go back and ask the same question again. It is answered instantly, with the
   shift lead's name and an audit reference, and no second escalation.

Stay in the same tab. It is one state object read from both surfaces, so a full
page reload resets it. `src/lib/state/exchange.svelte.ts` is the whole wire.

Other things worth trying: `/?asset=AST-1180` is a different machine,
`/?asset=AST-9999` is a sticker that outlived its machine, and the **Contrast**
control is a lighting condition rather than a preference.

## Working here with an AI tool

Read [`AGENTS.md`](AGENTS.md). It is the main deliverable rather than
documentation about one, and it wins over a model's training defaults.

[`CLAUDE.md`](CLAUDE.md) and [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc)
exist because Claude Code and Cursor load those paths automatically. Both are
**pointers, not copies**: two files of rules become two versions of the rules,
and the one you are not reading is the one that is current.

The short version of why this repository needs a rules file at all: Svelte 5
runes and Tailwind v4 both post-date the training data most models learned from,
so an unconstrained agent writes confident, plausible, wrong code here. That is
a rules problem, and rules are fixable.

## Where to look

| Path                                                         | What it covers                                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [`AGENTS.md`](AGENTS.md)                                     | Stack traps, the two registers, ten non-negotiables, and an index of when to load the rest |
| [`docs/rules/behaviour.md`](docs/rules/behaviour.md)         | How to work here. Dependency rule, never weaken a check, don't invent to fill a gap        |
| [`docs/rules/content.md`](docs/rules/content.md)             | Copy, interpolation, locked safety terminology, reading level, locale formatting           |
| [`docs/rules/accessibility.md`](docs/rules/accessibility.md) | Target sizing, focus, headings, live regions, logical properties, the four states          |
| [`docs/rules/dataviz.md`](docs/rules/dataviz.md)             | Which chart form, which colour set, marks, and what a chart here may not show              |
| [`docs/office-surface.md`](docs/office-surface.md)           | The supervisor surface: research, the surveillance boundary, the information architecture  |
| [`docs/decision-log.md`](docs/decision-log.md)               | Every decision that changed, and why. D1 to D23                                            |
| [`docs/handover-proof.md`](docs/handover-proof.md)           | Three prompts run, one **cold**, with an audit of what the agent got wrong                 |
| [`docs/frontline-reality.md`](docs/frontline-reality.md)     | Low-end devices, noise, gloves, languages, literacy, lighting                              |
| [`src/lib/design/tokens.json`](src/lib/design/tokens.json)   | Tokens, with the reasoning for every divergence                                            |
| `/system` route                                              | Both registers, every component, every state                                               |

### The checks, and what each one caught

| Script                                             | Rule it enforces                        | Found                                                                 |
| -------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| [`check-contrast.mjs`](scripts/check-contrast.mjs) | 7:1 text, 3:1 marks, ordered scales     | 5 colour pairs below the floor I had written                          |
| [`check-i18n.mjs`](scripts/check-i18n.mjs)         | No literal user-facing text             | 4 German `aria-label` values                                          |
| [`check-tokens.mjs`](scripts/check-tokens.mjs)     | `tokens.json` and `tokens.css` agree    | 11 of 18 colours stale in the file calling itself the source of truth |
| [`check-register.mjs`](scripts/check-register.mjs) | The floor may never use an office token | Nothing yet. Tested by injecting a violation                          |
| [`check-budget.mjs`](scripts/check-budget.mjs)     | The floor route's gzipped cost          | Guards a number the writeup claims                                    |

## How it is laid out

Layer first under `$lib`, with the register as a subfolder wherever a layer has
one. This is the ordinary SvelteKit shape rather than anything invented here, so
a SvelteKit engineer can find things on the first try.

```
src/lib/design/     tokens.json (intent) and tokens.css (@theme)
src/lib/domain/     types.ts (shared), office.ts (+ the suppression rule)
src/lib/data/       floor.ts, office.ts, assets.ts   fixtures
src/lib/i18n/       floor.ts → t(), office.ts → tOffice()
src/lib/state/      session, office, exchange        all .svelte.ts runes
src/lib/components/ floor/ and office/               contracts in each header
src/routes/         / floor, /office, /system
scripts/            the five checks
```

Tests sit beside the code they test as `*.test.ts`, and cover the pure functions
that encode a rule: suppression, the wait formatter, dictionary parity, and the
loop.

## What is real and what is a fixture

Worth being exact, because it is the first thing a team taking this on needs.

**Real:** the two surfaces and the wire between them, the design system and its
five checks, the i18n layer in three languages, the QR resolution from the URL,
the contrast mode, the recognition path including the level meter and the
measured noise floor.

**Fixtures:** retrieval, the queue's history, the coverage counts and the
knowledge record. There is no server. Faking a RAG pipeline would have taught a
reviewer nothing, and the honest gap is more useful than a convincing mock.

The seams a backend would attach to are `src/lib/data/*` for content and
`src/lib/state/exchange.svelte.ts` for the loop. Nothing else knows where the
data comes from.

## On the brand

The palette uses doinstruct's exact swatch values, read from their production
stylesheet rather than estimated by eye. Two needed adjusting for this context
and both are recorded in `tokens.json` with the reasoning:
`--swatch--mid-green` measures 4.6:1 on the off-white and `--swatch--light-green`
measures 1.65:1, which is invisible as a structural border. Good marketing
values, neither of which survives washdown glare. Darkened, hue kept.

The accent is called yellow here because that is what doinstruct's own system
calls it.

Manrope is self-hosted, subset and declared `font-display: optional`, so it never
blocks paint and never swaps. The first edition of this shipped no webfont at
all, which was the right instinct and cost the product its voice; the reasoning
for the reversal is in the case study.

## Not licensed for reuse

This is a case study written for doinstruct, using their brand values and
referencing their published material. The code is here to be read and run, not
to be lifted. Manrope is under the SIL Open Font License; see
[`static/fonts/README.md`](static/fonts/README.md).
