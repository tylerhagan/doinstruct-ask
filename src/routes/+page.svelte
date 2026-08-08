<!--
	The prototype.

	One route holds the whole state machine on purpose. The components below are
	deliberately dumb: they report gestures and render props, so that an agent
	asked to "change the flow" edits this file only, and an agent asked to
	"restyle the answer" edits AnswerCard only. That separation is what makes the
	2-to-3-prompt handover in `AGENTS.md` actually work.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import PushToTalk from '$lib/components/PushToTalk.svelte';
	import TranscriptConfirm from '$lib/components/TranscriptConfirm.svelte';
	import AnswerCard from '$lib/components/AnswerCard.svelte';
	import EscalationCard from '$lib/components/EscalationCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import DemoPanel from '$lib/components/DemoPanel.svelte';

	import { session } from '$lib/state/session.svelte';
	import { t } from '$lib/i18n/strings';
	import { recognition, speak, stopSpeaking } from '$lib/voice/recognition.svelte';
	import { scenarioById, type ScenarioId } from '$lib/data/scenarios';
	import type { Answer, Escalation } from '$lib/domain/types';

	type Phase =
		'standby' | 'listening' | 'confirm' | 'thinking' | 'answer' | 'escalation' | 'handover';

	let phase = $state<Phase>('standby');
	let scenarioId = $state<ScenarioId>('sourced');
	let answer = $state<Answer | null>(null);
	let escalation = $state<Escalation | null>(null);
	let speaking = $state(false);
	let typing = $state(false);
	let typed = $state('');

	const scenario = $derived(scenarioById(scenarioId));

	onMount(() => recognition.detect());

	const pttState = $derived.by(() => {
		if (phase === 'listening') return 'listening' as const;
		if (phase === 'thinking') return 'thinking' as const;
		return 'idle' as const;
	});

	const pttLabel = $derived(
		phase === 'listening'
			? t('ptt.listening')
			: phase === 'thinking'
				? t('ptt.thinking')
				: t('ptt.idle')
	);

	function startListening() {
		if (phase !== 'standby') return;
		phase = 'listening';
		void recognition.start(session.language, {
			text: scenario.utterance[session.language],
			uncertain: scenario.uncertain
		});
	}

	function stopListening() {
		if (phase !== 'listening') return;
		recognition.stop();
		phase = 'confirm';
	}

	function submit() {
		phase = 'thinking';
		// A visible thinking beat is honest, not theatre: retrieval over a document
		// set genuinely takes a moment, and a worker who sees nothing happen taps
		// again.
		setTimeout(() => {
			const built = scenario.build(session.language);
			answer = built.answer ?? null;
			escalation = built.escalation ?? null;
			phase = built.escalation ? 'escalation' : 'answer';
		}, 900);
	}

	function readAloud() {
		if (!answer) return;
		if (speaking) {
			stopSpeaking();
			speaking = false;
			return;
		}
		speaking = true;
		const script = [answer.summary, ...answer.steps.map((s) => `${s.n}. ${s.text}`)].join('. ');
		speak(script, session.language, () => (speaking = false));
	}

	function escalate() {
		stopSpeaking();
		speaking = false;
		const built = scenarioById('miss').build(session.language);
		escalation = built.escalation ? { ...built.escalation, status: 'waiting' } : null;
		answer = null;
		phase = 'escalation';
	}

	function notifyMe() {
		if (!escalation) return;
		// Marek answers. In the real product this is a push to the worker's device
		// or a callback on this screen at the wall mount.
		setTimeout(() => {
			if (escalation) escalation = { ...escalation, status: 'answered' };
		}, 2600);
	}

	function reset() {
		stopSpeaking();
		recognition.stop();
		speaking = false;
		typing = false;
		typed = '';
		answer = null;
		escalation = null;
		phase = 'standby';
	}
</script>

<svelte:head>
	<title>doinstruct Ask | Linie 3</title>
	<meta name="description" content="Voice-first operational answers for the line." />
</svelte:head>

