# Handover proof

The brief asks for a system where _"an engineer takes it, changes the flow and
screens with 2 to 3 prompts, and ships. You do the final polish. >95% right."_

That is a testable claim, so this document tests it and reports what actually
happened, including the part the agent got wrong.

## Method, stated honestly

Each prompt below was run against this repository with `AGENTS.md` as the
governing context, and committed separately so the diff is inspectable in git
history. Every result was verified with `npm run check` and `npm run build`.

Prompts 1 and 2 carry a caveat: I wrote both `AGENTS.md` and the code it governs,
so those two runs only prove that I can follow my own instructions.

**Prompt 3 does not carry that caveat.** It was executed by a different agent
with no knowledge of this codebase, this conversation, or the fact that anyone
would look at the result. It received the four sentences documented in
`AGENTS.md` §9 and nothing else. No mention of the token system, the i18n rule,
the contrast floor, or that it was being evaluated. The raw output is committed
unedited on the `handover-prompt-3` branch, so you can read exactly what came out
before any human touched it.

That is the cold run this document used to promise and could not provide. It is
the most useful thing here, and it is the section I would read first.

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

It had followed the instruction it was _given_, "add all copy to strings.ts", for
the copy the prompt actually named. Then it invented an unnamed control and
reverted to its default habit for that one.

Auditing for that turned up three **pre-existing** violations of the same rule in
my own baseline: `Neue Frage`, `Fehler`, and the standby hint were all hardcoded
German. The agent's slip was a smaller version of mine.

Polish diff: 19 lines added, 6 removed, across the same 2 files.

---

## Prompt 3, the cold run

> Restyle `EscalationCard` so the responder's name and expected wait are the
> dominant elements and the explanatory text is secondary. Use token classes
> only, no raw values, and keep every existing prop and aria attribute. Run
> `npm run check`.

Run by an agent with no knowledge of this repository beyond what it found on
disk. Raw output on the `handover-prompt-3` branch, committed with no human
edits:

```
git diff master handover-prompt-3
1 file changed, 6 insertions(+), 4 deletions(-)
```

**What it got right.** Token classes only, with zero raw values and zero
arbitrary Tailwind. All three props preserved. `aria-live="polite"` intact.
Reused existing `t()` keys instead of inventing strings. Touched exactly the one
file named. `npm run check` and `npm run build` both pass, verified independently
rather than taken from its own report. And it did the job asked: the name and the
wait are unmistakably dominant now.

As instruction-following, that is a good result. Roughly 95% of it is right,
which is the figure the brief asks for.

**What no check caught.**

1. **It broke rule 2.** The shift-status and shared-language lines were set to
   `text-meta`, which is 14px and reserved for timestamps and audit references.
   Neither script noticed, because one checks colour and the other checks literal
   strings. Nothing checks type size.

2. **It turned an estimate into a promise.** `esc.replies` reads "Antwortet
   normalerweise in ~4 Min." It is now a 28px bold headline, the largest element
   on the card. That number is an observed average, and the whole escalation flow
   depends on it not reading as a commitment the system can fail to keep.
   Typography made a claim the copy was carefully worded to avoid.

3. **It demoted the line doing the most work.** `esc.notFound`, "Das steht in
   keiner Anleitung", dropped from 18px body text to 16px muted. That line puts
   the failure on the documentation instead of on the worker, which is what makes
   asking socially survivable on a shop floor. It is now the quietest thing in the
   card.

**And one it caught me on.** Auditing its work showed that rule 2 as written
("no text below 18px, except 14px meta") contradicted `tokens.json`, where
`text-small` exists at 16px for supporting labels. My own baseline used
`text-small` for the role and line. So the agent was not breaking a clear rule so
much as obeying an unclear one. Rule 2 now says what it always meant:
instructions and answer content at 18px or above, labels may use 16px, and 14px
is only ever timestamps and audit references.

**What this run is actually evidence of.** Every one of the three findings needs
a person who knows why the copy was written that way. Two of them are invisible
to any linter that could reasonably be written. The third is a stated rule that
no check enforces. Meanwhile the things automation _can_ see, tokens, props, aria
and types, were all correct on the first attempt.

That is the shape of the job: the machine reliably handles the mechanical layer,
and a human is still required for the layer where meaning lives. The number to
take from this is not 95%. It is _which_ 5%.

---

## What this actually shows

**The encouraging part.** Both changes landed in the files `AGENTS.md` predicted,
used only existing components and tokens, and compiled clean. The architecture of
dumb components with the state machine in one route is what made that
predictable. "Change the flow" touched `+page.svelte` and nothing else needed to
move.

**The honest part.** The 95% figure is the wrong way to think about it. Roughly
95% of the _lines_ were right, but the remaining 5% was not randomly distributed.
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

Two of doinstruct's own brand swatches also fall below the floor, but the script
did not find those and should not be credited with them. I caught them by hand
while adopting the palette, before the script existed. Being exact about which
findings came from the tool and which came from a person is the whole reason for
having the tool.

`--swatch--mid-green` measures 4.6:1 on their off-white and
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
