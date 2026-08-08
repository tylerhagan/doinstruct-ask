# Decision log

A running record of what I learned, what changed as a result, and why. I keep it
because a decision I can't reconstruct the reasoning for is a decision I can't
defend.

Newest entries at the bottom.

---

## D1. Framework: Svelte, not React

**Learned:** doinstruct builds on Svelte and SvelteKit.

**Decision:** Build in SvelteKit 2, Svelte 5, Tailwind v4 and TypeScript, despite
React being my faster path.

**Why:** The brief's fourth ask is a design system *an engineer takes and ships
with 2 to 3 prompts*. A React system makes that sentence impossible for this
team. Every argument for React is an argument about my velocity, and it loses to
an argument about their adoption.

**Consequence, which became the thesis:** agents are measurably worse at Svelte
than React, and Svelte 5 runes plus Tailwind v4's CSS-first config both post-date
a lot of model training data. Agents fall back to `export let`, `$:` and
`tailwind.config.js`. So doinstruct's stated goal of agents producing more than
95% good UI is currently failing for them in a specific, diagnosable way. The
artifact that fixes it is precisely what they asked for. The weakness of the
tooling is the reason the work matters rather than an obstacle to it.

---

## D2. Product research, because no screenshots were ever shared

**Learned:** I was never shown the product. Public sources fill the gap.

- Verticals are Food & Beverage, Logistics, Construction and Manufacturing.
  They're a member of the German meat and sausage producers' association, so food
  processing is a core vertical rather than a guess.
- **Genius** is their existing AI module: documents and video into lessons, with
  instant translation.
- **35+ languages.** Multilingual is identity rather than a feature.
- **No app download, no passwords** is a stated product principle.
- **Audit-ready exports with timestamps** is the compliance moat.

**Decisions that follow:**

1. No login screen. Entry is a wall-mounted device already scoped to a line, or a
   QR or NFC deep link. Honouring their own principle beats inventing auth.
2. The buddy reads as a sibling to Genius. Genius *makes* knowledge, Ask
   *retrieves* it, rather than competing for the same surface.
3. Translation is leverage rather than something to reinvent.
4. The knowledge-capture loop emits an audit entry. That turns the flywheel from
   a nice idea into something that reinforces the business they already sell.

---

## D3. The slice, and the cut that justifies itself

**Decision:** Operational knowledge. Voice primary, text fallback. One scenario:
a food-production filling line, a Romanian-speaking maintenance technician,
German source documentation, mid-shift.

**What I cut, and why it's a constraint rather than a preference:**

> HR is cut because it is private. In a hygiene zone personal phones are
> frequently restricted, so the realistic device is shared and wall-mounted. On a
> shared device with no login, payroll and holiday questions require per-worker
> authentication, which breaks doinstruct's own no-password principle.
> Operational knowledge is not private, so it survives on a shared device. Voice
> is primary because wet, gloved hands cannot type.

The environment picks the domain. That ordering is the point.

---

## D4. It's a routing problem, not a Q&A problem

**Learned:** from the brief's own words, *"the answer is a colleague or
supervisor away. So they wait."*

**Decision:** The flow deliberately includes the miss. An assistant that answers
seven questions in ten and shrugs at the rest has rebuilt the dead-end it was
meant to remove.

Miss, then route to a named human who can answer, then capture their answer, so
it becomes the next instant answer with an audit entry attached.

**Why it matters commercially:** that loop is the only defensible story for how a
thin LLM wrapper becomes an operating system. It also compounds into the
compliance product doinstruct already sells.

---

## D5. Static output, no server

**Learned:** `adapter-vercel` refuses to build on Node 25.

**Decision:** Switch to `adapter-static`.

**Why:** The immediate cause was the Node version, but static is the better
answer regardless. No serverless cold start, fully cacheable, deployable
anywhere, and it supports the low-end-device claim rather than undermining it.
Deploy reliability also matters more than flexibility with a Sunday deadline.

---

## D6. Token decisions that diverge from convention

Each divergence is recorded in `src/lib/design/tokens.json` with its reason. The
three that matter:

- **64px minimum tap target** against WCAG 2.2 AAA's 44px. 44px assumes a bare
  fingertip. A cut-resistant glove has a contact patch of roughly 14 to 16mm and
  no proprioceptive feedback.
- **18px minimum body text**, with 14px existing only for timestamps and audit
  metadata, never instructions. It's read at arm's length from a wall-mounted
  screen, often through safety glasses.
