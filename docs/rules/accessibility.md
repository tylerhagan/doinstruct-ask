# Accessibility and interaction

Load whenever a task adds an interactive element, a new screen, or a state
transition.

Two reasons this matters commercially as well as ethically. The European
Accessibility Act has applied since June 2025, and doinstruct sells B2B into
Germany, so this shows up in procurement. And the physical environment already
removes most of the margin: gloves, noise, glare and a shared device mean the
accessible choice and the usable choice are usually the same choice here.

---

## 1. Physical sizing

- Nothing interactive below **64px** (`min-h-tap`). The push-to-talk control is
  **96px** (`min-h-tap-primary`).
- **Minimum 12px between adjacent targets.** Gloved mis-taps are the dominant
  input error, and an accidental tap on a safety control is not recoverable by
  undo. Two 64px buttons flush against each other is a defect.
- Tap targets span the whole row where a row is the unit of meaning. Precision
  tapping with gloves is not a reasonable expectation.

## 2. Focus must be managed on every transition

When the flow moves to a new phase, focus moves with it. Otherwise a keyboard or
screen reader user is left on a control that no longer exists, which is a dead
end inside a product whose entire thesis is removing dead ends.

- Move focus to the new screen's heading, or its first meaningful control.
- Never trap focus.
- Never remove a focus outline. The outline here is 4px because the device may
  be driven by a knuckle or a stylus.

**Known gap:** the prototype does not yet do this on phase change. It is listed
in the writeup rather than quietly omitted.

## 3. Announce what changed

- Content that appears in response to an action gets `aria-live="polite"`.
- `role="alert"` is reserved for safety stop. It interrupts, so overusing it
  trains people to ignore it.
- A recognised transcript is announced, because the worker needs to catch a
  mis-hearing before acting on it.

## 4. Never convey meaning by colour alone

WCAG 1.4.1, and it matters more than usual here: roughly 1 in 12 men has a colour
vision deficiency, and this workforce skews male.

Every status carries a shape or an icon **and** text, not just a colour. The
safety banner uses an octagon for stop and a triangle for caution, mirroring the
signage already on the floor. A red border with no words is not a warning.

## 5. Every icon is paired with text

The microphone is the one control that must never be guessed at. Decorative
icons take `aria-hidden="true"` so they are not announced twice.

## 6. Headings descend one level at a time

One `h1` per page, and never a jump from `h2` to `h4`. Someone navigating by
headings uses the levels as the page's table of contents, and a skipped level
reads as a missing section rather than as a styling choice.

Two traps that both appeared in the office screens:

- **A badge is not a heading.** The Coverage groups are introduced by a coloured
  triage badge, which is a heading to a sighted reader and nothing at all to a
  screen reader. They carry an `sr-only` `h2` as well.
- **Name the section, not the content type.** Three sections all headed
  "Unanswered questions" are indistinguishable in a headings list. Each is named
  after its triage class instead.

`Panel` takes a `level` prop rather than guessing, because a component cannot
know where it sits in the document.

**Not enforced by a check yet.** It needs the built HTML rather than the source,
so it belongs in a post-build step. Listed here so the gap is known rather than
implied: this rule is currently prose, which this project has learned is a rule
with a half life.

## 7. Every interactive element has an accessible name

Buttons get real text. Icon-only controls get a translated `aria-label`, which
means a `t()` key, never a literal.

## 8. Use logical properties, not physical ones

doinstruct advertises 35+ languages, and that list includes **Arabic and Dari**,
both of which are right to left.

Write `ps-4` rather than `pl-4`, `text-start` rather than `text-left`, `end-4`
rather than `right-4`, `ms-auto` rather than `ml-auto`. Tailwind v4 supports all
of these directly, and they cost nothing in a left-to-right language.

**Known gap:** the existing components use physical properties, so this system is
not RTL-ready today. The rule is here so that new work does not deepen the hole,
and the gap is named in the writeup rather than hidden. Migrating is mechanical;
retrofitting a layout that assumed direction is not.

## 9. Every new surface handles four states

Happy path is one of four. A surface is not complete until it handles:

1. **Loading.** With an escape. Never block a worker behind a spinner with no way
   out.
2. **Empty.** Saying what to do next, not just that there is nothing.
3. **Error.** What went wrong and what to do, in the worker's language, without
   blame.
4. **Offline.** This product is used in cold stores and basements. Say what still
   works rather than failing silently, and in that order: a supervisor who can
   still read the queue has not lost their afternoon.

**Where this stands today, stated rather than implied.** Empty is handled on
every office screen and on the floor's queue. Offline is handled on both
registers, driven by the same session flag: the floor shows a badge, the office
shows `OfflineNotice` and disables publishing while keeping the draft.

Loading and error are **absent, on purpose**. The prototype is fully prerendered
against fixture data, so there is no request to be pending and none to fail.
Adding a spinner would be inventing a state to satisfy a checklist, which is the
same dishonesty as faking retrieval, and it would teach a reviewer nothing. When
this gets a backend they become real and they are the first thing to build.

## 10. Motion

Nothing animates position, and nothing runs longer than 200ms. A worker who
glances away for two seconds must find the screen where they left it. All motion
respects `prefers-reduced-motion`.
