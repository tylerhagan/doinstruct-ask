<!--
	Knowledge: what the assistant can answer now that it could not before.

	This is the surface that plugs into the compliance business doinstruct already
	sells. Every field on a card is one an auditor asks for, and the export is
	stubbed rather than faked, because a download button that produces a plausible
	PDF would teach a reviewer nothing except that I can make a download button.
-->
<script lang="ts">
	import { KNOWLEDGE } from '$lib/data/office';
	import type { KnowledgeEntry } from '$lib/domain/office';
	import { tOffice } from '$lib/i18n/office';
	import Panel from '$lib/components/office/Panel.svelte';
	import KnowledgeCard from '$lib/components/office/KnowledgeCard.svelte';
	import FilterGroup from '$lib/components/office/FilterGroup.svelte';
	import Button from '$lib/components/office/Button.svelte';

	type Review = KnowledgeEntry['review'];
	const REVIEWS: Review[] = ['current', 'due', 'superseded'];

	let review = $state<string>('all');

	const options = $derived([
		{ value: 'all', label: tOffice('queue.filterAll') },
		...REVIEWS.map((r) => ({ value: r, label: tOffice(`knowledge.review.${r}`) }))
	]);

	/** Newest first: the most recent capture is the one a supervisor just made. */
	const entries = $derived(
		KNOWLEDGE.filter((e) => review === 'all' || e.review === review).sort((a, b) =>
			b.publishedAt.localeCompare(a.publishedAt)
		)
	);

	/** The number that says the loop is working, and the only aggregate here. */
	const served = $derived(KNOWLEDGE.reduce((total, e) => total + e.served, 0));
</script>

<div class="flex flex-col gap-4">
	<header>
		<h1 class="text-title font-bold">{tOffice('knowledge.title')}</h1>
		<p class="mt-1 max-w-prose text-small text-fg-muted">{tOffice('knowledge.lede')}</p>
		<p class="mt-2 text-meta font-bold text-fg-muted">
			{tOffice('knowledge.served', { n: served })}
		</p>
	</header>

	<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
		<FilterGroup
			label={tOffice('knowledge.filterReview')}
			{options}
			bind:value={review}
			name="filter-review"
		/>

		<div class="flex flex-col items-start gap-1">
			<Button onclick={() => {}} disabled>{tOffice('knowledge.export')}</Button>
			<p class="max-w-prose text-meta text-fg-muted">{tOffice('knowledge.exportNote')}</p>
		</div>
	</div>

	<!-- No panel title. It repeated the h1 word for word, which is a heading that
	     tells a screen-reader user nothing and a sighted one even less. -->
	<Panel class="overflow-hidden">
		{#each entries as entry (entry.id)}
			<KnowledgeCard {entry} />
		{/each}
	</Panel>
</div>
