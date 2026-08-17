<!--
	@component
	PageHeader: the dark band at the top of every office screen.

	CONTRACT
	- title: page title, already translated
	- lede:  one supporting line
	- stats: [{ value, label }] up to four, the state of the world before the detail

	WHY A BAND AND NOT A HEADING
	The rail is dark and the page was cream from its first pixel, so the brand
	ground stopped at a vertical stripe on the far left and the rest read as any
	admin tool. Extending it across the top turns the chrome into an L: the
	product wraps the content instead of standing beside it, and the title gets
	the same authority as the navigation.

	It is also better information design. A supervisor's screen is scanned, not
	read, so the summary belongs above the detail. The queue's own length is the
	thing they most need before they start, and it was previously a small grey
	line inside a panel header.

	RULES
	- Figures are display size and tabular. They are the reason to look up here,
	  and a number set at label size is a number nobody reads.
	- The halftone runs behind at low opacity. It is doinstruct's own dot-matrix
	  motif and it is decorative, so it carries `aria-hidden` and no meaning.
	- `ground-dark` so the focus ring flips to cream. Every dark surface in this
	  system needs it and forgetting it is invisible until someone tabs.
-->
<script lang="ts">
	interface Stat {
		value: string | number;
		label: string;
	}

	interface Props {
		title: string;
		lede?: string;
		stats?: Stat[];
	}

	let { title, lede, stats = [] }: Props = $props();
</script>

<header class="ground-dark relative overflow-hidden bg-surface-inverse text-fg-inverse">
	<div class="halftone absolute inset-0 opacity-15" aria-hidden="true"></div>

	<div class="relative flex flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
		<div>
			<h1 class="text-display font-bold text-balance">{title}</h1>
			{#if lede}
				<p class="mt-2 max-w-prose text-small text-fg-inverse-muted">{lede}</p>
			{/if}
		</div>

		{#if stats.length}
			<dl class="flex flex-wrap gap-x-10 gap-y-4">
				{#each stats as stat (stat.label)}
					<div>
						<dd class="text-hero font-bold tabular-nums">{stat.value}</dd>
						<dt class="mt-1 text-meta font-bold tracking-wide text-fg-inverse-muted uppercase">
							{stat.label}
						</dt>
					</div>
				{/each}
			</dl>
		{/if}
	</div>
</header>
