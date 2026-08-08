# Decision log

Running record of what was learned, what changed as a result, and why. Kept
because a decision I can't reconstruct the reasoning for is a decision I can't
defend.

Newest entries at the bottom.

---

## D1 — Framework: Svelte, not React

**Learned:** doinstruct builds on Svelte/SvelteKit.

**Decision:** Build in SvelteKit 2 / Svelte 5 / Tailwind v4 / TypeScript, despite
React being my faster path.

**Why:** The brief's fourth ask is a design system *an engineer takes and ships
with 2–3 prompts*. A React system makes that sentence impossible for this team.
Every argument for React is an argument about my velocity; it loses to an
argument about their adoption.

**Consequence — and this became the thesis:** agents are measurably worse at
Svelte than React, and Svelte 5 runes plus Tailwind v4's CSS-first config both
post-date a lot of model training data. Agents fall back to `export let`, `$:`
and `tailwind.config.js`. So doinstruct's stated goal — *agents producing >95%
good UI* — is currently failing for them in a specific, diagnosable way. The
artifact that fixes it is precisely what they asked for. The weakness of the
tooling is the reason the work matters, not an obstacle to it.

---

## D2 — Product research, because no screenshots were ever shared

**Learned:** I was never shown the product. Public sources fill the gap:

- Verticals are Food & Beverage, Logistics, Construction, Manufacturing. They're
  a member of the German meat and sausage producers' association, so food
  processing is a core vertical rather than a guess.
- **"Genius"** is their existing AI module — documents and video into lessons,
  with instant translation.
- **35+ languages.** Multilingual is identity, not a feature.
- **No app download, no passwords** is a stated product principle.
- **Audit-ready exports with timestamps** is the compliance moat.

**Decisions that follow:**

1. No login screen. Entry is a wall-mounted device already scoped to a line, or
   a QR/NFC deep link. Honouring their own principle beats inventing auth.
2. The buddy reads as a sibling to Genius — Genius *makes* knowledge, Ask
   *retrieves* it — rather than a competing AI surface.
3. Translation is leverage, not something to reinvent.
4. The knowledge-capture loop emits an audit entry. That's what turns the
   flywheel from a nice idea into something that reinforces the business they
   already sell.

---

## D3 — The slice, and the cut that justifies itself

**Decision:** Operational knowledge. Voice primary, text fallback. One scenario:
a food-production filling line, a Romanian-speaking maintenance technician,
German source documentation, mid-shift.

**What I cut, and why it's a constraint rather than a preference:**

> HR is cut because it is *private*. In a hygiene zone personal phones are
> frequently restricted, so the realistic device is shared and wall-mounted. On a
> shared no-login device, payroll and vacation questions require per-worker
> authentication — which breaks doinstruct's own no-password principle.
> Operational knowledge is not private, so it survives on a shared device.
> Voice is primary because wet, gloved hands cannot type.

The environment picks the domain. That ordering is the point.

---

## D4 — It's a routing problem, not a Q&A problem

**Learned:** from the brief's own words — *"the answer is a colleague or
supervisor away. So they wait."*

**Decision:** The flow deliberately includes the **miss**. An assistant that
answers 70% of questions and shrugs at the rest has rebuilt the dead-end it was
meant to remove.

miss → route to a named human who can answer → capture their answer → it becomes
the next instant answer, with an audit entry attached.

**Why it matters commercially:** that loop is the only defensible story for how a
thin LLM wrapper becomes an operating system. It also compounds into the
compliance product doinstruct already sells.

---

## D5 — Static output, no server

**Learned:** `adapter-vercel` refuses to build on Node 25.

**Decision:** Switch to `adapter-static`.

**Why:** The immediate cause was the Node version, but static is the better
answer regardless — no serverless cold start, fully cacheable, deployable
anywhere, and it supports the low-end-device claim rather than undermining it.
Deploy reliability also matters more than flexibility with a Sunday deadline.

---

## D6 — Token decisions that diverge from convention

Each divergence is recorded in `src/lib/design/tokens.json` with its reason. The
three that matter:

- **64px minimum tap target** against WCAG 2.2 AAA's 44px. 44px assumes a bare
  fingertip; a cut-resistant glove has a ~14–16mm contact patch and no
  proprioceptive feedback.
- **18px minimum body text**, and 14px exists only for timestamps and audit
  metadata — never instructions. Read at arm's length from a wall-mounted screen,
  often through safety glasses.
- **No shadows at all.** Under washdown lighting a soft shadow is invisible, so
  hierarchy is carried by border and surface colour. This also keeps the system
  legible when customers print it to a laminated card for the line.

Plus two rules that constrain colour rather than expand it: lime is reserved for
exactly one element per screen (the voice action), and red is reserved for
safety stop — never for validation errors. A worker must be able to trust that
red means stop working.

**Zero webfont bytes.** System font stack only, as a deliberate performance
decision for throttled connections in a plant.
