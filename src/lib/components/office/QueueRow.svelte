<!--
	@component
	QueueRow: one person waiting on an answer.

	CONTRACT
	- item:     QueueItem
	- selected: is this the one open in the composer
	- onselect: callback

	RULES
	- The whole row is the target, at `min-h-row` (56px). A supervisor scanning
	  forty rows should not have to aim.
	- The wait is the loudest thing after the question, because the wait is the
	  problem this product exists to shorten.
	- `alsoWaiting` is a count and never a list of names. Three people asking the
	  same thing is a signal about the documentation, not about the three people.
	- The name is here because you cannot deliver an answer to someone you cannot
	  name. It is present tense only: nothing anywhere in this product records
	  what this person has asked before. See docs/office-surface.md.
	- Never truncate the question. German compounds and Romanian diacritics both
	  overflow, and a supervisor deciding what to answer next needs the whole
	  sentence, not the first forty characters of it.
-->
<script lang="ts">
	import type { QueueItem } from '$lib/domain/office';
	import { LANGUAGE_LABEL } from '$lib/domain/types';
	import { session } from '$lib/state/session.svelte';
	import { tOffice, waitLabel } from '$lib/i18n/office';
	import TriageBadge from './TriageBadge.svelte';

	interface Props {
		item: QueueItem;
		selected: boolean;
		onselect: () => void;
	}

	let { item, selected, onselect }: Props = $props();

	/** Over two hours is the point where a wait stops being a queue and starts
	 *  being a person stuck at a machine. */
	const overdue = $derived(Date.now() - Date.parse(item.waitingSince) > 2 * 60 * 60 * 1000);
</script>

<button
	type="button"
	onclick={onselect}
	aria-current={selected ? 'true' : undefined}
	class="flex min-h-row w-full flex-col items-start gap-2 px-4 py-3
	       text-start transition-colors
	       {selected ? 'bg-surface-raised' : 'bg-surface hover:bg-surface-raised'}"
>
	<div class="flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
		<span class="text-meta font-bold">{item.machine}</span>
		<span class="text-meta text-fg-muted">
			{item.line} · {item.assetId}{#if item.faultCode}{' · '}{item.faultCode}{/if}
		</span>
	</div>

	<p class="text-small text-fg">{item.question[session.language]}</p>

	<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
		<TriageBadge triage={item.triage} />

		<!--
			The overdue emphasis lands on the duration and NOT on the name. Colouring
			a person's name amber says something about the person, and this product's
			whole argument is that it does not. The wait is the thing that is wrong.
		-->
		<span class="text-meta text-fg-muted">
			{item.askedBy.name} · {tOffice('queue.waitingFor')}
			<span class={overdue ? 'font-bold text-caution' : ''}>
				{waitLabel(item.waitingSince)}
			</span>
		</span>
	</div>

	{#if item.alsoWaiting > 0}
		<p class="text-meta text-fg-muted">
			{item.alsoWaiting === 1
				? tOffice('queue.alsoWaitingOne')
				: tOffice('queue.alsoWaiting', { n: item.alsoWaiting })}
		</p>
	{/if}

	<p class="text-meta text-fg-muted">
		{tOffice('queue.askedIn', { lang: LANGUAGE_LABEL[item.askedIn] })}
	</p>
</button>
