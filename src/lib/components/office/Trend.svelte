<!--
	@component
	Trend: six weeks of one series, as a small line.

	CONTRACT
	- values:   number[], oldest first. Empty means there is nothing to draw.
	- labels:   x labels, same length as values. Identifiers, so not localised.
	- tone:     stroke colour class, e.g. `text-series-1`
	- title:    accessible name for the figure
	- tooFew:   what to say when there is not enough data

	RULES (docs/rules/dataviz.md)
	- One series, so no legend: the title names it.
	- 2px stroke, markers at least 8px. Thin marks, recessive axis.
	- Values are printed as text beneath, so the shape is never the only carrier.
	  This is also what makes it readable at high contrast, and it is the table
	  view for a series this short.
	- Four points is not a trend. When there is too little data the component
	  says so rather than drawing a confident line through noise, because this
	  product's whole argument is that it does not do that.
	- No y axis and no gridlines. A six-point sparkline with a labelled axis is
	  chart furniture around four pixels of data.
-->
<script lang="ts">
	interface Props {
		values: number[];
		labels: string[];
		tone?: string;
		title: string;
		tooFew: string;
	}

	let { values, labels, tone = 'text-series-1', title, tooFew }: Props = $props();

	/** Below this a line is pattern-matching, not evidence. */
	const MIN_POINTS = 4;

	const enough = $derived(values.length >= MIN_POINTS);
	const peak = $derived(Math.max(1, ...values));

	const W = 100;
	const H = 28;

	const points = $derived(
		values.map((value, i) => {
			const x = values.length === 1 ? W / 2 : (i / (values.length - 1)) * W;
			const y = H - (value / peak) * H;
			return { x, y, value };
		})
	);

	const path = $derived(points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '));
</script>

<figure class="min-w-0">
	<figcaption class="text-meta font-bold text-fg-muted">{title}</figcaption>

	{#if !enough}
		<p class="mt-1 text-meta text-fg-muted">{tooFew}</p>
	{:else}
		<!--
			The marker is an HTML element, not an SVG circle.

			The plot stretches to its container with `preserveAspectRatio="none"`,
			which is right for the line and fatal for a circle: non-uniform scaling
			turns `r="4"` into a flat ellipse, and at these proportions it rendered
			as a smear on the end of the line. `vector-effect` fixes strokes, not
			geometry. Positioning the dot in HTML sidesteps the transform entirely,
			and the last point is always at x = 100%, so it only needs a top offset.
		-->
		<div class="relative mt-2 h-8 {tone}">
			<svg
				viewBox="0 0 {W} {H}"
				preserveAspectRatio="none"
				role="img"
				aria-label={title}
				class="h-full w-full"
			>
				<path
					d={path}
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					vector-effect="non-scaling-stroke"
				/>
			</svg>
			<!-- Only the last point gets a marker: it is the one that means "now". -->
			<!--
				No horizontal translate. Pulling the dot half its width past the end
				would clip it against the panel edge, and mixing a logical inset with a
				physical translate breaks in right-to-left anyway. Sitting just inside
				the end reads the same and survives both.
			-->
			<span
				class="absolute size-2 -translate-y-1/2 rounded-full bg-current ring-2 ring-surface"
				style="inset-inline-end: 0; top: {(points[points.length - 1].y / H) * 100}%"
			></span>
		</div>

		<!-- The numbers, which are the table view for a series this short. -->
		<div class="mt-1 flex justify-between gap-1">
			{#each values as value, i (labels[i])}
				<span class="text-meta text-fg-muted tabular-nums">{value}</span>
			{/each}
		</div>
		<div class="flex justify-between gap-1">
			<span class="text-meta text-fg-muted">{labels[0]}</span>
			<span class="text-meta text-fg-muted">{labels[labels.length - 1]}</span>
		</div>
	{/if}
</figure>
