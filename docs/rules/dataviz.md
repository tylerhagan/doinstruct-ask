# Data visualisation

Load whenever a task renders a chart, a scale, a stat tile, or anything else
that turns numbers into shapes. Office register only. There are no charts on the
floor, and there is no reading a distribution through a face shield.

Two things make charts risky here rather than merely fiddly. Every mark is a
claim about people's work, and this workforce skews male, so roughly one in
twelve readers has a colour vision deficiency. Both are addressed below, and
neither is optional.

---

## 1. Pick the form before you pick the colour

The order matters and it is the order most charts get wrong. Ask what the data's
job is, then choose:

| The job                            | The form                                |
| ---------------------------------- | --------------------------------------- |
| One number that is the whole story | A stat tile. Not a chart.               |
| Ranking a handful of named things  | Horizontal bars, sorted by value        |
| Change over time                   | A line, or an area if the total matters |
| Composition at one moment          | A stacked bar, never a pie              |
| Two measures on different scales   | **Two charts.** Never two y-axes.       |

The dual-axis chart is the single most common serious mistake in this genre. It
lets you draw any correlation you like by choosing the scales, so it is not a
chart, it is a rhetorical device. If you need two measures, use two charts, small
multiples, or index both to a common base.

## 2. The three colour sets, and which does what

| Set    | Tokens                                        | Encodes                        |
| ------ | --------------------------------------------- | ------------------------------ |
| Series | `--color-series-1` to `-5`                    | Identity. Which thing this is. |
| Scale  | `--color-scale-1` to `-5`                     | Magnitude. How much.           |
| Status | `--color-stop`, `-caution`, `-ok`, `-pending` | State. Reserved meaning.       |

Never mix them. A series that _means_ good or bad, such as a refusal rate, wears
status tokens. A series that is just "the third machine" wears series tokens. It
is never both in one chart, and status colours are never borrowed to make a sixth
series.

**Series rules:**

- **Fixed order, assigned in sequence, never cycled.** Series one takes slot one.
  A sixth series does not get a new hue; it folds into "Other", or the chart
  becomes small multiples.
- **Colour follows the entity, never its rank.** If a filter drops a series, the
  survivors keep their colours. A chart that repaints when you filter it teaches
  the reader that colour means nothing.
- **The all-pairs cap is three.** In scatter, bubble and small-multiple forms any
  two marks can end up touching, and series 4 and series 2 collapse to a
  difference of 1.0 under deuteranopia when they are not adjacent in a stack. Bar
  and line charts, where only neighbours touch, may use all five.

**Scale rules:** one hue, light to dark, always. Never a rainbow. The steps are
already checked for ordering by `scripts/check-contrast.mjs`, so use them as
given rather than picking three of the five and hoping.

## 3. Never colour alone, which here means labels

WCAG 1.4.1 again, and the same reasoning as the safety banner.

- Two or more series always get a legend.
- Four or fewer series are **also** labelled directly on the marks.
- Selective labels only. A number on every point is noise, not diligence.
- **Text wears text tokens, never the series colour.** Values, axis labels and
  legend text stay in `text-fg` or `text-fg-muted`. A coloured swatch beside the
  label carries the identity. Coloured text carries a contrast problem.
- Every chart has a table view. It is the fallback for a screen reader, for
  print, and for the reader who simply wants the numbers.

**At high contrast, every mark prints its value as text.** The palette does not
change, because both sets were validated against white as well as cream. What
changes is that colour drops to decoration and the numbers carry the meaning. A
chart stops being a picture and becomes a table you can still read at a glance.

## 4. Marks

- Thin marks. A bar chart of six items should not look like six buildings.
- A 2px gap of surface colour between adjacent fills, in stacked segments and
  between neighbouring bars alike. Touching fills of similar lightness merge.
- 4px rounded ends on the data end of a bar, square against the baseline. A bar
  rounded at both ends lies about where it starts.
- 2px lines. Markers at least 8px, or they are unhittable.
- Gridlines use `--color-hairline` and the baseline uses `--color-border`. Both
  are recessive on purpose: the data is the foreground.

## 5. Interaction is not optional

An HTML chart is interactive whether or not you planned for it.

- Line and area charts get a crosshair and a tooltip.
- Bar, dot and cell charts get a per mark tooltip.
- Hit targets are larger than the marks.
- Filters sit in one row above the chart, at `--spacing-control` height.
- A bare stat tile with no plot is the only form that skips all of this.

## 6. What a chart in this product may not show

These are not visual rules and they still belong here, because the chart is where
the temptation lives.

- **Never a person.** No chart resolves to an individual, and no filter
  combination may either. See `docs/office-surface.md`, which sets out why:
  present tense identity is operationally necessary, and historical accumulation
  is performance monitoring.
- **Role, team and group are not grouping dimensions.** They re-identify at small
  counts. One night shift electrician is a name, not a cohort.
- **Minimum count of five.** Any bucket below it reads "too few to show" rather
  than a number. Suppression happens in the data layer, before the chart sees it,
  so a chart cannot leak what it was never given.

## 7. Copy in a chart is still copy

Every axis label, legend entry, tooltip heading and empty state goes through
`t()` in all three languages, exactly as everywhere else. Enforced by
`scripts/check-i18n.mjs`.

Numbers follow the locale. German uses a decimal comma, dates are ISO, times are
24 hour. Identifiers such as an asset ID or a fault code are never translated;
their descriptions always are. The rule and its reasoning are in
`docs/rules/content.md`.

Use `tabular-nums` for any column of figures a reader scans down. Proportional
figures elsewhere.

## 8. Empty, loading and too small

The four required states from `accessibility.md` apply to charts, and one of them
has a chart specific form. A chart with too little data is not an error and not
an empty state. It says how much data it has and what would make it useful, for
example "three questions in this period, too few to show a trend". Drawing a
confident trend line through four points is the visual equivalent of a
hallucination, and this product's entire argument is that it does not do that.
