<!--
	@component
	SourceChip: provenance for an answer.

	CONTRACT
	- source:   Source (required)
	- onopen?:  () => void: opens the underlying document at the cited page

	RULES
	- Every answer renders at least one SourceChip. An answer about a machine with
	  no provenance is a liability; doinstruct's product is built on audit trails.
	- The `updatedAt` date is always visible. Stale documentation is a hazard, and
	  hiding its age transfers that risk to the worker silently.
	- When the source language differs from the answer language, say so. A worker
	  who opens a German PDF after a Romanian answer must not be surprised.
-->
<script lang="ts">
	import type { Source } from '$lib/domain/types';
	import { LANGUAGE_LABEL } from '$lib/domain/types';
	import { session } from '$lib/state/session.svelte';
	import { t } from '$lib/i18n/floor';

	interface Props {
		source: Source;
		onopen?: () => void;
	}

	let { source, onopen }: Props = $props();

	const translated = $derived(source.language !== session.language);

	const ageDays = $derived(
		Math.round((Date.now() - new Date(source.updatedAt).getTime()) / 86_400_000)
	);

	const age = $derived(
		ageDays < 60
			? `${ageDays} ${t('source.daysOld')}`
			: `${Math.round(ageDays / 30)} ${t('source.monthsOld')}`
	);

	/**
	 * Old enough to be the reason the answer is wrong.
	 *
	 * A year is where a maintenance document stops being current in a plant that
	 * changes cleaning agents, retrofits guards and swaps suppliers. The age was
	 * already shown, buried in a middle-dot list between the page number and the
	 * source language, where nobody would ever read it. It is the single most
	 * decision-relevant fact about a source, so it gets weight when it matters.
	 *
	 * Emphasis on words that are already there, never colour alone: the label
	 * still reads "19 Monate alt" whether or not anyone can see the colour.
	 */
	const stale = $derived(ageDays > 365);
</script>

<button
	type="button"
	onclick={onopen}
	class="flex min-h-tap w-full touch-manipulation items-center justify-between gap-4
	       rounded-md border-2 border-hairline bg-surface-raised px-4 py-3 text-left transition-colors"
>
	<!--
		Laid out as a citation rather than as a navigation row. Every answer in this
		product carries provenance, and provenance that looks like a list item is
		provenance nobody reads.
	-->
	<span class="min-w-0">
		<span class="block text-small font-bold text-fg">{source.document}</span>
		<span class="block text-meta text-fg-muted">
			{source.section} · {t('source.page')}
			{source.page}
			{#if translated}
				· {t('source.from')} {LANGUAGE_LABEL[source.language]}
			{/if}
		</span>
		<span class="mt-1 block text-meta {stale ? 'font-bold text-caution' : 'text-fg-muted'}">
			{age}
		</span>
	</span>

	<!-- Decorative: the button's own text already names the action. -->
	<svg
		class="size-6 shrink-0 text-fg-muted"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		aria-hidden="true"
	>
		<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</button>
