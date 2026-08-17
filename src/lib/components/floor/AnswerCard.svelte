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
	import StatusMark from '$lib/components/shared/StatusMark.svelte';
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

	/**
	 * Confidence is attached to the answer rather than floating above it.
	 *
	 * It used to be a pill above the summary, which meant the first thing a
	 * worker read was metadata about the answer instead of the answer. The
	 * start-edge rule ties the two together and gives the screen an anchor, and
	 * the word stays, so colour is never carrying it alone.
	 */
	const CONFIDENCE_EDGE: Record<'sourced' | 'partial', string> = {
		sourced: 'border-s-ok',
		partial: 'border-s-caution'
	};

	const CONFIDENCE_TEXT: Record<'sourced' | 'partial', string> = {
		sourced: 'text-ok',
		partial: 'text-caution'
	};

	const CONFIDENCE_KEY = {
		sourced: 'answer.sourced',
		partial: 'answer.partial'
	} as const;
</script>

<article class="flex flex-col gap-6" aria-label={t('a11y.answer')}>
	<!-- Safety first and unconditionally. It interrupts, which is the point. -->
	{#if answer.safety !== 'none' && answer.safetyNote}
		<SafetyBanner level={answer.safety}>{answer.safetyNote}</SafetyBanner>
	{/if}

	<!--
		The answer itself, and the largest thing on the screen.

		It was `text-title`, one step above the procedure steps below it, which
		left the payoff of the whole interaction competing with its own footnotes.
		This is the sentence that gets read aloud first and the one a worker acts
		on, so it takes the display size and the anchor.
	-->
	<div
		class="border-s-4 ps-4 {answer.confidence !== 'none'
			? CONFIDENCE_EDGE[answer.confidence]
			: 'border-s-border'}"
	>
		{#if answer.confidence !== 'none'}
			<p
				class="mb-2 flex items-center gap-2 text-meta font-bold tracking-wide uppercase
				       {CONFIDENCE_TEXT[answer.confidence]}"
			>
				<StatusMark level={answer.confidence === 'sourced' ? 'ok' : 'caution'} />
				{t(CONFIDENCE_KEY[answer.confidence])}
			</p>
		{/if}
		<p class="text-display font-bold">{answer.summary}</p>
	</div>

	{#if answer.steps.length}
		<StepList steps={answer.steps} />
	{/if}

	{#if answer.sources.length}
		<section aria-label={t('a11y.sources')} class="flex flex-col gap-2">
			<h3 class="text-meta font-bold tracking-wide text-fg-muted uppercase">
				{t('answer.source')}
			</h3>
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
