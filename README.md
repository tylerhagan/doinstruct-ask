# doinstruct Ask

A voice-first way for a maintenance technician to get an operational answer
mid-shift, and, when there is no answer, to reach the person who has it.

Case study for the Design Engineer role. Built in doinstruct's own stack:
SvelteKit 2, Svelte 5 runes, Tailwind v4, TypeScript, fully static.

```bash
npm install
npm run dev      # prototype at /, design system at /system
npm run check    # types, contrast, and no literal text. 0 errors.
npm run build    # static output, roughly 52 KB gzipped for the route a worker loads
```

## The slice

**Operational knowledge. Voice primary, text fallback.** One scenario: a food
production filling line, a Romanian-speaking maintenance technician, German
source documentation, mid-shift.

**What I cut, and why it's a constraint rather than a preference.** In a hygiene
zone personal phones are frequently restricted, so the realistic device is
shared and wall-mounted. On a shared device with no login, HR questions such as
payroll and holiday need per-worker authentication, which breaks doinstruct's
own no-password principle. Operational knowledge isn't private, so it survives
on a shared device. Voice is primary because wet, gloved hands can't type.

The environment picks the domain. That ordering is the point.

## The product argument

This is a routing problem rather than a Q&A problem. The brief's own words:
*"the answer is a colleague or supervisor away. So they wait."* An assistant
that answers seven questions in ten and shrugs at the rest has rebuilt the
dead-end it was meant to remove.

So the flow deliberately includes the miss:

**ask** then **answer**, or **refuse** on safety, or **route to a named human**,
then **capture their answer** so it becomes the next instant answer, with an
audit entry attached.

That loop is the only defensible story for how a thin LLM wrapper becomes an
operating system, and it compounds into the compliance product doinstruct
already sells.

## Three states, three scenarios

The **Demo** panel at the bottom right is deliberately not product UI. It
switches between the only three things this product can do:

1. **Answer.** Fault code E-212, grounded in the manual, with provenance.
2. **Refuse.** A guard-door bypass request, met with an explicit safety stop.
3. **Route.** A knocking capper that isn't in any manual, escalated to Marek.

It also toggles live versus scripted microphone, a loud room, and offline.

## Where to look

| Document | What it covers |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | The main deliverable. Stack traps, the non-negotiables, and an index of when to load the rest. |
| [`docs/rules/behaviour.md`](docs/rules/behaviour.md) | How an agent should work here. Dependency lock, never weaken a check, don't invent to fill a gap. |
| [`docs/rules/content.md`](docs/rules/content.md) | Copy, interpolation, locked safety terminology, reading level, locale formatting. |
| [`docs/rules/accessibility.md`](docs/rules/accessibility.md) | Target spacing, focus, live regions, logical properties, the four required states. |
| [`docs/handover-proof.md`](docs/handover-proof.md) | Three prompts run, including one **cold**, with a full audit of what the agent got wrong. |
| [`handover-prompt-3` branch](https://github.com/tylerhagan/doinstruct-ask/compare/master...handover-prompt-3) | Raw, unedited output of the cold run. Committed exactly as produced. |
| [`docs/frontline-reality.md`](docs/frontline-reality.md) | Low-end devices, noise, gloves, languages, literacy, lighting. |
| [`docs/decision-log.md`](docs/decision-log.md) | What I learned, what changed, and why. |
| [`src/lib/design/tokens.json`](src/lib/design/tokens.json) | Tokens, with the reasoning for every divergence from convention. |
| [`scripts/check-contrast.mjs`](scripts/check-contrast.mjs) | A prose rule turned into a build failure. Found 5 defects. |
| [`scripts/check-i18n.mjs`](scripts/check-i18n.mjs) | The second one. Found 4 German `aria-label` values in seconds. |
| `/system` route | Every component in every state. |

## On the brand

The palette uses doinstruct's exact swatch values, read from the production
stylesheet rather than estimated by eye. Two of them needed adjusting for this
context and both are recorded in `tokens.json` with the reasoning:
`--swatch--mid-green` measures 4.6:1 on the off-white, and `--swatch--light-green`
measures 1.65:1, which is invisible as a structural border. Good marketing
values, neither of which survives washdown glare. I darkened both and kept the
hue.

The accent is called yellow here because that is what doinstruct's own system
calls it.

The one deliberate departure is the typeface. doinstruct uses Manrope; this ships
a system font stack and zero font bytes. On a five-year-old Android over plant
wifi, a web font is a request that can fail and a layout shift that lands in
front of someone whose line is stopped.

## Why Svelte, given I've shipped React and not Svelte

Because the fourth ask is a design system an engineer takes and ships with two or
three prompts, and a React system makes that sentence impossible for this team.

It also turned out to be the more interesting problem. Svelte 5 runes and
Tailwind v4 both replaced the APIs that dominate model training data, so agents
write confident, plausible, wrong code in this stack: Svelte 4 stores, and a
`tailwind.config.js` that doesn't exist here. doinstruct's goal of agents
producing more than 95% good UI is currently failing for a specific, diagnosable
reason. `AGENTS.md` is the fix.

The weakness of the tooling is why the work matters rather than an obstacle to
it.
