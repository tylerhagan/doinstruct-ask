# Handover proof

The brief asks for a system where *"an engineer takes it, changes the flow and
screens with 2 to 3 prompts, and ships. You do the final polish. >95% right."*

That is a testable claim, so this document tests it and reports what actually
happened — including the part the agent got wrong.

## Method, stated honestly

Each prompt below was run against this repository with `AGENTS.md` as the
governing context, and committed separately so the diff is inspectable in git
history. Every result was verified with `npm run check` and `npm run build`.

**The caveat that matters:** I wrote both `AGENTS.md` and the code it governs, so
this is not a fully cold test. A genuinely cold run — a different engineer, a
fresh session, no memory of the codebase — is the real proof, and it is the first
thing I would want to do together rather than assert here.

What this document does establish is the *shape* of the handover: which files a
change touches, how much lands correctly, and what class of thing is left for a
human.

---

## Prompt 1 — change content

> In `src/lib/data/scenarios.ts`, add a sixth step to the `sourced` scenario: log
> the seal replacement in the shift book. Translate it into all three languages.
> Then run `npm run check`.

**Result:** 1 file, +5 lines. `0 errors`. **No polish required.**

```diff
  			de: 'Fehler am HMI quittieren und fünf Flaschen im Probelauf fahren.',
  			ro: 'Confirmă eroarea la HMI și fă un test cu cinci sticle.',
  			en: 'Acknowledge the fault at the HMI and run five bottles as a test.'
+ 		},
+ 		{
+ 			de: 'Den Dichtungstausch im Schichtbuch eintragen — Teile-Nr. und Uhrzeit.',
+ 			ro: 'Notează schimbarea garniturii în registrul de tură — cod piesă și ora.',
+ 			en: 'Log the seal replacement in the shift book — part number and time.'
  		}
```

The localised-content structure did the work here. Because a step is a
`Record<Language, string>`, "add a step" cannot compile as German-only — the
type system enforces the design rule.

---

## Prompt 2 — change the flow

> Add a `handover` phase to the state machine in `src/routes/+page.svelte`,
> entered from the answer screen via a new "Für die nächste Schicht notieren"
> button. It shows the answer summary and a confirm button, then returns to
> standby. Follow AGENTS.md: use existing components and tokens, add all copy to
> `src/lib/i18n/strings.ts` in three languages. Run `npm run check`.

**Result:** 2 files, +30 / −4. `0 errors`, build passes, feature works.

The new phase composed entirely from existing primitives — `Button`, the token
classes, the `t()` helper. No new component, no new token, no raw values.

### What the polish pass caught

One defect, and it is an instructive one. The agent added a "Back" control with a
hardcoded German string:

```diff
- <Button variant="quiet" full onclick={() => (phase = 'answer')}>Zurück</Button>
+ <Button variant="quiet" full onclick={() => (phase = 'answer')}>{t('flow.back')}</Button>
```

It had followed the instruction it was *given* — "add all copy to strings.ts" —
for the copy the prompt named, then invented an unnamed control and reverted to
its default habit for that one.

Auditing for that turned up three **pre-existing** violations of the same rule in
my own baseline: `Neue Frage`, `Fehler`, and the standby hint were all hardcoded
German. So the agent's slip was a smaller version of mine.

Polish diff: +19 / −6 across the same 2 files.

---

## What this actually shows

**The good news.** Both changes landed in the files `AGENTS.md` predicted, used
only existing components and tokens, and compiled clean. The "dumb components,
state machine in one route" architecture is what made that predictable: *change
the flow* touched `+page.svelte`, and nothing else needed to move.

**The honest news.** The >95% figure is the wrong way to think about it. Roughly
95% of the *lines* were right, but the 5% wasn't randomly distributed — it was
exactly the thing that only matters if you know the domain. An untranslated
button is invisible in review, compiles perfectly, passes every automated check,
and is a dead end for the half of a German food-production line that doesn't read
German comfortably.

That is a useful result rather than a disappointing one. It says the design
engineer's job in this setup is not drawing screens or reviewing syntax. It is
**writing the rules, then auditing exactly the class of thing that rules cannot
yet enforce.**

## What I'd change next, and it's cheap

The i18n rule is enforceable and shouldn't rely on a human noticing. A lint rule
banning literal text in `.svelte` markup outside `t()` would have caught all four
instances — the agent's and my three — at commit time.

That is the actual lesson of this exercise: **every rule in `AGENTS.md` that can
become a check should become one.** Prose rules degrade as an agent's context
fills up; a failing build does not. The prose file is the starting point for that
migration, not the destination.
