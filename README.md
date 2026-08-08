# doinstruct Ask

A voice-first way for a maintenance technician to get an operational answer
mid-shift — and, when there is no answer, to reach the person who has it.

Case study for the Design Engineer role. Built in doinstruct's own stack:
SvelteKit 2, Svelte 5 runes, Tailwind v4, TypeScript, fully static.

```bash
npm install
npm run dev      # prototype at /, design system at /system
npm run check    # 0 errors
npm run build    # static output, ~53 KB gzipped total
```

## The slice

**Operational knowledge. Voice primary, text fallback.** One scenario: a food
production filling line, a Romanian-speaking maintenance technician, German
source documentation, mid-shift.

**What I cut, and why it's a constraint rather than a preference.** In a hygiene
zone personal phones are frequently restricted, so the realistic device is
shared and wall-mounted. On a shared no-login device, HR questions — payroll,
vacation — require per-worker authentication, which breaks doinstruct's own
no-password principle. Operational knowledge isn't private, so it survives on a
shared device. Voice is primary because wet, gloved hands can't type.

The environment picks the domain. That ordering is the point.

## The product argument

This is a **routing problem, not a Q&A problem**. The brief's own words: *"the
answer is a colleague or supervisor away. So they wait."* An assistant that
answers 70% of questions and shrugs at the rest has rebuilt the dead-end it was
meant to remove.

So the flow deliberately includes the miss:

**ask → answer** · or **refuse** on safety · or **route to a named human →
capture their answer → it becomes the next instant answer, with an audit entry**

That loop is the only defensible story for how a thin LLM wrapper becomes an
operating system — and it compounds into the compliance product doinstruct
already sells.

## Three states, three scenarios

The **Demo** panel (bottom right, deliberately not product UI) switches between
the only three things this product can do:

1. **Answer** — fault code E-212, grounded in the manual, with provenance
2. **Refuse** — a guard-door bypass request, met with an explicit safety stop
3. **Route** — a knocking capper that isn't in any manual, escalated to Marek

It also toggles live vs scripted microphone, a loud room, and offline.

## Where to look

| Document | What it covers |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | **The main deliverable.** Rules an agent needs to produce correct UI in this stack. |
| [`docs/handover-proof.md`](docs/handover-proof.md) | The 2-to-3-prompt claim, tested — including what the agent got wrong. |
| [`docs/frontline-reality.md`](docs/frontline-reality.md) | Low-end devices, noise, gloves, languages, literacy, lighting. |
| [`docs/decision-log.md`](docs/decision-log.md) | What I learned, what changed, why. |
| [`src/lib/design/tokens.json`](src/lib/design/tokens.json) | Tokens with the reasoning for each divergence from convention. |
| `/system` route | Every component in every state. |

## Why Svelte, given I've shipped React and not Svelte

Because the fourth ask is a design system *an engineer takes and ships with 2–3
prompts*, and a React system makes that sentence impossible for this team.

It also turned out to be the more interesting problem. Svelte 5 runes and
Tailwind v4 both replaced the APIs that dominate model training data, so agents
write confident, plausible, wrong code in this stack — Svelte 4 stores, a
`tailwind.config.js` that doesn't exist here. doinstruct's goal of agents
producing >95% good UI is currently failing for a specific, diagnosable reason.
`AGENTS.md` is the fix.

The weakness of the tooling is why the work matters, not an obstacle to it.
