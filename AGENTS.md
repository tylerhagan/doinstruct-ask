# AGENTS.md

Rules for any AI agent working in this repository. Read this file completely
before writing code. If a rule here conflicts with your training defaults, this
file wins.

This is the deliverable rather than documentation about the deliverable. The
claim it makes is testable: an engineer who has never seen this codebase should
be able to change the flow and the screens with two or three prompts and ship,
with a human doing only final polish. `docs/handover-proof.md` is the receipt,
including the part the agent got wrong.

---

## 1. Why this file is the important artifact

doinstruct's goal is agents producing more than 95% good UI. In **this** stack
that goal currently fails, and it fails for a specific, diagnosable reason.

Svelte 5 (runes) shipped in late 2024 and Tailwind v4 (CSS-first config) in early 2025. Both replaced the APIs that dominate every model's training data. Left
unconstrained, an agent writes confident, plausible, **wrong** code: Svelte 4
stores and `export let`, and a `tailwind.config.js` that this project does not
have and will silently ignore.

So the gap is not that agents are bad at UI. It is that they are good at the
_previous_ version of this stack. That is fixable with rules, and the rules start
here.

---

## 2. Stack, exact versions

| Thing      | Version | Consequence                                                                                                               |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Svelte     | 5.56    | Runes only. `runes: true` is forced in `vite.config.ts`, so Svelte 4 syntax is a **compile error** rather than a warning. |
| SvelteKit  | 2.63    | `adapter-static`. Everything prerenders. No server, no API routes.                                                        |
| Tailwind   | 4.3     | CSS-first. The theme lives in `src/lib/design/tokens.css` under `@theme`.                                                 |
| TypeScript | 6.0     | Strict. `npm run check` must report 0 errors.                                                                             |

---

## 3. Svelte 5, not Svelte 4

The single highest-value section in this file. Each row is a Svelte 4 pattern
that models reproduce confidently because it dominated their training data, and
that this project's compiler rejects.

| Never write                     | Always write                               |
| ------------------------------- | ------------------------------------------ |
| `export let foo`                | `let { foo }: Props = $props()`            |
| `let x = 0` (reactive)          | `let x = $state(0)`                        |
| `$: doubled = x * 2`            | `const doubled = $derived(x * 2)`          |
| `$: { sideEffect() }`           | `$effect(() => { sideEffect() })`          |
| `writable()` / `$store`         | `$state` in a `.svelte.ts` class           |
| `on:click={fn}`                 | `onclick={fn}`                             |
| `createEventDispatcher`         | callback props such as `onstart`, `onstop` |
| `<slot />`                      | `{@render children()}` with `Snippet`      |
| `export let value` plus `bind:` | `$bindable()`                              |

Two more that are easy to miss:

1. Multi-statement derivations use `$derived.by(() => { … })`, not
   `$derived(() => …)`. The second form assigns the _function_, and the bug is
   silent.
2. Reassign to trigger reactivity on collections. `set.add(x)` does not notify,
   whereas `set = new Set([...set, x])` does. See `StepList.svelte`.

---

## 4. Tailwind v4, not v3

- There is **no `tailwind.config.js`**. Creating one does nothing. The theme is
  `@theme { … }` in `src/lib/design/tokens.css`.
- Never write a raw hex value, a raw px size, or an arbitrary value such as
  `p-[13px]` or `text-[#333]`. Every value you need already exists as a token.
- **Namespaces overlap, so never give two tokens the same name.** `max-w-*`
  resolves against `--container-*` but falls back to `--spacing-*`. Defining both
  `--container-device` and `--spacing-device` makes `max-w-device` silently pick
  the spacing value, build clean, and render at the wrong size. This happened
  here; the tokens are now `--container-device` and `--spacing-frame`.
- **Never use a bare radius utility.** `rounded`, `rounded-t` and `rounded-b`
  resolve to Tailwind's own 0.25rem rather than to this system, because the theme
  defines `--radius-sm/md/lg/xl` but no bare `--radius`. Always name the step:
  `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` or `rounded-full`.
- **A rounded container must clip its children.** Add `overflow-hidden` whenever
  a child carries its own background or border, or the child's corners will sit
  outside the parent's radius. This has bitten the project twice, on the device
  frame and on the colour swatches, and both times it compiled clean.
- **Never add a blanket rule under `[data-contrast='high']`.** Preflight sets
  `border: 0 solid` on every element, so `[data-contrast='high'] * {
border-width: 2px }` hands a visible border to every div and paragraph on the
  page. High contrast works through the token overrides alone.

