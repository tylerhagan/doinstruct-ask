<!--
	@component
	Panel: a filled surface with a hairline, and optionally elevation.

	CONTRACT
	- title:     optional heading text (already translated by the caller)
	- lede:      optional supporting line under the title
	- elevation: 'flat' | 'raised' | 'overlay'   (default 'flat')
	- level:     heading level, 2 or 3           (default 2)
	- children:  the body
	- actions:   optional snippet, rendered top-right of the header

	RULES
	- Fill and a hairline, never an outline on a flat ground. Outlined boxes read
	  as a wireframe no matter how correct the spacing is, which was the single
	  loudest piece of feedback on the first version of this product.
	- Elevation is decoration on top of that, never the boundary itself. At high
	  contrast the shadow tokens resolve to `none` and the hairline goes black,
	  so a panel that leaned on its shadow would simply dissolve.
	- The heading level is a prop rather than inferred, because a panel does not
	  know where it sits in the document and a skipped level is a real barrier
	  for anyone navigating by headings.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		lede?: string;
		elevation?: 'flat' | 'raised' | 'overlay';
		level?: 2 | 3;
		actions?: Snippet;
		children: Snippet;
		class?: string;
	}

	let {
		title,
		lede,
		elevation = 'flat',
		level = 2,
		actions,
		children,
		class: className = ''
	}: Props = $props();

	/**
	 * `flat` is not "no elevation", it is "on the page".
	 *
	 * Every panel was flat to begin with, which left white cards drawn on a grey
	 * ground with a hairline and no separation, and that flatness was most of what
	 * read as unfinished. A content panel sits ON the page; it is not printed on
	 * it. The floor gets none of this, because a shadow is invisible under
	 * washdown lighting and gone when a screen is printed to a laminated card.
	 */
	const SHADOW = {
		flat: 'shadow-raised',
		raised: 'shadow-raised',
		overlay: 'shadow-overlay'
	} as const;
</script>

<section class="rounded-lg border border-hairline bg-surface {SHADOW[elevation]} {className}">
	{#if title}
		<header class="flex items-start justify-between gap-4 border-b border-hairline px-4 py-3">
			<div class="min-w-0">
				{#if level === 2}
					<h2 class="text-lead font-bold">{title}</h2>
				{:else}
					<h3 class="text-small font-bold">{title}</h3>
				{/if}
				{#if lede}
					<p class="mt-1 max-w-prose text-meta text-fg-muted">{lede}</p>
				{/if}
			</div>
			{#if actions}
				<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
			{/if}
		</header>
	{/if}
	{@render children()}
</section>
