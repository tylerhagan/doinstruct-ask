<!--
	@component
	AnswerCard: a grounded answer, or an honest refusal.

	CONTRACT
	- answer:      Answer (required)
	- speaking?:   boolean: TTS currently reading this answer
	- onread?:     () => void: toggle read-aloud
	- onopensource?: (id: string) => void
	- onnothelp?:  () => void: the escape hatch into escalation

	RULES
	- Confidence is stated in words, never as a percentage. "87% confident" is
	  meaningless to a technician holding a wrench and worse than useless in an
	  audit.
	- `partial` answers say what to verify and who verifies it. A hedge with no
	  named next action is just an unhelpful answer wearing a disclaimer.
	- "Didn't help" is always present and always one tap away. It is the entrance
	  to the escalation path, and it is the most commercially important control in
	  the product. Every tap is a gap in the knowledge base being reported for
	  free.
	- Sources render below the answer, never behind a disclosure. Hiding provenance
	  behind a tap is how you lose an audit.
-->
<script lang="ts">
	import type { Answer } from '$lib/domain/types';
	import Button from './Button.svelte';
	import SourceChip from './SourceChip.svelte';
	import SafetyBanner from './SafetyBanner.svelte';
	import StepList from './StepList.svelte';
	import { t } from '$lib/i18n/floor';

	interface Props {
		answer: Answer;
		speaking?: boolean;
		onread?: () => void;
		onopensource?: (id: string) => void;
		onnothelp?: () => void;
	}

	let { answer, speaking = false, onread, onopensource, onnothelp }: Props = $props();

	const CONFIDENCE_CLASS: Record<'sourced' | 'partial', string> = {
		sourced: 'border-ok bg-ok-surface text-ok',
		partial: 'border-caution bg-caution-surface text-caution'
	};

	const CONFIDENCE_KEY = {
		sourced: 'answer.sourced',
		partial: 'answer.partial'
	} as const;
</script>

<article class="flex flex-col gap-5" aria-label={t('a11y.answer')}>
	{#if answer.confidence !== 'none'}
		<span
			class="self-start rounded-full border-2 px-4 py-1 text-small font-bold
			       {CONFIDENCE_CLASS[answer.confidence]}"
		>
			{t(CONFIDENCE_KEY[answer.confidence])}
		</span>
	{/if}

	{#if answer.safety !== 'none' && answer.safetyNote}
		<SafetyBanner level={answer.safety}>{answer.safetyNote}</SafetyBanner>
	{/if}

	<p class="text-title font-bold">{answer.summary}</p>

	{#if answer.steps.length}
		<StepList steps={answer.steps} />
	{/if}

	{#if answer.sources.length}
		<section aria-label={t('a11y.sources')} class="flex flex-col gap-2">
			<h3 class="text-small font-bold text-fg-muted">{t('answer.source')}</h3>
			{#each answer.sources as source (source.id)}
				<SourceChip {source} onopen={() => onopensource?.(source.id)} />
			{/each}
		</section>
	{/if}

	<div class="flex flex-col gap-3">
		<Button onclick={onread} full aria-pressed={speaking}>
			{speaking ? t('answer.readStop') : t('answer.read')}
		</Button>
		<Button variant="quiet" onclick={onnothelp} full>{t('answer.noHelp')}</Button>
	</div>
</article>