---

## 5. The non-negotiables

**First, work out which register you are in.** The system has two, and half the
rules below change between them.

|            | **Floor**                                              | **Office**                                         |
| ---------- | ------------------------------------------------------ | -------------------------------------------------- |
| Who        | A worker on the line                                   | A shift lead or QHSE manager                       |
| Where      | Own phone, or a shared terminal in a hygiene zone      | A desk, a monitor, a mouse                         |
| Conditions | Gloves, 85-95 dB, washdown glare to dim cold store     | Normal light, seated, both hands                   |
| Lives in   | `src/lib/components/floor/`, `src/routes/+page.svelte` | `src/lib/components/office/`, `src/routes/office/` |
| Gets       | 64px targets, 18px floor, no shadows, no charts        | 36px controls, 16px floor, elevation, charts       |

The office may use anything the floor uses. **The floor may never use an office
token**, and that asymmetry is enforced by `scripts/check-register.mjs`, not by
good intentions. A 36px control is unhittable through a cut-resistant glove, a
shadow is invisible under washdown lighting and gone entirely when a customer
prints a screen to a laminated card, and chart marks are 3:1 where the floor
holds everything to 7:1.

What does **not** fork: the 7:1 text floor, focus treatment, `t()`, "never colour
alone", and "never truncate". Density is an environment decision. Accessibility
is not, and the office does not get a thinner focus ring for looking tidier.

These apply to every task. They encode safety and accessibility rather than
taste, so breaking one is a defect even if the result looks fine.

1. **On the floor, nothing interactive is below 64px** (`min-h-tap`), 96px for
   push-to-talk. Gloves, not fingertips. **In the office**, 36px
   (`min-h-control`) for controls and 56px (`min-h-row`) for rows.
2. **On the floor, instructions and answer content are never below 18px**
   (`text-body`). Supporting labels may use 16px (`text-small`). 14px
   (`text-meta`) is reserved for timestamps and audit references and nothing
   else, so never a status, never a name, never an instruction. **In the
   office** the floor drops one step: 16px is body text and 14px is legitimate
   for table cells, axis labels and legends. One scale, two floors. Do not add
   office-only type tokens. (This rule previously said "no text below 18px",
   which contradicted `tokens.json`, where `text-small` exists for labels. A cold
   agent run exposed the disagreement; see `docs/handover-proof.md`.)
3. **Yellow appears exactly once per screen**, on the primary voice action. It is
   1.1:1 against cream, so it is never a chart mark and never carries text.
4. **Red (`stop`) is reserved for safety.** Never for validation errors, never
   for "delete", never as a chart series. A worker must be able to trust that red
   means stop working.
5. **No shadows on the floor.** Hierarchy comes from border and surface colour,
   because shadows are invisible under washdown lighting. The office has
   `shadow-raised` and `shadow-overlay`, and both vanish at high contrast, so a
   shadow may never be the only thing marking a boundary.
6. **All copy goes through `t()`**, in all three languages, including
   `aria-label`, and including every axis label and tooltip. Enforced by
   `scripts/check-i18n.mjs`.
7. **Never truncate.** Wrap instead. German compounds and Romanian diacritics
   both overflow, and a truncated safety instruction is a hazard.
8. **Every answer carries provenance.** New answer surfaces render `SourceChip`.
9. **Nothing animates position, and nothing exceeds 200ms.**
10. **No chart resolves to an individual**, and no combination of filters may
    either. Buckets below five events read "too few to show". The reasoning is in
    `docs/office-surface.md` and it is a legal boundary in Germany, not only an
    ethical one.

---

## 6. The other rule files, and when to load them

Kept separate on purpose. A rules file long enough to cover everything is a rules
file that gets skimmed by humans and diluted in a long agent session, so load
what the task needs.

