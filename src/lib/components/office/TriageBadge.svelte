<!--
	@component
	TriageBadge: what kind of problem this is, and therefore who fixes it.

	CONTRACT
	- triage: TriageClass
	- showAction: also render the next action  (default false)

	RULES
	- Icon AND text, always. Three classes with three colours would be a colour
	  code, and roughly one in twelve of the men on this workforce cannot read
	  one. The shapes differ as well as the hues: a document, a gear, a person.
	- The colours are chart series colours rather than status colours, and that
	  is the correct choice: triage is an identity, not a state. "Documentation"
	  is not worse than "Engineering", it is somewhere else. Using stop/caution
	  here would say a machine fault is dangerous, which it is not.
-->
<script lang="ts">
	import type { TriageClass } from '$lib/domain/office';
	import { tOffice } from '$lib/i18n/office';

	interface Props {
		triage: TriageClass;
		showAction?: boolean;
	}

	let { triage, showAction = false }: Props = $props();

	/** Series slots 1 to 3, assigned in fixed order and never cycled. */
	const TONE: Record<TriageClass, string> = {
		documentation: 'text-series-1',
		machine: 'text-series-2',
		people: 'text-series-3'
	};
</script>

<span class="inline-flex items-center gap-2">
	<svg class="size-4 shrink-0 {TONE[triage]}" viewBox="0 0 16 16" aria-hidden="true">
		{#if triage === 'documentation'}
			<!-- A page with a folded corner. -->
			<path d="M3 1h6l4 4v10H3z" fill="currentColor" />
			<path d="M9 1v4h4" fill="none" stroke="var(--color-surface)" stroke-width="1.5" />
		{:else if triage === 'machine'}
			<!-- A gear: six teeth, a hole in the middle. -->
			<path
				d="M8 0l1.6 1.2 1.9-.5.9 1.8 1.9.5-.3 2 1.2 1.6-1.2 1.6.3 2-1.9.5-.9 1.8-1.9-.5L8 16l-1.6-1.2-1.9.5-.9-1.8-1.9-.5.3-2L.8 8.2 2 6.6l-.3-2 1.9-.5.9-1.8 1.9.5z"
				fill="currentColor"
			/>
			<circle cx="8" cy="8" r="2.6" fill="var(--color-surface)" />
		{:else}
			<!-- A person: head and shoulders. -->
			<circle cx="8" cy="4.5" r="3" fill="currentColor" />
			<path d="M1.5 16a6.5 6.5 0 0 1 13 0z" fill="currentColor" />
		{/if}
	</svg>
	<span class="text-meta font-bold">{tOffice(`triage.${triage}`)}</span>
	{#if showAction}
		<span class="text-meta text-fg-muted">{tOffice(`triage.${triage}.action`)}</span>
	{/if}
</span>