- **No shadows at all.** Under washdown lighting a soft shadow is invisible, so
  hierarchy is carried by border and surface colour. This also keeps the system
  legible when customers print it onto a laminated card for the line.

Plus two rules that constrain colour rather than expand it. Yellow is reserved
for exactly one element per screen, the voice action. Red is reserved for safety
stop, never for validation errors. A worker must be able to trust that red means
stop working.

**Zero web font bytes.** System font stack only, as a deliberate performance
decision for throttled connections in a plant.

---

## D7. I read their brand rather than guessing at it

**Learned:** I had been estimating doinstruct's palette by eye from the case
study PDF, which was sloppy and produced three values that were merely close.
Their site is Webflow, and their production stylesheet exposes a named swatch
system, so the real values were available the whole time.

```
--swatch--dark-green   #11190C      --swatch--mid-green    #6E7664
--swatch--yellow       #D9FF1E      --swatch--light-green  #C1CAB7
--swatch--off-white    #FCFBF8      --swatch--gray         #F2EFEC
```

**Decisions:**

1. Use the exact values. My yellow was meaningfully off.
2. Adopt their neutral greens instead of the ones I had invented, so this reads
   as doinstruct rather than merely brand-adjacent.
3. Rename the accent token from `lime` to `yellow`, because that is what their
   own system calls it.
4. Keep my radii, which are noticeably rounder than their 4px. Larger radii on
   64px gloved targets help them read as tappable, and UX wins over brand
   consistency on a control someone hits while holding a part.
5. Do not adopt Manrope. A web font is a request that can fail and a layout shift
   in front of someone whose line is stopped. Off-brand on purpose beats a
   typeface that doesn't arrive.

**Two of their swatches don't survive this context**, and both are recorded in
`tokens.json`. `--swatch--mid-green` measures 4.6:1 on their off-white, and
`--swatch--light-green` measures 1.65:1, which is invisible as a structural
border. Good marketing values, below the floor for a plant floor. I darkened both
and kept the hue.

---

## D8. Turning a prose rule into a build failure

**Learned:** `AGENTS.md` asserted "no text token below 7:1 exists". I had written
that down and then not met it.

**Decision:** `scripts/check-contrast.mjs`, wired into `npm run check`.

**What it caught immediately:** five failing pairs, four of them my own status
colours sitting between 5.4:1 and 6.1:1. No human review had noticed, because
prose rules are not enforced by anything.

**Why this matters beyond the colours:** it is the concrete version of the
argument in `docs/handover-proof.md`. Every rule in `AGENTS.md` that can become a
check should become one, because prose degrades as an agent's context fills up
and a failing build does not. The i18n rule is the next obvious candidate.

Worth recording that the script itself took three attempts. The first reported
387:1, which is impossible, because I skipped linearisation on the blue channel.
The second passed everything, because it was reading the high-contrast overrides
where every value is pure black or white. Both were confident, plausible and
wrong, which is the same failure mode the whole submission is about.

---

## D9. High contrast was drawing borders nobody asked for

**Learned:** turning on high contrast put a black box around almost everything,
including bare paragraphs, layout containers and the "Type" link. Caught by
looking at the running app rather than by any check.

**Cause:** one line.

```css
[data-contrast='high'] * { border-width: 2px !important; }
```

Tailwind's preflight sets `border: 0 solid` on every element, so forcing a width
gives a visible border to everything, not just to things that opted in.

**Decision:** delete it rather than narrow it. An audit showed every bordered
element in the product already uses `border-2`, and there is not a single 1px
border anywhere, so the rule was buying nothing. High contrast still works
entirely through the token overrides: surfaces go white, borders and text go pure
black.

**What I changed as a result.** The contrast script was deliberately ignoring the
high-contrast block, on the grounds that letting black-on-white win would make
every check trivially pass. That reasoning was right about merging and wrong
about coverage, so the two palettes are now checked separately. Both pass.

**The honest lesson.** I had just finished arguing that rules should become
checks, and this defect was in the same file as the tokens those checks read. It
was a visual regression in a state a reviewer has to deliberately toggle into, so
neither the type checker nor the contrast script would ever have seen it. Some
rules are only enforceable by looking, which is an argument for screenshot tests
on the high-contrast state rather than an argument against automation.

---

## D10. The device frame was not clipping its children

**Learned:** the rounded frame had square corners poking through at the top,
because the StatusBar's corners and bottom border sat outside the radius.

