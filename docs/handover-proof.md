# Handover proof

The brief asks for a system where *"an engineer takes it, changes the flow and
screens with 2 to 3 prompts, and ships. You do the final polish. >95% right."*

That is a testable claim, so this document tests it and reports what actually
happened, including the part the agent got wrong.

## Method, stated honestly

Each prompt below was run against this repository with `AGENTS.md` as the
governing context, and committed separately so the diff is inspectable in git
history. Every result was verified with `npm run check` and `npm run build`.

The caveat that matters: I wrote both `AGENTS.md` and the code it governs, so
this is not a fully cold test. A genuinely cold run, meaning a different
engineer, a fresh session and no memory of the codebase, is the real proof. It is
the first thing I would want to do together rather than assert here.

What this document does establish is the shape of the handover: which files a
change touches, how much lands correctly, and what class of thing is left for a
human.

---

## Prompt 1, change content

> In `src/lib/data/scenarios.ts`, add a sixth step to the `sourced` scenario: log
> the seal replacement in the shift book. Translate it into all three languages.
> Then run `npm run check`.

**Result:** 1 file, 5 lines added, `0 errors`, no polish required.

```diff
  			de: 'Fehler am HMI quittieren und fünf Flaschen im Probelauf fahren.',
  			ro: 'Confirmă eroarea la HMI și fă un test cu cinci sticle.',
  			en: 'Acknowledge the fault at the HMI and run five bottles as a test.'
+ 		},
+ 		{
+ 			de: 'Den Dichtungstausch im Schichtbuch eintragen, mit Teile-Nr. und Uhrzeit.',
+ 			ro: 'Notează schimbarea garniturii în registrul de tură, cu cod piesă și ora.',
+ 			en: 'Log the seal replacement in the shift book, with part number and time.'
  		}
```

The localised content structure did the work here. Because a step is a
`Record<Language, string>`, "add a step" cannot compile as German-only. The type
system enforces the design rule.

---

## Prompt 2, change the flow

> Add a `handover` phase to the state machine in `src/routes/+page.svelte`,
> entered from the answer screen via a new "Für die nächste Schicht notieren"
> button. It shows the answer summary and a confirm button, then returns to
> standby. Follow AGENTS.md: use existing components and tokens, and add all copy
> to `src/lib/i18n/strings.ts` in three languages. Run `npm run check`.

**Result:** 2 files, 30 lines added and 4 removed, `0 errors`, build passes,
feature works.

The new phase composed entirely from existing primitives: `Button`, the token
classes, and the `t()` helper. No new component, no new token, no raw values.

### What the polish pass caught

One defect, and an instructive one. The agent added a "Back" control with a
hardcoded German string:

```diff
- <Button variant="quiet" full onclick={() => (phase = 'answer')}>Zurück</Button>
+ <Button variant="quiet" full onclick={() => (phase = 'answer')}>{t('flow.back')}</Button>
```

It had followed the instruction it was *given*, "add all copy to strings.ts", for
the copy the prompt actually named. Then it invented an unnamed control and
reverted to its default habit for that one.

Auditing for that turned up three **pre-existing** violations of the same rule in
my own baseline: `Neue Frage`, `Fehler`, and the standby hint were all hardcoded
German. The agent's slip was a smaller version of mine.

Polish diff: 19 lines added, 6 removed, across the same 2 files.

---

## What this actually shows

**The encouraging part.** Both changes landed in the files `AGENTS.md` predicted,
used only existing components and tokens, and compiled clean. The architecture of
dumb components with the state machine in one route is what made that
predictable. "Change the flow" touched `+page.svelte` and nothing else needed to
move.

**The honest part.** The 95% figure is the wrong way to think about it. Roughly
95% of the *lines* were right, but the remaining 5% was not randomly distributed.
It was exactly the thing that only matters if you know the domain. An
untranslated button is invisible in review, compiles perfectly, passes every
automated check, and is a dead end for the half of a German food-production line
that does not read German comfortably.

That is a useful result rather than a disappointing one. It says the design
engineer's job in this setup is not drawing screens or reviewing syntax. It is
writing the rules, then auditing exactly the class of thing that rules cannot yet
enforce, and then shrinking that class.

---

## So I shrank it, and it caught me too

`AGENTS.md` claimed "no text token below 7:1 exists". That was prose, which meant
it stopped being true the moment anyone changed a colour. I replaced it with
`scripts/check-contrast.mjs`, which runs as part of `npm run check` and fails the
build.

It immediately found five colour pairs that did not meet the rule I had written,
four of them my own status colours sitting between 5.4:1 and 6.1:1. I had
asserted a standard in a document and then not met it, and no amount of human
review had noticed.

It also caught two of doinstruct's own brand swatches that do not clear the floor
in this context. `--swatch--mid-green` measures 4.6:1 on their off-white and
`--swatch--light-green` measures 1.65:1, which is invisible as a structural
border. Both are fine marketing values. Neither survives washdown glare. Both are
now darkened with the hue preserved, and recorded in `tokens.json` with the
reasoning.

Writing the script was itself a small lesson. My first version reported 387:1,
which is impossible, because I had skipped the linearisation step on the blue
channel. My second version reported a perfect pass on everything, because it was
reading the high-contrast overrides where every value is pure black or white.
Both bugs produced a confident, plausible, wrong answer, which is the same
failure mode this whole document is about.

## So I did the same to the i18n rule

`scripts/check-i18n.mjs` refuses literal text in component markup outside `t()`,
including `aria-label`, `placeholder`, `title` and `alt`. It runs as part of
`npm run check`.

It found four more defects within seconds of existing, all of them mine, all of
them German `aria-label` values.

That detail is the one worth sitting with. Those labels are invisible on screen,
compile perfectly, and pass every other check. What they do is read German aloud
to a Romanian speaker using a screen reader, inside a product whose entire
argument is that language should not be a barrier. I wrote the rule, broke it
four times, and did not notice until a twenty-line script told me.

**Every rule in `AGENTS.md` that can become a check should become one.** Prose
rules degrade as an agent's context fills up. A failing build does not. Two are
done, and between them they caught nine defects that no human review had found.

## Where this stops, which matters just as much

Not every rule can become a check, and pretending otherwise would be the same
overconfidence this document is about.

While finishing this work I introduced three defects in the high-contrast theme
and the device frame. A blanket CSS rule handed a visible border to every
paragraph on the page, the rounded frame failed to clip its children, and two
design tokens collided on a name so a width silently resolved to the wrong value
and rendered at roughly twice its intended size.

All three compiled without complaint. All three passed type checking, both
contrast checks and the literal-text check. Two of them only appear in a theme a
reviewer has to deliberately toggle into. They were found by looking at the
running product on a phone, and nothing else would have found them.

So the honest position is narrower than "automate the rules". It is: automate
every rule you can, write down the ones you cannot, and keep looking at the real
thing. The next candidates for automation are a bundle-size budget and screenshot
tests over the high-contrast state, because that state is the one nobody visits
by default and therefore the one that rots.
