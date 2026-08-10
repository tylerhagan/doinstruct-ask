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
	import { t } from '$lib/i18n/strings';

	interface Props {
		source: Source;
		onopen?: () => void;
	}

	let { source, onopen }: Props = $props();

	const translated = $derived(source.language !== session.language);

	const age = $derived.by(() => {
		const days = Math.round((Date.now() - new Date(source.updatedAt).getTime()) / 86_400_000);
		if (days < 60) return `${days} ${t('source.daysOld')}`;
		return `${Math.round(days / 30)} ${t('source.monthsOld')}`;
	});
</script>

<button
	type="button"
	onclick={onopen}
	class="flex min-h-tap w-full touch-manipulation items-center justify-between gap-4
	       rounded-md border-2 border-hairline bg-surface-raised px-4 py-3 text-left transition-colors"
>
	<span class="min-w-0">
		<span class="block text-small font-medium text-fg">{source.document}</span>
		<span class="block text-meta text-fg-muted">
			{source.section} · {t('source.page')}
			{source.page} · {age}
			{#if translated}
				· {t('source.from')} {LANGUAGE_LABEL[source.language]}
			{/if}
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
