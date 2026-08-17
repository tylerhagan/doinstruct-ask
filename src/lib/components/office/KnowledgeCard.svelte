<!--
	@component
	KnowledgeCard: one captured answer, with everything an auditor asks for.

	CONTRACT
	- entry: KnowledgeEntry

	RULES
	- Provenance is not optional. Who verified it, when, what it replaces, and
	  which languages it is live in. An unsourced answer about a machine is a
	  liability rather than a feature, and doinstruct sells audit trails.
	- `served` is a count about the answer, never about who asked. It is the one
	  number in this product that says the loop is working.
	- Review state carries an icon and a word, never a colour alone. `superseded`
	  is muted rather than red: an entry that has been replaced is the system
	  working, not an error.
	- Safety uses the reserved status tokens because here it genuinely is a
	  state, unlike triage, which is an identity.
-->
<script lang="ts">
	import type { KnowledgeEntry } from '$lib/domain/office';
	import { LANGUAGE_LABEL } from '$lib/domain/types';
	import { session } from '$lib/state/session.svelte';
	import { isoDate, tOffice } from '$lib/i18n/office';

	interface Props {
		entry: KnowledgeEntry;
	}

	let { entry }: Props = $props();

	const REVIEW_TONE = {
		current: 'text-ok',
		due: 'text-caution',
		superseded: 'text-fg-muted'
	} as const;
</script>

<article class="border-b border-hairline px-5 py-4 last:border-b-0">
	<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
		<h2 class="text-small font-bold">{entry.question[session.language]}</h2>
		<span class="plate text-meta text-fg-muted tabular-nums">{entry.ref}</span>
	</div>

	<p class="mt-2 max-w-prose text-small text-fg">{entry.answer[session.language]}</p>

	<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
		<span class="inline-flex items-center gap-2 {REVIEW_TONE[entry.review]}">
			<svg class="size-4 shrink-0" viewBox="0 0 16 16" aria-hidden="true">
				{#if entry.review === 'current'}
					<path
						d="M2 8.5l4 4 8-9"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else if entry.review === 'due'}
					<circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2" />
					<path
						d="M8 4v4.5l3 2"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				{:else}
					<path
						d="M2 8h12M10 4l4 4-4 4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{/if}
			</svg>
			<span class="text-meta font-bold">{tOffice(`knowledge.review.${entry.review}`)}</span>
		</span>

		{#if entry.safety !== 'none'}
			<span class="text-meta font-bold {entry.safety === 'stop' ? 'text-stop' : 'text-caution'}">
				{tOffice(`composer.safety.${entry.safety}`)}
			</span>
		{/if}

		<span class="text-meta text-fg-muted">
			{entry.machine} · {entry.assetId}{#if entry.faultCode}{' · '}{entry.faultCode}{/if}
		</span>
	</div>

	<dl class="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
		<div class="flex gap-2">
			<dt class="text-meta text-fg-muted">{tOffice('knowledge.verifiedBy')}</dt>
			<dd class="text-meta font-bold">{entry.verifiedBy}</dd>
		</div>
		<div class="flex gap-2">
			<dt class="text-meta text-fg-muted">{tOffice('knowledge.published')}</dt>
			<dd class="text-meta tabular-nums">{isoDate(entry.publishedAt)}</dd>
		</div>
		<div class="flex gap-2">
			<dt class="text-meta text-fg-muted">{tOffice('knowledge.languages')}</dt>
			<dd class="text-meta">{entry.languages.map((l) => LANGUAGE_LABEL[l]).join(', ')}</dd>
		</div>
		{#if entry.patches}
			<div class="flex gap-2">
				<dt class="text-meta text-fg-muted">{tOffice('knowledge.patches')}</dt>
				<dd class="text-meta">{entry.patches}</dd>
			</div>
		{/if}
	</dl>

	<p class="mt-3 text-meta font-bold text-fg-muted">
		{entry.served === 1
			? tOffice('knowledge.servedOne')
			: tOffice('knowledge.served', { n: entry.served })}
	</p>
</article>
