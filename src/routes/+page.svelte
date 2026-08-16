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
	import { page } from '$app/state';
	import StatusBar from '$lib/components/floor/StatusBar.svelte';
	import PushToTalk from '$lib/components/floor/PushToTalk.svelte';
	import TranscriptConfirm from '$lib/components/floor/TranscriptConfirm.svelte';
	import AnswerCard from '$lib/components/floor/AnswerCard.svelte';
	import EscalationCard from '$lib/components/floor/EscalationCard.svelte';
	import Button from '$lib/components/floor/Button.svelte';
	import DemoPanel from '$lib/components/floor/DemoPanel.svelte';
	import LanguagePicker from '$lib/components/floor/LanguagePicker.svelte';

	import { session } from '$lib/state/session.svelte';
	import { t } from '$lib/i18n/floor';
	import { recognition, speak, stopSpeaking } from '$lib/voice/recognition.svelte';
	import { scenarioById, type ScenarioId } from '$lib/data/floor';
	import { LANGUAGE_LABEL, type Answer, type Escalation, type Language } from '$lib/domain/types';

	/** The languages this prototype's content exists in. */
	const LANGUAGES: Language[] = ['de', 'ro', 'en'];

	type Phase =
		| 'language'
		| 'standby'
		| 'listening'
		| 'confirm'
		| 'thinking'
		| 'answer'
		| 'escalation'
		| 'handover';

	/**
	 * The flow starts at the language choice, not at standby.
	 *
	 * doinstruct's own flow is scan, pick a language, begin, and the first
	 * version of this prototype skipped straight to a Romanian interface nobody
	 * had asked for. Matching their pattern costs one screen and removes the
	 * single worst assumption in the old build. See docs/office-surface.md.
	 */
	let phase = $state<Phase>('language');

	/**
	 * Where to go back to after a mid-flow language change.
	 *
	 * Changing language does NOT reset the flow. Every scenario is localised down
	 * to its procedure steps, so re-rendering the screen the worker is already on
	 * is both the correct behaviour and the clearest demonstration of the claim
	 * doinstruct makes with "35+ languages". Throwing away an answer because
	 * someone fixed a mis-tap would be a punishment for our own bad default.
	 */
	let returnTo = $state<Phase | null>(null);

	/**
	 * Which phases paint their own ground to the edge of the device.
	 *
	 * `main` used to pad every phase and the two dark screens cancelled it with a
	 * negative margin. That worked for standby, was never applied to the language
	 * picker, and showed up as a cream inset border around the dark screen: the
	 * frame leaking through its own padding. A negative margin to undo a parent's
	 * padding is a sign the padding is in the wrong place, so it moved.
	 */
	/**
	 * The device is dark until it has something for you to read.
	 *
	 * Language, standby, listening and thinking are all the same thing from the
	 * worker's side: the machine has your attention but not your answer yet. They
	 * take the brand ground. The moment there is a sentence to read, the surface
	 * turns cream and stays there.
	 *
	 * It carries practical weight as well as brand. A worker who glances up from
	 * a part in their hands can tell dark from light across a line without
	 * reading a word, so the screen says "still listening" or "ready for you" in
	 * peripheral vision. `tokens.json` has described the inverse surface as the
	 * listening state since the first version; it had simply never been built.
	 */
	const darkGround = $derived(
		phase === 'language' || phase === 'standby' || phase === 'listening' || phase === 'thinking'
	);
	let scenarioId = $state<ScenarioId>('sourced');
	let answer = $state<Answer | null>(null);
	let escalation = $state<Escalation | null>(null);
	let speaking = $state(false);
	let typing = $state(false);
	let typed = $state('');

	const scenario = $derived(scenarioById(scenarioId));

	onMount(() => {
		// The QR code on the machine is the only thing that says which machine
		// this is. Read client-side: the app is prerendered, so a query string
		// cannot be baked in at build time.
		session.guessLanguage(LANGUAGES);
		session.resolveMachine(page.url);
		recognition.detect();
	});

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

	/**
	 * Reset returns to standby rather than to the language screen. The worker has
	 * not changed, so asking them to pick their language again after every
	 * question would be the interface forgetting who it is talking to. Language
	 * stays changeable in the status bar for the case where the device is handed
	 * over mid-shift.
	 */
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
	     frame radius. It is scoped to sm because below that there is no radius to
	     clip to, and an overflow container would break the sticky footer, which
	     relies on the body being the scrollport on a phone. -->
	<div
		class="mx-auto flex min-h-dvh w-full max-w-device flex-col bg-surface
		       sm:h-frame sm:min-h-0 sm:overflow-hidden sm:rounded-xl sm:border-2 sm:border-ink"
	>
		<!-- No status bar on the language screen. It carries its own language
		     buttons, and offering the same choice twice on one screen is how a
		     worker ends up unsure which one counted. -->
		{#if phase !== 'language'}
			<StatusBar
				onchangelanguage={() => {
					returnTo = phase;
					phase = 'language';
				}}
			/>
		{/if}

		<!-- transition-colors, so dark to cream reads as the screen changing its mind
		     rather than as a cut. Colour only: nothing here moves. -->
		<main
			class="flex flex-1 flex-col transition-colors duration-200 sm:min-h-0 sm:overflow-y-auto
			       {darkGround ? 'ground-dark bg-surface-inverse text-fg-inverse' : 'gap-6 p-5'}"
		>
			<!-- Dark is where you are, cream is where you read. Standby and the
			     language screen are context, so they take the brand ground; answers
			     and procedures are reading, so they stay on cream. -->
			{#if phase === 'language'}
				<!--
					The offered list is the languages the CONTENT exists in, which here is
					the three the scenarios are translated into. In the real product a
					site configures its own set, typically six to ten. The picker takes a
					list rather than hard-coding buttons, so that number is data.
				-->
				<LanguagePicker
					options={LANGUAGES.map((code) => ({ code, label: LANGUAGE_LABEL[code] }))}
					onchoose={(code) => {
						if (LANGUAGES.includes(code as Language)) session.setLanguage(code as Language);
						phase = returnTo ?? 'standby';
						returnTo = null;
					}}
				/>
			{:else if phase === 'standby'}
				<div class="flex flex-1 flex-col items-center justify-center gap-5 p-5 text-center">
					{#if session.machine}
						<p class="text-display font-bold">{session.machine.machine}</p>
					{:else}
						<p class="text-lead font-bold">{t('machine.unknown')}</p>
						<p class="max-w-xs text-small text-fg-inverse-muted">
							{t('machine.unknownBody', { id: session.scannedAsset ?? '' })}
						</p>
					{/if}

					{#if session.machine?.faultCode}
						<p
							class="inline-flex items-center gap-3 rounded-full border-2 border-hairline-inverse
							       bg-surface-inverse-raised py-2 pr-5 pl-4"
						>
							<span class="text-meta font-bold tracking-wide text-fg-inverse-muted uppercase">
								{t('standby.fault')}
							</span>
							<span class="text-lead font-bold tabular-nums">{session.machine.faultCode}</span>
						</p>
					{/if}

					<p class="mt-1 max-w-xs text-small text-fg-inverse-muted">{t('standby.hint')}</p>
				</div>
			{:else if phase === 'listening'}
				<!-- The loudest moment in the product. Full bleed, cream on green, the
				     worker's own words at hero size as they arrive. -->
				<div class="flex flex-1 flex-col justify-center p-5">
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
				<div class="flex flex-1 items-center justify-center p-5">
					<p class="text-title text-fg-inverse-muted" aria-live="polite">{t('ptt.thinking')}</p>
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
			<div
				class="sticky bottom-0 border-t-2 p-5 transition-colors duration-200
				       {darkGround
					? 'ground-dark border-hairline-inverse bg-surface-inverse'
					: 'border-hairline bg-surface'}"
			>
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
							class="w-full rounded-lg border-2 p-4 text-lead
							       {darkGround
								? 'border-hairline-inverse bg-surface-inverse-raised text-fg-inverse'
								: 'border-hairline bg-surface-sunken'}"
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
						class="mt-3 min-h-tap w-full text-small font-medium underline underline-offset-4
						       {darkGround ? 'text-fg-inverse-muted' : 'text-fg-muted'}"
					>
						{t('confirm.type')}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<DemoPanel bind:scenarioId onreset={reset} />
</div>