**Decision:** `sm:overflow-hidden` on the frame, with the main area scrolling
inside it at that breakpoint. Scoped to `sm` deliberately: below it there is no
radius to clip to, and introducing an overflow container would break the sticky
footer, which depends on the body being the scrollport on a phone.

**A second bug found while fixing the first.** The frame used `max-w-[440px]` and
`min-h-[860px]`, both arbitrary values that my own rule 4 in `AGENTS.md`
prohibits. Replacing them with tokens exposed something worth knowing: Tailwind
resolves `max-w-*` against `--container-*` but falls back to `--spacing-*`, so
naming both `--container-device` and `--spacing-device` made `max-w-device`
silently resolve to 860px instead of 440px. It compiled clean and rendered at
twice the intended width. Renamed to `--container-device` and `--spacing-frame`,
and the trap is now written into `AGENTS.md`.

Three defects in this area, all of which compiled without complaint and none of
which any check would have caught. That is the counterweight to D8: automate what
you can, and keep looking at the running product for the rest.

---

## D11. Splitting the rules, and the second check

**Learned:** reviewing `AGENTS.md` against the brief, the file was strong on
stack correctness and physical sizing and thin on the two things that actually
break agent output: what an agent does when it wants something the system does
not have, and content rules.

**Decision: split rather than grow.** `AGENTS.md` stays the always-read entry
point, holding the stack traps, the non-negotiables and an index. Three focused
files sit beside it, each with a stated trigger for when to load it:

- `docs/rules/behaviour.md` for any code change
- `docs/rules/content.md` when text a worker reads is involved
- `docs/rules/accessibility.md` when an interactive element or transition is

The structure is itself the argument. A rules file long enough to cover
everything gets skimmed by humans and diluted in a long agent session, so every
rule added makes the others slightly less likely to be followed. Telling an agent
*when* to load a file is context budgeting made explicit.

**The rules I judged worth adding**, in rough order of how often an agent breaks
them: the dependency lock, because one convenience library destroys the 48 KB
budget the frontline claims rest on; never weaken a check to make it pass, which
is the most dangerous thing an agent does now that there are checks worth
protecting; never build a sentence by concatenation, because word order is not
universal and every fragment is individually valid so nothing catches it; and a
locked terminology table, because a synonym for "Not-Aus" is a hazard rather than
a style variation.

**Second check built: `check-i18n.mjs`.** It refuses literal text in component
markup outside `t()`, including `aria-label`, `placeholder`, `title` and `alt`.

It found four defects immediately, all mine, all German `aria-label` values.
Those are invisible on screen, compile perfectly, pass type checking, and read
German aloud to a Romanian speaker using a screen reader, inside a product whose
whole argument is that language should not be a barrier. Second time a
twenty-line script has caught something no amount of re-reading did.

**Deliberately not added:** testing conventions, naming conventions, git
workflow. They would pad the file without serving the brief.

---

## D12. Naming the psychology that was already in the design

**Learned:** re-reading the writeup against the brief, two things stood out.

First, a literal gap. Ask 2 is "a clickable, high-fidelity prototype **plus the
key UX flows**", and there was no artifact showing the flows at all. Fixed with a
flow diagram covering the three linear stages, every escape hatch, the three-way
fork, and the single branch that loops.

Second, and more useful: almost every decision here already encoded user
psychology, but the writing explained it ergonomically. Gloves, glare, decibels,
bytes. That reads as a good engineer and undersells the design thinking.

**What changed, without changing the design:**

- The escalation copy says "Das steht in keiner Anleitung", which puts the
  failure on the documentation rather than the worker. Asking for help carries a
  real social cost in a shift hierarchy. That line was already doing the work; it
  just had never been named.
- The wait screen was already applying waiting psychology: a named person, an
  observed average rather than a promise, shift status, and explicit permission
  to walk away. Unexplained, unbounded and idle waits each feel longer, and all
  three are fixable in copy.
- Provenance and refusal are one mechanism against automation bias, not two
  features. A tool that has said "no, get a qualified person" is a tool whose
  "yes" carries weight.
- Persistent step ticks exist because acute stress narrows working memory, so the
  device holds the state the worker can't.

**One design change, not just a reframing.** The capture moment used to lead with
the system's benefit. It now credits the worker first: their question improved
the manual. That is the emotional peak of the flow and the part that gets
remembered, and it converts needing help into having contributed, which is the
cheapest lever on whether someone asks a second time.

