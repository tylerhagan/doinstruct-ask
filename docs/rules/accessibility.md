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

## 6. Every interactive element has an accessible name

Buttons get real text. Icon-only controls get a translated `aria-label`, which
means a `t()` key, never a literal.

## 7. Use logical properties, not physical ones

doinstruct advertises 35+ languages, and that list includes **Arabic and Dari**,
both of which are right to left.

Write `ps-4` rather than `pl-4`, `text-start` rather than `text-left`, `end-4`
rather than `right-4`, `ms-auto` rather than `ml-auto`. Tailwind v4 supports all
of these directly, and they cost nothing in a left-to-right language.

**Known gap:** the existing components use physical properties, so this system is
not RTL-ready today. The rule is here so that new work does not deepen the hole,
and the gap is named in the writeup rather than hidden. Migrating is mechanical;
retrofitting a layout that assumed direction is not.

## 8. Every new surface handles four states

Happy path is one of four. A surface is not complete until it handles:

1. **Loading.** With an escape. Never block a worker behind a spinner with no way
   out.
2. **Empty.** Saying what to do next, not just that there is nothing.
3. **Error.** What went wrong and what to do, in the worker's language, without
   blame.
4. **Offline.** This product is used in cold stores and basements. Say what still
   works rather than failing silently.

## 9. Motion

Nothing animates position, and nothing runs longer than 200ms. A worker who
glances away for two seconds must find the screen where they left it. All motion
respects `prefers-reduced-motion`.
