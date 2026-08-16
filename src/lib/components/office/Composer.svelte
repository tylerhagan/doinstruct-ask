<!--
	@component
	Composer: where a supervisor's time turns into an asset.

	This screen carries the most weight in the office register. Everything else
	reports; this is the one place work happens, and doinstruct's own case study
	says the pain is foremen spending their day on repetition. The whole argument
	is the line under the publish button: answer once, and the assistant answers
	it forever after, in whatever language the next person asks in.

	CONTRACT
	- item:       QueueItem being answered, or null for the empty state
	- draft:      $bindable reply text
	- safety:     $bindable SafetyLevel
	- published:  { name, ref } once published, else null
	- onpublish / oncancel / onnext

	RULES
	- What the assistant already tried is shown before the input, not hidden
	  behind a disclosure. A supervisor answering blind will repeat the answer
	  the worker has already been given and rejected.
	- A refusal on safety grounds is presented as a success, because it is one.
	  The assistant had the answer and withheld it. Framing that as a failure
	  teaches supervisors to loosen the thing that is working.
	- Triage handoffs say so plainly. If the real problem is a machine or a
	  training gap, answering helps the person today and fixes nothing, and the
	  composer should say that rather than quietly accept the work.
	- The confirmation names the person and the audit reference. "Saved" is a
	  message about the system; "Ana gets the answer now" is a message about the
	  job, and the end of an interaction is what gets remembered.
-->
<script lang="ts">
	import type { QueueItem } from '$lib/domain/office';
	import type { SafetyLevel } from '$lib/domain/types';
	import { session } from '$lib/state/session.svelte';
	import { tOffice } from '$lib/i18n/office';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import TriageBadge from './TriageBadge.svelte';

	interface Props {
		item: QueueItem | null;
		draft: string;
		safety: SafetyLevel;
		published: { name: string; ref: string } | null;
		onpublish: () => void;
		oncancel: () => void;
		onnext: () => void;
	}

	let {
		item,
		draft = $bindable(),
		safety = $bindable(),
		published,
		onpublish,
		oncancel,
		onnext
	}: Props = $props();

	const SAFETY_LEVELS: SafetyLevel[] = ['none', 'caution', 'stop'];

	/** How many people this reply reaches: the asker plus everyone duplicated. */
	const reach = $derived(item ? 1 + item.alsoWaiting : 0);

	const canPublish = $derived(draft.trim().length > 0);
</script>

{#if published}
	<Panel elevation="raised" class="p-5">
		<p class="text-lead font-bold text-ok">{tOffice('composer.published')}</p>
		<p class="mt-2 max-w-prose text-small">
			{tOffice('composer.publishedBody', { name: published.name, ref: published.ref })}
		</p>
		<div class="mt-5">
			<Button variant="primary" onclick={onnext}>{tOffice('composer.next')}</Button>
		</div>
	</Panel>
{:else if !item}
	<!--
		The empty state is not a gap in the screen, it is the screen, and it is what
		a reviewer sees first. It was a short paragraph in a small box floating in a
		column the length of the queue, which reads as something that failed to
		load. Given height, centred, and carrying the halftone so the product and
		the case study look like the same company's work.
	-->
	<Panel class="halftone flex min-h-80 items-center justify-center p-8 text-center">
		<div>
			<p class="text-lead font-bold">{tOffice('composer.empty')}</p>
			<p class="mx-auto mt-2 max-w-prose text-small text-fg-muted">
				{tOffice('composer.emptyBody')}
			</p>
		</div>
	</Panel>
{:else}
	<Panel elevation="raised">
		<div class="border-b border-hairline px-5 py-4">
			<p class="text-meta font-bold text-fg-muted">{tOffice('composer.forQuestion')}</p>
			<p class="mt-1 text-lead">{item.question[session.language]}</p>
			<p class="mt-2 text-meta text-fg-muted">
				{item.machine} · {item.assetId}{#if item.faultCode}{' · '}{item.faultCode}{/if} · {tOffice(
					`queue.shift.${item.shift}`
				)}
			</p>
		</div>

		<!-- What the assistant already tried. Never behind a disclosure. -->
		<div class="border-b border-hairline bg-surface-raised px-5 py-4">
			<p class="text-meta font-bold">{tOffice('queue.tried')}</p>
			<p class="mt-1 text-meta font-bold text-fg-muted">
				{tOffice(`queue.outcome.${item.attempt.outcome}`)}
			</p>
			<p class="mt-2 max-w-prose text-small">{item.attempt.detail[session.language]}</p>
			<p class="mt-2 text-meta text-fg-muted">
				{tOffice('queue.searched')}: {item.attempt.searched.join(' · ')}
			</p>
		</div>

		<!-- Triage handoff: say when answering will not fix the cause. -->
		{#if item.triage !== 'documentation'}
			<div class="flex flex-col gap-2 border-b border-hairline px-5 py-4">
				<TriageBadge triage={item.triage} showAction />
				<p class="max-w-prose text-small">{tOffice(`composer.handoff.${item.triage}`)}</p>
			</div>
		{/if}

		<div class="px-5 py-4">
			<label class="block">
				<span class="text-meta font-bold">{tOffice('composer.reply')}</span>
				<textarea
					bind:value={draft}
					rows="5"
					class="mt-2 w-full rounded-md border border-border bg-surface-sunken px-3 py-2
					       text-small text-fg"></textarea>
			</label>
			<p class="mt-1 max-w-prose text-meta text-fg-muted">{tOffice('composer.replyHint')}</p>

			<fieldset class="mt-5">
				<legend class="text-meta font-bold">{tOffice('composer.safety')}</legend>
				<div class="mt-2 flex flex-col gap-2">
					{#each SAFETY_LEVELS as level (level)}
						<label
							class="inline-flex min-h-control cursor-pointer items-center gap-2 rounded-md
							       border px-3 text-small transition-colors
							       {safety === level
								? 'border-ink bg-surface-raised font-bold'
								: 'border-hairline bg-surface text-fg-muted'}"
						>
							<input
								type="radio"
								name="composer-safety"
								value={level}
								bind:group={safety}
								class="sr-only"
							/>
							{tOffice(`composer.safety.${level}`)}
						</label>
					{/each}
				</div>
			</fieldset>

			<p class="mt-5 max-w-prose text-small">
				{reach === 1 ? tOffice('composer.reachOne') : tOffice('composer.reach', { n: reach })}
			</p>
			<p class="mt-1 max-w-prose text-meta text-fg-muted">
				{tOffice('composer.becomesKnowledge')}
			</p>

			<div class="mt-5 flex flex-wrap gap-2">
				<Button variant="primary" onclick={onpublish} disabled={!canPublish}>
					{tOffice('composer.publish')}
				</Button>
				<Button variant="quiet" onclick={oncancel}>{tOffice('composer.cancel')}</Button>
			</div>
		</div>
	</Panel>
{/if}