**The tension I decided to name rather than hide.** Voice is public. On a shared
device on an open floor, asking aloud broadcasts what you don't know to whoever
is nearby, possibly including the supervisor who sets your shifts. That cuts
against the modality I chose as primary. The text path is a mitigation rather
than a solution, and a usability test in a quiet room would never surface it. The
measurement I'd want is not recognition accuracy but whether the asking rate
drops when a supervisor is on shift.

**Two gaps named rather than fixed.** Right-to-left is not supported, and the
language list doinstruct publishes includes Arabic and Dari, so it should be. The
components use physical CSS properties rather than logical ones. And focus is not
managed across phase changes, which leaves keyboard and screen reader users on a
control that no longer exists. Both rules are now written so new work does not
deepen either hole, and both are named in the writeup. Found late, and rushing a
layout migration the day before sending would have been the wrong trade.

---

## D13. Identifiers are not localisable, and neither check knows that

**Learned:** Tyler spotted that the top-left of the status bar stays German in
every language: "Linie 3, Abfüllung / Füller F2 · AST-3121". Fair question, and
the honest answer was that it was half deliberate and entirely undocumented.

**On inspection there were three categories, not one:**

1. **Correct to leave German, for a safety reason.** `Füller F2`, `AST-3121`,
   `E-212`, `Wartungshandbuch Füller F2`, `§4.2 Fehlercode E-212`. The worker
   matches all of these against a nameplate, an HMI screen or a document on a
   shelf. Translate the machine name and the screen and the machine disagree,
   with no way for the worker to tell which is right. The worst case is someone
   working on the wrong machine.
2. **A genuine defect.** `role: 'Schichtleiter'` was hardcoded German. A job
   title is a descriptor rather than an identifier, it is not printed on
   anything, and it sits directly under Marek's name where it tells the worker
   whether this person can actually help. Now localised.
3. **A judgement call left as it is.** `Linie 3, Abfüllung` matches the signage
   painted on the floor, so it stays.

**Decision:** encode the distinction in the domain model rather than in comments.
`Identifier` and `Localised` now exist in `src/lib/domain/types.ts`, and
`Responder` uses both, so the type declares which kind of string a field holds.
Rule 4 in `docs/rules/content.md` states it in full.

**Why this one matters beyond the fix.** Neither check caught it, and neither
should have. Both scan `.svelte` markup, and these strings live in the data
layer, where a naive "no German literals" rule would flag precisely the ones that
must stay German. This is the third example in this project of a rule that cannot
become a check, after the high-contrast border bug and the token name collision.

It also came from the only source that has reliably found this class of problem:
someone looking at the running product and asking why. Worth remembering when
deciding how much of a design system to automate.

---

## D14. Setting the writeup in their brand rather than mine

**Decision:** restyle the writeup to match doinstruct's own deck.

The document previously had a deliberately separate identity: cool paper, ochre
accent, a serif for reading, square rules. It was a defensible choice, and it
made the document look like a considered piece of design that happened to be
about doinstruct.

Matching their deck makes a different and, on reflection, better argument. A
design engineer joining a company does not arrive and impose a look. They work
inside the identity that exists. Doing that visibly, using values read out of
their production stylesheet rather than eyedropped from a PDF, demonstrates the
thing the role actually requires.

**What was adopted:** the exact swatches, pill-shaped section eyebrows,
oversized numerals on cards, generously rounded cards, dark statement bands, and
a halftone dot motif from their cover, built in CSS rather than as an image.

**Structural note.** Their deck alternates dark statement slides with light
content slides. That is also the right structure for something this long to
read, so body copy always sits on off-white and the dark treatment is reserved
for the masthead, the pull quote, the branch that loops, and the colophon. A
brand deck can set a paragraph on near-black. A three-thousand word document
should not.

**Two deliberate deviations, both stated in the colophon.** Their mid-green is
4.6:1 on their own off-white, so body text uses a darkened version. And red still
appears exactly once, on the safety note, because that rule belongs to the
product rather than the brand and it is worth keeping true.

**Single theme, on purpose.** A brand has one look, so there is no light and dark
variant here. Every colour is painted explicitly so the page holds on whatever
background it is rendered against.

**Verified rather than assumed:** every text pair in the document clears 7:1,
which is the same floor the product holds itself to. The lowest is red on
off-white at 7.58:1.

**Typeface stays a system stack.** Their brand face is Manrope. Loading it would
cost a request that can fail, and the product ships zero font bytes for a
reason I would rather stay consistent about. The colophon says so and offers to
change it, which seemed better than either silently diverging or silently
conforming.
