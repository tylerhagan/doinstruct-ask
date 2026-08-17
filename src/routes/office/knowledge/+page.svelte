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
	import PageHeader from '$lib/components/office/PageHeader.svelte';
	import OfflineNotice from '$lib/components/office/OfflineNotice.svelte';

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

	const stats = $derived([
		{ value: KNOWLEDGE.length, label: tOffice('stats.entries') },
		{ value: served, label: tOffice('stats.served') },
		{
			value: KNOWLEDGE.filter((e) => e.review === 'due').length,
			label: tOffice('knowledge.review.due')
		}
	]);
</script>

<PageHeader title={tOffice('knowledge.title')} lede={tOffice('knowledge.lede')} {stats} />

<div class="flex max-w-read flex-col gap-4 p-4 md:p-6">
	<div class="empty:hidden"><OfflineNotice /></div>

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
		{#if entries.length === 0}
			<!-- A filter that matches nothing must say so. An empty panel reads as a
			     failure to load, and the reader cannot tell which it is. -->
			<p class="px-5 py-8 text-small text-fg-muted">{tOffice('knowledge.empty')}</p>
		{:else}
			{#each entries as entry (entry.id)}
				<KnowledgeCard {entry} />
			{/each}
		{/if}
	</Panel>
</div>
