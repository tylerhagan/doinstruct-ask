# Copy, language and formatting

Load whenever a task adds or changes any text a worker will read or hear.

The reader is a maintenance technician mid-shift. They may be reading in their
third language, through safety glasses, at arm's length, while a line is stopped
and a supervisor is waiting. Write for that person.

---

## 1. All copy goes through `t()`

Add a key to `src/lib/i18n/strings.ts` with all three languages, then call
`t('key')`. This is enforced by `scripts/check-i18n.mjs`.

This includes `aria-label`, `placeholder`, `title` and `alt`. A German
`aria-label` in front of a Romanian speaker's screen reader is the same defect as
a German button, and it is harder to spot. Four of these were found in this
codebase the moment the check existed.

## 2. Never build a sentence by concatenation

```ts
// Wrong. Word order is not universal, and this cannot be translated.
`${count} ${t('items')} ${t('found')}`;

// Right. The whole sentence is one key, with slots.
t('search.results', { count });
```

Concatenation produces grammatical nonsense in German and Romanian that no type
check will catch, because each fragment is individually valid. Interpolation must
go through the `vars` parameter so a translator can move the slot.

## 3. Locked terminology

These terms are fixed. Never paraphrase them, never substitute a synonym, and
never let a translation drift.

| Locked term | Never write |
| --- | --- |
| Not-Aus | Notstopp, Notabschaltung, Emergency Off |
| Schutztür | Schutzklappe, Tür, guard |
| Verriegelung | Sperre, Sicherung |
| Freischaltung | Abschaltung, Trennung |
| Schichtbuch | Logbuch, Protokoll |

A worker learns the word that is printed on the machine and written in the
procedure. An unfamiliar synonym for an emergency stop is a hazard, not a style
variation. If a task needs a new safety term, it goes in this table first.

## 4. Write for A2 to B1

- One instruction per step. If a step contains "and then", it is two steps.
- Imperative voice. "Put the line into standby", not "the line should be put
  into standby".
- Short sentences. If it needs a comma to hold together, consider splitting it.
- No idioms, no metaphors, no humour. None of them survive translation, and all
  of them cost comprehension.
- No stacked negation. "Do not proceed without gloves" becomes "Put on gloves
  first".
- Numerals, not words. "5 bottles", not "five bottles".
- Say the thing, then the reason. "Do not use emergency stop. It causes a format
  loss." The instruction must survive being read alone.

## 5. Confidence is stated in words, never as a number

"87% confident" is meaningless to someone holding a wrench and worse than
useless in an audit. Use the three states in the domain model: sourced, partial,
none. A `partial` answer must name what to verify and who verifies it. A hedge
with no named next action is an unhelpful answer wearing a disclaimer.

## 6. Formatting follows the locale, not the developer

- **Decimal separator.** German uses a comma. A torque figure is "4,5 Nm" and
  never "4.5 Nm". Getting this wrong on a specification is a real error, not a
  cosmetic one.
- **Time.** 24-hour clock throughout. No AM or PM.
- **Dates.** ISO (`2026-05-02`) in data and audit references. Never US ordering.
- **Units.** Metric only.
- **Never hardcode a format.** Use `Intl` with the active language.

## 7. Copy that must never appear

- Apologies from the assistant. It refuses or it routes; it does not say sorry.
- "Oops", "Whoops", or any playful error voice. A stopped line is not playful.
- Placeholder or lorem text of any kind, in any state, at any time.
- Blame directed at the worker. If input failed, the system failed.
