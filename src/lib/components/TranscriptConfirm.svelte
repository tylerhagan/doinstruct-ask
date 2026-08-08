<!--
	@component
	TranscriptConfirm: "this is what I heard", before anything acts on it.

	CONTRACT
	- text:       string (required): the recognised utterance
	- uncertain:  string[]: words the recogniser was unsure of; rendered marked
	- onconfirm:  () => void
	- onretry:    () => void
	- ontype:     () => void: escape hatch to the keyboard

	RULES
	- This step is NOT optional and must not be auto-skipped on high confidence.
	  In a 90 dB room, mis-recognition is the norm, and a technician acting on a
	  misheard fault code is the exact failure this product exists to prevent.
	- Uncertain words are marked visually AND announced, because the whole point is
	  to draw the eye to the part most likely to be wrong.
	- "Type it instead" is always present. Voice-primary must never mean
	  voice-only; a worker with a speech difference or a broken mic still needs an
	  answer.
-->
<script lang="ts">
	import Button from './Button.svelte';
	import { t } from '$lib/i18n/strings';

	interface Props {
		text: string;
		uncertain?: string[];
		onconfirm?: () => void;
		onretry?: () => void;
		ontype?: () => void;
	}

	let { text, uncertain = [], onconfirm, onretry, ontype }: Props = $props();

	const words = $derived(text.split(' '));
	const uncertainSet = $derived(new Set(uncertain.map((w) => w.toLowerCase())));
</script>

<section aria-label="Erkannte Frage">
	<p class="mb-2 text-small text-fg-muted">{t('confirm.heard')}</p>

	<blockquote
		class="rounded-lg border-2 border-border bg-surface-sunken p-4 text-lead"
		aria-live="polite"
	>
		{#each words as word, i (i)}
			{#if uncertainSet.has(word.toLowerCase().replace(/[.,?]/g, ''))}
				<mark
					class="bg-caution-surface font-bold text-caution underline decoration-2 underline-offset-4"
				>
					{word}
				</mark>
			{:else}
				{word}
			{/if}{' '}
		{/each}
	</blockquote>

	{#if uncertain.length}
		<p class="mt-2 text-small text-caution">{t('confirm.unsure')}</p>
	{/if}

	<div class="mt-4 flex flex-col gap-3">
		<Button variant="primary" size="md" full onclick={onconfirm}>{t('confirm.yes')}</Button>
		<div class="flex gap-3">
			<Button class="flex-1" onclick={onretry}>{t('confirm.again')}</Button>
			<Button class="flex-1" onclick={ontype}>{t('confirm.type')}</Button>
		</div>
	</div>
</section>
