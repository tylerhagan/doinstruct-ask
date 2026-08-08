# Frontline reality

The brief asks how this holds up on low-end devices, in noisy or hands-busy
conditions, and across languages and digital literacy. Each claim below is
something in the code rather than an aspiration.

---

## Low-end devices and bad connectivity

| Measure | Value |
| --- | --- |
| JavaScript, gzipped | **48 KB** |
| CSS, gzipped | **4 KB** |
| HTML, gzipped | **2 KB** |
| Web fonts | **0 bytes** |
| Server round trips to first paint | **0**, fully prerendered |

Reproduce with `npm run build`.

- **Zero web font bytes.** A system font stack renders instantly and cannot cause
  a layout shift when a font request times out on plant wifi. Losing a typeface I
  control is a real cost. A technician staring at invisible text while a line is
  down is a larger one.
- **`adapter-static`.** No server, no cold start, cacheable at the edge or by a
  service worker. After first load this is deliverable from cache.
- **No shadows, no positional animation, nothing over 200ms.** All cheap to paint
  on a five-year-old mid-range Android, which is the actual device population.
- **Read-aloud uses the platform speech synthesiser** rather than a network TTS
  call, so it still works when the cold-store wifi drops.

## Noise, at 85 to 95 dB on a filling line

- **Hold to talk, never open mic.** Recognition is bounded to the moment the
  worker is deliberately speaking, so ambient line noise is never being
  transcribed.
- **`LevelMeter` is functional rather than decorative.** In a loud room there is
  no audio feedback, so the meter is the only evidence the device can hear them.
- **Ambient noise is measured rather than assumed.** `recognition.svelte.ts`
  samples the room's noise floor over the first thirty frames. Above the
  threshold the UI offers the text path *before* recognition fails rather than
  after.
- **`TranscriptConfirm` is mandatory and never auto-skipped on high confidence.**
  Mis-recognition is normal here, and a technician acting on a misheard fault
  code is the exact failure this product exists to prevent. Low-confidence words
  are marked, and in the demo the marked word is the fault code, which is the
  token you most need to get right.

## Hands busy, gloves, wet surfaces

- **64px minimum tap target, 96px for push-to-talk.** WCAG 2.2 AAA asks for 44px,
  which assumes a bare fingertip. A cut-resistant glove has a contact patch of
  roughly 14 to 16mm and no proprioceptive feedback. The token carries this
  reasoning inline.
- **Pointer capture on the talk control**, so a finger sliding on a wet screen
  still produces a clean release rather than a dropped utterance.
- **`StepList` ticks persist.** A technician reads a step, puts the device down,
  does the work, and comes back. "Where was I" is the most common failure of
  paper procedures on a line.
- **Tap targets span the whole row.** Precision tapping with gloves is not a
  reasonable expectation.
- **Read-aloud** covers the case where hands and eyes are both committed.

## Languages

- **Three languages ship, down to the procedure steps**, not just the chrome.
  Switching language changes the answer itself. Translated buttons sitting over
  untranslated content would be a lie about the capability.
- **The German uses the informal "du" rather than "Sie".** These are colleagues
  on a line rather than customers, and "Sie" reads as management talking at them.
- **Language buttons are labelled in their own script**, so "Română" rather than
  "Romanian". Someone scanning for their language does not read the interface
  language.
- **Source language is disclosed.** When the answer is Romanian and the manual is
  German, `SourceChip` says so, so opening a German PDF is never a surprise.
- **Nothing truncates.** German compounds and Romanian diacritics both overflow,
  and a truncated safety instruction is a hazard.
- **Enforced, not trusted.** `scripts/check-i18n.mjs` fails the build on any
  literal text in component markup, including `aria-label`. It found four German
  `aria-label` values the moment it existed, all mine. Those are invisible on
  screen and read German aloud to a Romanian speaker using a screen reader.

## Digital literacy

- **No login, no download, no install.** This is doinstruct's own product
  principle and the prototype honours it. It is also what scoped this work to
  operational knowledge, since HR questions would need per-worker authentication
  on a shared device and that breaks the principle.
- **No settings screen.** Two controls exist, language and contrast, both in the
  persistent bar. A shared device has nobody to own preferences.
- **Every icon is paired with text.** The microphone is the one control that must
  never be guessed at.
- **Confidence is stated in words, never as a percentage.** "87% confident" is
  meaningless to someone holding a wrench, and worse than useless in an audit.
- **Machine context is displayed, never typed.**

## Lighting

- **High contrast is a lighting condition rather than a preference.** Washdown
  glare and dim cold stores are both real. Toggling it takes every border to 2px
  and strips decorative fills.
- **No text token below 7:1**, enforced by `scripts/check-contrast.mjs` on every
  `npm run check`. AA's 4.5:1 is not enough under glare. This check found five
  pairs that did not meet the rule I had written down, four of them mine.
- **Hierarchy from border and surface, never shadow.** Soft shadows are invisible
  under bright plant lighting, and this keeps the system legible when a customer
  prints a screen onto a laminated card for the line, which they do.

## Two things a German customer will ask about before they buy

- **The works council.** Hold to talk makes "this device is not listening to you"
  a physical property of the control rather than a policy promise. An always-on
  microphone on a production floor is a co-determination fight, and it is
  avoidable.
- **Safety liability.** The assistant refuses rather than degrades. Guard-door
  interlocks and lockout and tagout produce an explicit stop and a named
  qualified person, never a hedged procedure. Every answer carries provenance
  with the document's age visible, because stale documentation is a hazard and
  hiding its age quietly transfers that risk to the worker.

---

## What I did not build, and would want to

- **Offline answering.** The shell is cacheable but retrieval is not. A small
  on-device index of the top two hundred or so fault codes per line would cover
  most of what gets asked when connectivity drops.
- **Shift-aware routing.** `Responder.onShift` exists in the model and the UI
  reads it, but there is no real rota behind it.
- **Speech recognition tuned for accented German over machine noise.** This is
  the single largest technical risk in the product and it cannot be honestly
  prototyped in a browser, which is why the demo carries a scripted mode
  alongside the live one.