| File                                                         | Load it when                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/rules/behaviour.md`](docs/rules/behaviour.md)         | **Any task that changes code.** Dependency lock, never weaken a check, do not invent to fill a gap, stay inside the task.                                                                                                             |
| [`docs/rules/content.md`](docs/rules/content.md)             | The task adds or changes **any text a worker reads or hears.** Interpolation, locked safety terminology, reading level, locale formatting.                                                                                            |
| [`docs/rules/accessibility.md`](docs/rules/accessibility.md) | The task adds an **interactive element, a screen, or a state transition.** Target spacing, focus management, live regions, logical properties, the four required states.                                                              |
| [`docs/rules/dataviz.md`](docs/rules/dataviz.md)             | The task renders **a chart, a scale, or a stat tile.** Load it before choosing a chart type and long before choosing a colour. Which form, which colour set, the all-pairs cap, marks, and what a chart in this product may not show. |

If you are unsure which applies, load `behaviour.md` and ask.

---

## 7. Where things live

Layer first under `$lib`, with the **register as a subfolder** wherever a layer
has one. This is the ordinary SvelteKit shape rather than anything invented for
this project, so a SvelteKit engineer can find things on the first try. Screen
specific components colocate with their route; only shared or reusable ones
reach `$lib`.

```
src/app.css                       Tailwind entry. Imported once by +layout.svelte.
src/lib/
  design/tokens.json              INTENT: the reasoning behind every value
  design/tokens.css               @theme: the utility classes you may use
  domain/types.ts                 Shared domain model. Add fields here first.
  domain/office.ts                Office model, plus the suppression rule
  data/floor.ts                   Device scenarios
  data/office.ts                  Queue, coverage and knowledge fixtures
  data/assets.ts                  Asset register, and QR URL resolution
  i18n/floor.ts                   t()       floor copy, three languages
  i18n/office.ts                  tOffice() office copy, falls back to floor
  state/session.svelte.ts         Shared: language, contrast, machine context
  state/office.svelte.ts          Office: view, filters, selection, draft
  state/exchange.svelte.ts        THE LOOP. The only module both registers import.
  voice/recognition.svelte.ts     Mic, level metering, scripted fallback
  components/floor/*.svelte       Device register. 64px, 18px, no shadows.
  components/office/*.svelte      Desk register. 36px, 16px, elevation, charts.
src/routes/
  +page.svelte                    Floor: the whole flow state machine
  office/+layout.svelte           Office shell and navigation
  office/+page.svelte             Queue, and the answer composer
  office/coverage/+page.svelte    Where the documentation runs out
  office/knowledge/+page.svelte   What the assistant can answer now
  system/+page.svelte             Design system gallery. Read this first.
scripts/check-contrast.mjs        Contrast rules and the chart palette, enforced
scripts/check-i18n.mjs            The no-literal-text rule, enforced
scripts/check-tokens.mjs          tokens.json and tokens.css must agree, enforced
scripts/check-register.mjs        No office tokens on the floor, enforced
scripts/check-budget.mjs          The floor route's gzipped cost, enforced
scripts/generate-labels.mjs       Build time only. Writes the QR label SVGs.
```

**Tests sit beside the code they test**, as `*.test.ts`. They cover the pure
functions that encode a rule, namely suppression, the wait formatter, dictionary
parity and the loop, because those are the places where a silent change is both
easy and consequential. Rendering is not tested: four build checks and the type
checker already cover it, and mounting components would cost three dependencies
to assert what is already asserted.

**Why there are five check scripts and not a paragraph of prose.** Every rule in
this project that lived only in a document has eventually been broken, usually by
me, and every one of those breakages was found by a human looking at the running
product rather than by anything automated. The high-contrast border rule, the
token namespace collision, the rounded frame that did not clip, documentation
shipping CSS, and an unlabelled contrast icon. Then `tokens.json` drifted until
eleven of its eighteen colours were stale while its own header still called it
the source of truth. A rule that nothing tests is a rule with a half life. Each
script above is a rule that used to be a sentence.

**The architectural rule that makes prompting predictable:** components are dumb
about **flow state**. They render props and report gestures, and the state
machine lives only in `+page.svelte`. That is why "change the flow" touches one
file, "restyle the answer" touches another, and neither breaks the other.

They are not dumb about locale. Any component calling `t()` reads `session`, and
`SourceChip` reads it directly to detect a translated source. That is deliberate,
and worth stating precisely rather than claiming a purity the code does not have.

---

## 8. Where the fixtures end

The first question anyone inheriting this asks, so it is answered here rather
than discovered.

**Real:** both surfaces and the wire between them, the design system and its five
checks, the i18n layer, QR resolution from the URL, contrast mode, and the
recognition path including the level meter and the measured noise floor.

**Fixtures:** retrieval, the queue's history, the coverage counts, the knowledge
record. There is no server and nothing is persisted; a reload is a fresh start.

**The seams, and there are only two.** Content comes from `src/lib/data/*` and
the loop runs through `src/lib/state/exchange.svelte.ts`. Nothing else in the
codebase knows where data comes from, which is deliberate: components are dumb
about flow state and dumber still about transport.

Attaching a backend means replacing those two and nothing else. `exchange` is
already shaped like the API it would call: `ask()` posts an escalation,
`publish()` writes a knowledge entry, `answerFor()` is a read. Make them async
and the components do not change.

**What must survive that swap**, because it is the argument rather than the
implementation:

- Suppression stays in the data layer, applied once, before a component sees a
  count. A component cannot leak what it was never given.
- Nothing accumulates against a person. The queue's asker carries a name and a
  role, and the test suite fails if a third field appears.
- `Localised` and `Identifier` stay distinct in the domain model. A real backend
  will want to send one string; it must not.

---

## 9. Component inventory

Full contracts sit in the header comment of each file. Read that header before
modifying a component. Both registers are rendered in every state at `/system`,
which is faster than reading this table.

**Floor register.**

| Component           | Purpose                                    | Key props                                               |
| ------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `Button`            | The only interactive primitive             | `variant`, `size`, `full`                               |
| `PushToTalk`        | Primary voice action, hold to talk         | `state`, `label`, `level`, `noisy`, `onstart`, `onstop` |
| `LevelMeter`        | Proof the mic hears you in a loud room     | `level`, `noisy`                                        |
| `TranscriptConfirm` | "This is what I heard", before acting      | `text`, `uncertain`, `onconfirm`, `onretry`, `ontype`   |
| `AnswerCard`        | Grounded answer, or honest refusal         | `answer`, `speaking`, `onread`, `onnothelp`             |
| `StepList`          | Procedure with persistent tick-off         | `steps`, `oncomplete`                                   |
| `SourceChip`        | Provenance, with document age              | `source`, `onopen`                                      |
| `SafetyBanner`      | Caution and stop                           | `level`                                                 |
| `EscalationCard`    | The miss, then a named human, then capture | `escalation`, `onnotify`, `oncapture`                   |
| `StatusBar`         | Machine context, language, contrast        | reads `session`                                         |
| `DemoPanel`         | Reviewer controls. **Delete to ship.**     | `scenarioId`, `onreset`                                 |

---

## 10. Prompts that work

Copy and paste. The first two were run against this repo and the results,
including what the agent got wrong, are in `docs/handover-proof.md`. The third
follows the same shape but has not been run.

**Add a step to a procedure**

> In `src/lib/data/floor.ts`, add a sixth step to the `sourced` scenario:
> log the seal replacement in the shift book. Translate it into all three
> languages. Then run `npm run check`.

**Add a new screen to the flow**

> Add a `handover` phase to the state machine in `src/routes/+page.svelte`,
> entered from the answer screen via a new "Für die nächste Schicht notieren"
> button. It shows the answer summary and a confirm button, then returns to
> standby. Follow AGENTS.md and docs/rules/content.md: use existing components
> and tokens, and add all copy to `src/lib/i18n/floor.ts` in three languages.
> Run `npm run check`.

**Restyle a component**

> Restyle `EscalationCard` so the responder's name and expected wait are the
> dominant elements and the explanatory text is secondary. Use token classes
> only, no raw values, and keep every existing prop and aria attribute. Run
> `npm run check`.

**What makes these work:** they name the file, state the intent, point at the
rules, and end with the verification command. A prompt without a verification
step is a prompt whose output nobody checked.

---

## 11. Definition of done

1. `npm run check` passes: 0 type errors, all contrast checks, no literal text,
   tokens agree, no office tokens on the floor.
2. `npm run build` succeeds.
3. Any new copy exists in all three languages.
4. No raw hex, no raw px, no arbitrary Tailwind values.
5. Targets meet the register's floor: 64px and 12px apart on the floor, 36px and
   8px apart in the office.
6. Yellow still appears at most once per screen.
7. A new colour was added to `tokens.css` **and** documented in `tokens.json`,
   with the reason. Both or neither.
8. **No new runtime dependency.** The floor bundle is the budget, and a
   `devDependency` does not ship, so test and build tooling is allowed where a
   date library or a chart library is not. This rule used to read "no new
   dependency" full stop, which was the right instinct aimed at the wrong
   target: it also banned the tooling that keeps the other rules honest.
9. A new pure function that encodes a rule has a test beside it.

If you cannot satisfy one of these, say so explicitly rather than working around
it. A silent workaround in a safety-adjacent product is worse than a blocked
task.
