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

Svelte 5 (runes) shipped in late 2024 and Tailwind v4 (CSS-first config) in early
2025. Both replaced the APIs that dominate every model's training data. Left
unconstrained, an agent writes confident, plausible, **wrong** code: Svelte 4
stores and `export let`, and a `tailwind.config.js` that this project does not
have and will silently ignore.

So the gap is not that agents are bad at UI. It is that they are good at the
*previous* version of this stack. That is fixable with rules, and the rules start
here.

---

## 2. Stack, exact versions

| Thing      | Version | Consequence                                     |
| ---------- | ------- | ----------------------------------------------- |
| Svelte     | 5.56    | Runes only. `runes: true` is forced in `vite.config.ts`, so Svelte 4 syntax is a **compile error** rather than a warning. |
| SvelteKit  | 2.63    | `adapter-static`. Everything prerenders. No server, no API routes. |
| Tailwind   | 4.3     | CSS-first. The theme lives in `src/lib/design/tokens.css` under `@theme`. |
| TypeScript | 6.0     | Strict. `npm run check` must report 0 errors.    |

---

## 3. Svelte 5, not Svelte 4

The single highest-value section in this file. Each row is a Svelte 4 pattern
that models reproduce confidently because it dominated their training data, and
that this project's compiler rejects.

| Never write            | Always write                     |
| ---------------------- | -------------------------------- |
| `export let foo`       | `let { foo }: Props = $props()`  |
| `let x = 0` (reactive) | `let x = $state(0)`              |
| `$: doubled = x * 2`   | `const doubled = $derived(x * 2)` |
| `$: { sideEffect() }`  | `$effect(() => { sideEffect() })` |
| `writable()` / `$store`| `$state` in a `.svelte.ts` class |
| `on:click={fn}`        | `onclick={fn}`                   |
| `createEventDispatcher`| callback props such as `onstart`, `onstop` |
| `<slot />`             | `{@render children()}` with `Snippet` |
| `export let value` plus `bind:` | `$bindable()`           |

Two more that are easy to miss:

1. Multi-statement derivations use `$derived.by(() => { … })`, not
   `$derived(() => …)`. The second form assigns the *function*, and the bug is
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
- **Never add a blanket rule under `[data-contrast='high']`.** Preflight sets
  `border: 0 solid` on every element, so `[data-contrast='high'] * {
  border-width: 2px }` hands a visible border to every div and paragraph on the
  page. High contrast works through the token overrides alone.

---

## 5. The non-negotiables

These apply to every task. They encode safety and accessibility rather than
taste, so breaking one is a defect even if the result looks fine.

1. **Nothing interactive below 64px** (`min-h-tap`), 96px for push-to-talk.
   Gloves, not fingertips.
2. **No text below 18px** (`text-body`), except timestamps and audit references
   at 14px (`text-meta`). Never set an instruction in `text-meta`.
3. **Yellow appears exactly once per screen**, on the primary voice action.
4. **Red (`stop`) is reserved for safety.** Never for validation errors, never
   for "delete". A worker must be able to trust that red means stop working.
5. **No shadows.** Hierarchy comes from border and surface colour, because
   shadows are invisible under washdown lighting.
6. **All copy goes through `t()`**, in all three languages, including
   `aria-label`. Enforced by `scripts/check-i18n.mjs`.
7. **Never truncate.** Wrap instead. German compounds and Romanian diacritics
   both overflow, and a truncated safety instruction is a hazard.
8. **Every answer carries provenance.** New answer surfaces render `SourceChip`.
9. **Nothing animates position, and nothing exceeds 200ms.**

---

## 6. The other rule files, and when to load them

Kept separate on purpose. A rules file long enough to cover everything is a rules
file that gets skimmed by humans and diluted in a long agent session, so load
what the task needs.

| File | Load it when |
| --- | --- |
| [`docs/rules/behaviour.md`](docs/rules/behaviour.md) | **Any task that changes code.** Dependency lock, never weaken a check, do not invent to fill a gap, stay inside the task. |
| [`docs/rules/content.md`](docs/rules/content.md) | The task adds or changes **any text a worker reads or hears.** Interpolation, locked safety terminology, reading level, locale formatting. |
| [`docs/rules/accessibility.md`](docs/rules/accessibility.md) | The task adds an **interactive element, a screen, or a state transition.** Target spacing, focus management, live regions, logical properties, the four required states. |

