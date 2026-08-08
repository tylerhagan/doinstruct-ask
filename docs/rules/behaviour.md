# Agent conduct

Load before any task that changes code. These are the rules about how to work
here, as opposed to what the UI should look like.

They exist because the failure modes below are the ones that compile cleanly,
pass every check, and are invisible in review. Nothing here is stylistic.

---

## 1. `package.json` is closed

Do not add a dependency. Not a date library, not an icon set, not a headless UI
kit, not a utility belt.

The frontline-reality claims in this project rest on 48 KB of gzipped
JavaScript, which is the budget that makes the product usable on a five-year-old
Android over plant wifi. A single convenience dependency can double it, and the
loss will not show up in any test.

If a task genuinely requires a new dependency, stop and say so, with the reason
and the transfer cost. That is a human decision.

## 2. Never weaken a check to make it pass

This is the most damaging thing you can do in this repository.

If `check-contrast.mjs` reports 6.4:1 against a 7:1 minimum, darken the colour.
Do not lower the threshold. If `check-i18n.mjs` finds a literal string, move it
into `strings.ts`. Do not add the file to the allow-list.

The checks encode safety and accessibility commitments. A check edited to pass is
worse than no check, because it converts a known gap into a false assurance.

The same applies to `@ts-ignore`, `svelte-ignore`, `eslint-disable` and
`!important`. If you believe one is genuinely warranted, add it with a comment
naming the reason, and mention it in your summary so a human sees it.

## 3. Do not invent to fill a gap

If a token, a component or a string key does not exist, that is information. It
usually means the design intent is undefined, and inventing something plausible
silently forks the system.

Stop and ask. A blocked task with a clear question is a better outcome than a
task completed against an invented rule.

This applies with particular force to domain content. Do not invent a part
number, a fault code, a torque figure, a document section reference or a
response time. Fabricated specifics in a maintenance product are a safety
problem, not a placeholder problem.

## 4. Do not create files or abstractions speculatively

Add a component when there is a second real use, not in anticipation of one. Do
not introduce a folder, a barrel export, a config layer or a wrapper unless the
task requires it.

Prefer editing an existing file over creating a new one.

## 5. Stay inside the task

Do not reformat code you were not asked to touch, do not rename things in
passing, and do not upgrade dependencies as a side effect. A diff that contains
unrelated churn cannot be reviewed properly, so the real change hides inside it.

Do not edit `AGENTS.md` or anything in `docs/rules/` as part of a feature task.
Proposing a rule change is a separate conversation.

## 6. Verify, then report honestly

Run `npm run check` and `npm run build`. Both must pass.

When you report, say what you actually did. If you could not satisfy a rule, say
which one and why. If you worked around something, say so. If you are unsure
whether a change is correct, say that too.

In a safety-adjacent product, a silent workaround is worse than a blocked task,
and confident wrong output is the specific failure this whole repository is
built to guard against.