<div class="min-h-dvh bg-surface-sunken py-0 sm:py-8">
	<!-- The frame is a demo affordance for desktop review. On the actual device
	     this is full-bleed. -->
	<!-- sm:overflow-hidden clips the children to the frame's radius. Without it
	     the StatusBar's square top corners and its bottom border sit outside the
	     rounded edge. It is scoped to sm because below that there is no radius to
	     clip to, and an overflow container would break the sticky footer, which
	     relies on the body being the scrollport on a phone. -->
	<div
		class="mx-auto flex min-h-dvh w-full max-w-device flex-col bg-surface
		       sm:h-frame sm:min-h-0 sm:overflow-hidden sm:rounded-xl sm:border-2 sm:border-ink"
	>
		<StatusBar />

		<main class="flex flex-1 flex-col gap-6 p-5 sm:min-h-0 sm:overflow-y-auto">
			{#if phase === 'standby'}
				<div class="flex flex-1 flex-col justify-center gap-3 text-center">
					<p class="text-display font-bold">{session.machine.machine}</p>
					{#if session.machine.faultCode}
						<p class="text-title text-fg-muted">
							{t('standby.fault')}
							{session.machine.faultCode}
						</p>
					{/if}
					<p class="mt-2 text-body text-fg-muted">{t('standby.hint')}</p>
				</div>
			{:else if phase === 'listening'}
				<div class="flex flex-1 flex-col justify-center">
					<p class="text-hero font-bold" aria-live="polite">
						{recognition.transcript || '…'}
					</p>
				</div>
			{:else if phase === 'confirm'}
				<div class="flex-1">
					<TranscriptConfirm
						text={recognition.transcript || scenario.utterance[session.language]}
						uncertain={recognition.uncertain}
						onconfirm={submit}
						onretry={() => (phase = 'standby')}
						ontype={() => {
							typing = true;
							typed = recognition.transcript || scenario.utterance[session.language];
							phase = 'standby';
						}}
					/>
				</div>
			{:else if phase === 'thinking'}
				<div class="flex flex-1 items-center justify-center">
					<p class="text-title text-fg-muted" aria-live="polite">{t('ptt.thinking')}</p>
				</div>
			{:else if phase === 'answer' && answer}
				<AnswerCard {answer} {speaking} onread={readAloud} onnothelp={escalate} />
				<Button full onclick={() => (phase = 'handover')}>{t('handover.cta')}</Button>
				<Button variant="quiet" full onclick={reset}>{t('flow.newQuestion')}</Button>
			{:else if phase === 'escalation' && escalation}
				<EscalationCard {escalation} onnotify={notifyMe} oncapture={reset} />
				<Button variant="quiet" full onclick={reset}>{t('flow.newQuestion')}</Button>
			{:else if phase === 'handover' && answer}
				<section class="flex flex-1 flex-col gap-5">
					<p class="text-small text-fg-muted">{t('handover.title')}</p>
					<p class="text-title font-bold">{answer.summary}</p>
					<div class="mt-auto flex flex-col gap-3">
						<Button variant="primary" full onclick={reset}>{t('handover.confirm')}</Button>
						<Button variant="quiet" full onclick={() => (phase = 'answer')}>{t('flow.back')}</Button
						>
					</div>
				</section>
			{/if}
		</main>

		{#if phase === 'standby' || phase === 'listening' || phase === 'thinking'}
			<div class="sticky bottom-0 border-t-2 border-border bg-surface p-5">
				{#if typing}
					<form
						class="flex flex-col gap-3"
						onsubmit={(e) => {
							e.preventDefault();
							typing = false;
							phase = 'confirm';
						}}
					>
						<!-- svelte-ignore a11y_autofocus -->
						<textarea
							bind:value={typed}
							autofocus
							rows="2"
							class="w-full rounded-lg border-2 border-border-strong bg-surface-sunken p-4 text-lead"
							aria-label={t('confirm.type')}></textarea>
						<Button variant="primary" full type="submit">{t('confirm.yes')}</Button>
					</form>
				{:else}
					<PushToTalk
						state={pttState}
						label={pttLabel}
						level={recognition.level}
						noisy={recognition.noisy}
						onstart={startListening}
						onstop={stopListening}
					/>
					<button
						type="button"
						onclick={() => (typing = true)}
						class="mt-3 min-h-tap w-full text-small font-medium text-fg-muted underline underline-offset-4"
					>
						{t('confirm.type')}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<DemoPanel bind:scenarioId onreset={reset} />
</div>