If you are unsure which applies, load `behaviour.md` and ask.

---

## 7. Where things live

```
src/lib/design/tokens.json   Source of truth, plus the REASONING for each divergence
src/lib/design/tokens.css    @theme, the utility classes you may use
src/lib/domain/types.ts      Domain model. Add fields here first.
src/lib/i18n/strings.ts      All user-facing copy, three languages
src/lib/state/session.svelte.ts       Device state (language, contrast, machine)
src/lib/voice/recognition.svelte.ts   Mic, level metering, scripted fallback
src/lib/data/scenarios.ts    Demo content
src/lib/components/*.svelte  The system. Contracts are in each file's header.
src/routes/+page.svelte      The whole flow state machine
src/routes/system/+page.svelte        Component gallery. Read this to see what exists.
scripts/check-contrast.mjs   Contrast rules, enforced
scripts/check-i18n.mjs       The no-literal-text rule, enforced
```

**The architectural rule that makes prompting predictable:** components are dumb
about **flow state**. They render props and report gestures, and the state
machine lives only in `+page.svelte`. That is why "change the flow" touches one
file, "restyle the answer" touches another, and neither breaks the other.

They are not dumb about locale. Any component calling `t()` reads `session`, and
`SourceChip` reads it directly to detect a translated source. That is deliberate,
and worth stating precisely rather than claiming a purity the code does not have.

---

## 8. Component inventory

Full contracts sit in the header comment of each file. Read that header before
modifying a component.

| Component | Purpose | Key props |
| --- | --- | --- |
| `Button` | The only interactive primitive | `variant`, `size`, `full` |
| `PushToTalk` | Primary voice action, hold to talk | `state`, `label`, `level`, `noisy`, `onstart`, `onstop` |
| `LevelMeter` | Proof the mic hears you in a loud room | `level`, `noisy` |
| `TranscriptConfirm` | "This is what I heard", before acting | `text`, `uncertain`, `onconfirm`, `onretry`, `ontype` |
| `AnswerCard` | Grounded answer, or honest refusal | `answer`, `speaking`, `onread`, `onnothelp` |
| `StepList` | Procedure with persistent tick-off | `steps`, `oncomplete` |
| `SourceChip` | Provenance, with document age | `source`, `onopen` |
| `SafetyBanner` | Caution and stop | `level` |
| `EscalationCard` | The miss, then a named human, then capture | `escalation`, `onnotify`, `oncapture` |
| `StatusBar` | Machine context, language, contrast | reads `session` |
| `DemoPanel` | Reviewer controls. **Delete to ship.** | `scenarioId`, `onreset` |

---

## 9. Prompts that work

Copy and paste. The first two were run against this repo and the results,
including what the agent got wrong, are in `docs/handover-proof.md`. The third
follows the same shape but has not been run.

**Add a step to a procedure**

> In `src/lib/data/scenarios.ts`, add a sixth step to the `sourced` scenario:
> log the seal replacement in the shift book. Translate it into all three
> languages. Then run `npm run check`.

**Add a new screen to the flow**

> Add a `handover` phase to the state machine in `src/routes/+page.svelte`,
> entered from the answer screen via a new "Für die nächste Schicht notieren"
> button. It shows the answer summary and a confirm button, then returns to
> standby. Follow AGENTS.md and docs/rules/content.md: use existing components
> and tokens, and add all copy to `src/lib/i18n/strings.ts` in three languages.
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

## 10. Definition of done

1. `npm run check` passes: 0 type errors, all contrast checks, no literal text.
2. `npm run build` succeeds.
3. Any new copy exists in all three languages.
4. No raw hex, no raw px, no arbitrary Tailwind values.
5. No interactive target below 64px, and no two targets closer than 12px.
6. Yellow still appears at most once per screen.
7. No new dependency.

If you cannot satisfy one of these, say so explicitly rather than working around
it. A silent workaround in a safety-adjacent product is worse than a blocked
task.
