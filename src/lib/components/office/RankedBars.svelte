<!--
	@component
	RankedBars: a handful of named things, sorted by value.

	Ranking a small set by magnitude is what horizontal bars are for. Not a pie,
	which asks people to compare angles; not a column chart, which cannot hold a
	document title as a label without turning it sideways.

	CONTRACT
	- rows:       [{ id, label, detail, count, tone }]  count null means suppressed
	- max:        the value the longest bar represents
	- valueLabel: accessible name for the value column

	RULES (docs/rules/dataviz.md)
	- One nominal series, so every bar takes the same slot. Colouring bars by
	  their own value spends the identity channel re-encoding what length already
	  shows.
	- A 4px radius on the data end, square against the baseline. A bar curved at both
	  ends lies about where it starts.
	- 2px of surface between bars, so neighbouring fills cannot merge.
	- Every bar is directly labelled, so identity and value never depend on
	  colour. That also means this chart is readable at high contrast, where the
	  fill drops to decoration.
	- A suppressed row renders the words, not a zero-length bar. A bar of length
	  zero says "none", and the whole point is that we are not saying.
	- A table view lives beside this in the page, not inside the component, so
	  the toggle can sit with the other page-level controls.
-->
<script lang="ts">
	interface Row {
		id: string;
		label: string;
		detail?: string;
		count: number | null;
		/** Series slot class, e.g. `bg-series-1`. Follows the entity, not the rank. */
		tone: string;
	}

	interface Props {
		rows: Row[];
		max: number;
		suppressedLabel: string;
	}

	let { rows, max, suppressedLabel }: Props = $props();

	/** Never below 2% or a small non-zero value renders as nothing at all. */
	const width = (count: number) => Math.max(2, (count / max) * 100);
</script>

<div class="flex flex-col gap-0.5">
	{#each rows as row (row.id)}
		<div class="py-2">
			<div class="flex items-baseline justify-between gap-x-4">
				<div class="min-w-0">
					<p class="text-meta font-bold">{row.label}</p>
					{#if row.detail}
						<p class="text-meta text-fg-muted">{row.detail}</p>
					{/if}
				</div>
				{#if row.count !== null}
					<p class="shrink-0 text-meta font-bold tabular-nums">{row.count}</p>
				{/if}
			</div>

			<div class="mt-1">
				{#if row.count === null}
					<!--
						The suppression message sits on the bar's own line rather than in
						the value column. As a value it is several words wide, and a
						two-column grid sized to `auto` let it squeeze the label into a
						four-character ribbon.

						Deliberately no mark either. A zero-length bar would read as
						"none happened", and the whole point is that we are not saying.
					-->
					<div class="flex items-center gap-3">
						<div class="h-2 flex-1 rounded-xs border border-dashed border-hairline"></div>
						<p class="shrink-0 text-meta text-fg-muted">{suppressedLabel}</p>
					</div>
				{:else}
					<!--
						A data-driven width is geometry rather than a design decision, so
						it is the one place an inline style is correct here. Nothing about
						the mark's colour or radius is inline.
					-->
					<div class="h-2 rounded-e-xs {row.tone}" style="width: {width(row.count)}%"></div>
				{/if}
			</div>
		</div>
	{/each}
</div>
