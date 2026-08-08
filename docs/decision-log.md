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
