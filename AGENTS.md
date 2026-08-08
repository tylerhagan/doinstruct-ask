# AGENTS.md

Rules for any AI agent working in this repository. Read this file completely
before writing code. If a rule here conflicts with your training defaults, this
file wins.

This is the deliverable rather than documentation about the deliverable. The
claim it makes is testable: an engineer who has never seen this codebase should
be able to change the flow and the screens with two or three prompts and ship,
with a human doing only final polish. `docs/handover-proof.md` is the receipt.

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
*previous* version of this stack. That is fixable with rules, and the rules are
below.

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

**Verify rather than assume.** `npm run check` must print `0 errors`. Do not
report a task complete without running it.

---

## 4. Tailwind v4, not v3

- There is **no `tailwind.config.js`**. Creating one does nothing. The theme is
  `@theme { … }` in `src/lib/design/tokens.css`.
- Never write a raw hex value, a raw px size, or an arbitrary value such as
  `p-[13px]` or `text-[#333]`. Every value you need already exists as a token.
- If the token you need does not exist, **stop and ask**. A missing token means
  the design intent is undefined, and inventing one silently forks the system.

---

## 5. Hard rules

These encode safety and accessibility rather than taste. Breaking one is a defect
even if the result looks fine.

1. **Nothing interactive is smaller than 64px** (`min-h-tap`). Gloves rather than
   fingertips. The push-to-talk control is 96px (`min-h-tap-primary`).
2. **No text below 18px** (`text-body`) except timestamps and audit references
   (`text-meta`, 14px). Never set an instruction in `text-meta`.
3. **Yellow appears exactly once per screen**, on the primary voice action. Two
   yellow elements means the screen is wrong.
4. **Red (`stop`) is reserved for safety.** Hazards, lockout and tagout, and
   refusals only. Never for validation errors, never for "delete". A worker must
   be able to trust that red means stop working.
5. **No shadows.** Hierarchy comes from border and surface colour. Shadows are
   invisible under washdown lighting.
6. **No user-facing string literals in components.** Add a key to
   `src/lib/i18n/strings.ts` with all three languages and call `t('key')`. A
   German-only string is a defect rather than a placeholder.
7. **Never truncate content.** Wrap instead. German compounds and Romanian
   diacritics both overflow, and a truncated safety instruction is a hazard.
8. **Every answer carries provenance.** If you add an answer surface, it renders
   `SourceChip`. Unsourced machine guidance is a liability.
9. **Nothing animates position, and nothing runs longer than 200ms.**

Rule 9 and the contrast floor behind rules 1 to 4 are enforced by
`scripts/check-contrast.mjs`, which runs as part of `npm run check`. Rules that
can become checks should become checks; see the closing section of
`docs/handover-proof.md`.

---

## 6. Where things live

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
```

**The architectural rule that makes prompting predictable:** components are dumb.
They render props and report gestures, and they never own flow state. The state
machine lives only in `+page.svelte`.

That is why "change the flow" touches one file, "restyle the answer" touches one
file, and neither breaks the other.

---

## 7. Component inventory

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

## 8. Prompts that work

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
> standby. Follow AGENTS.md: use existing components and tokens, and add all copy
> to `src/lib/i18n/strings.ts` in three languages. Run `npm run check`.

**Restyle a component**

> Restyle `EscalationCard` so the responder's name and expected wait are the
> dominant elements and the explanatory text is secondary. Use token classes
> only, no raw values, and keep every existing prop and aria attribute. Run
> `npm run check`.

**What makes these work:** they name the file, state the intent, point at
AGENTS.md, and end with the verification command. A prompt without a
verification step is a prompt whose output nobody checked.

---

## 9. Definition of done

Before reporting a task complete:

1. `npm run check` reports 0 errors and all contrast checks pass.
2. `npm run build` succeeds.
3. Any new copy exists in all three languages.
4. No raw hex, no raw px, no arbitrary Tailwind values.
5. No interactive target below 64px.
6. Yellow still appears at most once per screen.

If you cannot satisfy one of these, say so explicitly rather than working around
it. A silent workaround in a safety-adjacent product is worse than a blocked
task.
