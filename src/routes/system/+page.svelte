<!--
	/system, the design system gallery.

	Two audiences: an engineer who needs to see what exists before writing a
	prompt, and an agent pointed here to ground a change. Every component in the
	system appears below in every state it can hold.

	This page deliberately breaks one rule it documents. The system allows exactly
	one yellow element per screen, because on the device yellow means "this is the
	voice action". A catalogue is not a screen, so primary buttons appear here more
	than once. That exemption is the only one, and it is stated rather than
	silently taken.

	Content comes from src/lib/data/scenarios.ts rather than being invented here,
	so switching language in the bar above changes what every component says.
-->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import PushToTalk from '$lib/components/PushToTalk.svelte';
	import LevelMeter from '$lib/components/LevelMeter.svelte';
	import TranscriptConfirm from '$lib/components/TranscriptConfirm.svelte';
	import AnswerCard from '$lib/components/AnswerCard.svelte';
	import StepList from '$lib/components/StepList.svelte';
	import SourceChip from '$lib/components/SourceChip.svelte';
	import SafetyBanner from '$lib/components/SafetyBanner.svelte';
	import EscalationCard from '$lib/components/EscalationCard.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';

	import { session } from '$lib/state/session.svelte';
	import { t } from '$lib/i18n/strings';
	import { scenarioById } from '$lib/data/scenarios';
	import type { Source } from '$lib/domain/types';

	// Real scenario content, so the gallery cannot drift from the product.
	const sourced = $derived(scenarioById('sourced').build(session.language).answer!);
	const refusal = $derived(scenarioById('refusal').build(session.language).answer!);
	const escalation = $derived(scenarioById('miss').build(session.language).escalation!);

	const answered = $derived({ ...escalation, status: 'answered' as const });

	const partial = $derived({ ...sourced, confidence: 'partial' as const });

	const translatedSource: Source = {
		id: 'src-demo',
		document: 'Wartungshandbuch Füller F2',
		section: '§4.2 Fehlercode E-212',
		page: 87,
		language: 'de',
		updatedAt: '2026-05-02'
	};

	const staleSource: Source = { ...translatedSource, id: 'src-stale', updatedAt: '2024-11-03' };

	/**
	 * Ranked-bar demo data for the office register.
	 *
	 * Asset IDs rather than sentences on purpose. An identifier is never
	 * localised, so this row of labels reads the same in all three languages and
	 * the gallery does not need a t() key to show a chart.
	 */
	const COVERAGE = [
		{ asset: 'F2-4471', unanswered: 34 },
		{ asset: 'PAL-2210', unanswered: 27 },
		{ asset: 'F1-4470', unanswered: 19 },
		{ asset: 'WRP-118', unanswered: 11 },
		{ asset: 'CIP-030', unanswered: 6 }
	];
	const coverageMax = Math.max(...COVERAGE.map((d) => d.unanswered));

	const SECTIONS = [
		['foundations', 'Foundations'],
		['statusbar', 'StatusBar'],
		['button', 'Button'],
		['pushtotalk', 'PushToTalk'],
		['levelmeter', 'LevelMeter'],
		['transcript', 'TranscriptConfirm'],
		['answercard', 'AnswerCard'],
		['steplist', 'StepList'],
		['sourcechip', 'SourceChip'],
		['safetybanner', 'SafetyBanner'],
		['escalation', 'EscalationCard'],
		['register', 'Office register']
	] as const;
</script>

<svelte:head><title>Ask | Design System</title></svelte:head>

<div class="min-h-dvh bg-surface-sunken">
	<div class="mx-auto max-w-3xl bg-surface px-5 py-10 sm:px-8">
		<header class="mb-10 border-b-2 border-hairline pb-8">
			<h1 class="text-display font-bold">Design system</h1>
			<p class="mt-3 max-w-prose text-body text-fg-muted">
				Every component, in every state. The floor components are sized for a gloved hand on a
				worker's own phone or a shared terminal; the office register below them is sized for a
				supervisor at a desk. Content is pulled from the real scenarios, so switching language below
				changes what these components say, not just their labels.
			</p>

			<nav aria-label="Components" class="mt-6 flex flex-wrap gap-2">
				{#each SECTIONS as [id, label] (id)}
					<a
						href="#{id}"
						class="rounded-md border-2 border-hairline bg-surface-raised px-3 py-2 text-meta font-bold text-fg transition-colors"
					>
						{label}
					</a>
				{/each}
			</nav>

			<div class="mt-6 flex flex-wrap gap-3">
				<Button onclick={() => session.toggleContrast()}>
					High contrast: {session.highContrast ? 'on' : 'off'}
				</Button>
				<Button onclick={() => (session.online = !session.online)}>
					Connection: {session.online ? 'online' : 'offline'}
				</Button>
			</div>
		</header>

		<!-- ── Foundations ────────────────────────────────────────────────── -->
		<section id="foundations" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">Foundations</h2>
			<p class="mt-2 mb-6 max-w-prose text-small text-fg-muted">
				Values live in <code class="text-meta">tokens.json</code> with the reasoning for every
				divergence, and are enforced by
				<code class="text-meta">scripts/check-contrast.mjs</code>.
			</p>

			<h3 class="mb-3 text-lead font-bold">Colour</h3>
			<div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#each [['bg-ink', 'ink', '17.4:1'], ['bg-yellow', 'yellow', '15.6:1 on ink'], ['bg-surface-raised', 'surface-raised', 'card'], ['bg-stop', 'stop', 'safety only'], ['bg-caution', 'caution', '8.1:1'], ['bg-ok', 'ok', '8.3:1']] as [cls, name, note] (name)}
					<div class="overflow-hidden rounded-md border-2 border-hairline">
						<div class="h-14 {cls}"></div>
						<div class="p-2">
							<p class="text-meta font-bold">{name}</p>
							<p class="text-meta text-fg-muted">{note}</p>
						</div>
					</div>
				{/each}
			</div>

			<h3 class="mb-3 text-lead font-bold">Type scale</h3>
			<div
				class="mb-8 flex flex-col gap-1 rounded-md border-2 border-hairline bg-surface-raised p-4"
			>
				<p class="text-meta text-fg-muted">meta 14 · timestamps and audit refs only</p>
				<p class="text-small">small 16 · supporting labels</p>
				<p class="text-body">body 18 · all answer text and instructions</p>
				<p class="text-lead">lead 22 · procedure steps</p>
				<p class="text-title font-bold">title 28</p>
				<p class="text-display font-bold">display 34</p>
			</div>

			<h3 class="mb-3 text-lead font-bold">Gloved-hand sizing</h3>
			<div class="flex flex-wrap items-end gap-4">
				<div>
					<div class="size-tap rounded-md border-2 border-dashed border-border-strong"></div>
					<p class="mt-2 text-meta text-fg-muted">64px minimum</p>
				</div>
				<div>
					<div
						class="size-tap-primary rounded-md border-2 border-dashed border-border-strong"
					></div>
					<p class="mt-2 text-meta text-fg-muted">96px push-to-talk</p>
				</div>
			</div>
		</section>

		<!-- ── StatusBar ──────────────────────────────────────────────────── -->
		<section id="statusbar" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">StatusBar</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				App-level, reads <code class="text-meta">session</code> directly. Machine context is displayed,
				never typed. Languages are labelled in their own script. It is also the live control for this
				page: switch language and every component below follows, content included.
			</p>
			<div class="overflow-hidden rounded-lg border-2 border-ink">
				<StatusBar />
			</div>
			<p class="mt-3 text-meta text-fg-muted">
				Toggle Connection in the header to see the offline badge appear.
			</p>
		</section>

		<!-- ── Button ─────────────────────────────────────────────────────── -->
		<section id="button" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">Button</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				The only interactive primitive. <code class="text-meta">variant</code>,
				<code class="text-meta">size</code>, <code class="text-meta">full</code>, plus any native
				button attribute.
			</p>
			<div class="flex flex-col gap-3">
				<Button variant="primary" size="lg" full>primary · lg · the voice action</Button>
				<Button variant="primary">primary · md</Button>
				<Button variant="secondary">secondary · md · default</Button>
				<Button variant="stop">stop · reserved for safety</Button>
				<Button variant="quiet">quiet · the escape hatch</Button>
				<Button variant="secondary" disabled>secondary · disabled</Button>
			</div>
		</section>

		<!-- ── PushToTalk ─────────────────────────────────────────────────── -->
		<section id="pushtotalk" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">PushToTalk</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Hold to talk, never tap to toggle, so "this is not recording you" is a physical property of
				the control. Five states.
			</p>
			<div class="flex flex-col gap-4">
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">idle</p>
					<PushToTalk state="idle" label={t('ptt.idle')} />
				</div>
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">listening</p>
					<PushToTalk state="listening" label={t('ptt.listening')} level={0.7} />
				</div>
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">listening · loud room</p>
					<PushToTalk state="listening" label={t('ptt.listening')} level={0.5} noisy />
				</div>
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">thinking</p>
					<PushToTalk state="thinking" label={t('ptt.thinking')} />
				</div>
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">speaking</p>
					<PushToTalk state="speaking" label={t('answer.readStop')} />
				</div>
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">error</p>
					<PushToTalk state="error" label={t('confirm.again')} />
				</div>
			</div>
		</section>

		<!-- ── LevelMeter ─────────────────────────────────────────────────── -->
		<section id="levelmeter" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">LevelMeter</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Functional, not decorative. In a 90 dB room it is the only evidence the device can hear you.
				Bars grow from the centre so the shape reads from an oblique angle.
			</p>
			<div
				class="grid gap-4 rounded-md border-2 border-hairline bg-surface-inverse p-4 sm:grid-cols-3"
			>
				{#each [0.15, 0.55, 0.95] as level (level)}
					<div>
						<LevelMeter {level} />
						<p class="mt-1 text-center text-meta text-fg-inverse">level {level}</p>
					</div>
				{/each}
			</div>
			<div class="mt-3 rounded-md border-2 border-hairline bg-surface-inverse p-4">
				<LevelMeter level={0.6} noisy />
				<p class="mt-1 text-center text-meta text-fg-inverse">noisy · switches to caution</p>
			</div>
		</section>

		<!-- ── TranscriptConfirm ──────────────────────────────────────────── -->
		<section id="transcript" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">TranscriptConfirm</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Mandatory, never auto-skipped on high confidence. Uncertain words are marked, and in the
				demo the marked word is the fault code.
			</p>
			<div class="mb-6">
				<p class="mb-2 text-meta font-bold text-fg-muted">with an uncertain word</p>
				<TranscriptConfirm
					text={scenarioById('sourced').utterance[session.language]}
					uncertain={['212']}
				/>
			</div>
			<div>
				<p class="mb-2 text-meta font-bold text-fg-muted">fully confident</p>
				<TranscriptConfirm text={scenarioById('refusal').utterance[session.language]} />
			</div>
		</section>

		<!-- ── AnswerCard ─────────────────────────────────────────────────── -->
		<section id="answercard" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">AnswerCard</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				A grounded answer or an honest refusal. Confidence is stated in words, never a percentage.
				"Didn't help" is always one tap away, because every tap is a knowledge gap reported free.
			</p>

			<div class="mb-8">
				<p class="mb-2 text-meta font-bold text-fg-muted">confidence: sourced</p>
				<AnswerCard answer={sourced} />
			</div>

			<div class="mb-8">
				<p class="mb-2 text-meta font-bold text-fg-muted">confidence: partial · verify first</p>
				<AnswerCard answer={partial} />
			</div>

			<div class="mb-8">
				<p class="mb-2 text-meta font-bold text-fg-muted">
					confidence: none · safety stop · a refusal, not a hedge
				</p>
				<AnswerCard answer={refusal} />
			</div>

			<div>
				<p class="mb-2 text-meta font-bold text-fg-muted">reading aloud</p>
				<AnswerCard answer={sourced} speaking />
			</div>
		</section>

		<!-- ── StepList ───────────────────────────────────────────────────── -->
		<section id="steplist" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">StepList</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Ticks persist, because a technician reads a step, puts the device down, works with both
				hands and comes back. Tap targets span the whole row. Try ticking one.
			</p>
			<StepList steps={sourced.steps} />
			<p class="mt-3 text-meta text-fg-muted">
				Step 2 carries a caution marker. Safety never lives only at the top of a procedure, because
				the worker may arrive mid-list.
			</p>
		</section>

		<!-- ── SourceChip ─────────────────────────────────────────────────── -->
		<section id="sourcechip" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">SourceChip</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Provenance is mandatory. Document age is always visible, because stale documentation is a
				hazard and hiding its age transfers that risk to the worker.
			</p>
			<div class="flex flex-col gap-3">
				<SourceChip source={translatedSource} />
				<SourceChip source={staleSource} />
			</div>
			<p class="mt-3 text-meta text-fg-muted">
				Switch to Română or English above: the chip discloses that the source is German, so opening
				a German PDF is never a surprise.
			</p>
		</section>

		<!-- ── SafetyBanner ───────────────────────────────────────────────── -->
		<section id="safetybanner" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">SafetyBanner</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Red appears nowhere else in the system. <code class="text-meta">stop</code> uses
				<code class="text-meta">role="alert"</code>
				so it interrupts a screen reader; <code class="text-meta">caution</code> uses
				<code class="text-meta">role="note"</code> so it does not.
			</p>
			<div class="flex flex-col gap-3">
				<SafetyBanner level="caution">
					Schutzbrille und Handschuhe erforderlich, bevor du die Klappe öffnest.
				</SafetyBanner>
				<SafetyBanner level="stop">
					Dieser Fehler betrifft die Verriegelung. Ich gebe dazu keine Anleitung. Hol eine
					Elektrofachkraft.
				</SafetyBanner>
			</div>
		</section>

		<!-- ── EscalationCard ─────────────────────────────────────────────── -->
		<section id="escalation" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">EscalationCard</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				The most important component in the system. A named person, an observed wait rather than a
				promise, and permission to walk away. On capture it credits the worker before the system.
			</p>
			<div class="mb-6">
				<p class="mb-2 text-meta font-bold text-fg-muted">waiting</p>
				<EscalationCard {escalation} />
			</div>
			<div>
				<p class="mb-2 text-meta font-bold text-fg-muted">answered · the capture moment</p>
				<EscalationCard escalation={answered} />
			</div>
		</section>

		<!-- ── Office register ────────────────────────────────────────────── -->
		<!--
			Deliberately last. The copy below says "everything above this point is
			the floor", which is only true once every floor component has been
			passed. It sat directly under Foundations first, where the sentence was
			a lie, and the divider is here because this is a peer of Foundations
			rather than another component in the list.
		-->
		<hr class="mt-4 mb-10 border-t-2 border-hairline" />
		<section id="register" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">Office register</h2>
			<p class="mt-2 mb-6 max-w-prose text-small text-fg-muted">
				Everything above this point is the floor. Everything here is the office: a shift lead at a
				desk, on a monitor, with a mouse, in normal light. None of the floor's constraints apply
				there, and pretending they do produces a queue you cannot read forty rows of. What forks is
				density, elevation and colour depth. What never forks is the 7:1 text floor, focus,
				<code class="text-meta">t()</code>, and never conveying meaning by colour alone.
			</p>
			<p class="mb-6 max-w-prose text-small text-fg-muted">
				The floor may not use any of these tokens, which is checked rather than trusted:
				<code class="text-meta">scripts/check-register.mjs</code>. This page is exempt because a
				catalogue is not a product surface.
			</p>

			<h3 class="mb-3 text-lead font-bold">Density</h3>
			<div class="mb-8 flex flex-wrap items-end gap-4">
				<div>
					<div class="size-tap rounded-md border-2 border-dashed border-border-strong"></div>
					<p class="mt-2 text-meta text-fg-muted">64px floor · a glove</p>
				</div>
				<div>
					<div class="size-control rounded-md border-2 border-dashed border-border-strong"></div>
					<p class="mt-2 text-meta text-fg-muted">36px office · a cursor</p>
				</div>
				<div>
					<div class="h-row w-40 rounded-md border-2 border-dashed border-border-strong"></div>
					<p class="mt-2 text-meta text-fg-muted">56px row · holds two lines</p>
				</div>
			</div>

			<h3 class="mb-3 text-lead font-bold">Elevation</h3>
			<p class="mb-4 max-w-prose text-small text-fg-muted">
				Two levels, tinted with brand ink rather than black. A shadow says "this floats" and never
				anything else, because it is removed entirely at high contrast. Toggle high contrast in the
				header: both cards keep their boundary, because both carry a hairline as well.
			</p>
			<div class="mb-8 flex flex-wrap gap-4">
				<div class="rounded-md border border-hairline bg-surface p-4 shadow-raised">
					<p class="text-small font-bold">raised</p>
					<p class="text-meta text-fg-muted">chrome content scrolls under</p>
				</div>
				<div class="rounded-md border border-hairline bg-surface p-4 shadow-overlay">
					<p class="text-small font-bold">overlay</p>
					<p class="text-meta text-fg-muted">popovers, tooltips, dialogs</p>
				</div>
			</div>

			<h3 class="mb-3 text-lead font-bold">Chart series</h3>
			<p class="mb-4 max-w-prose text-small text-fg-muted">
				Not brand colours, and they could not be: doinstruct's yellow is 1.1:1 on cream and their
				greens are near-black, so neither sits in the lightness band a chart fill needs. Built
				beside the brand instead. Fixed order, assigned in sequence, never cycled. Validated for
				protanopia and deuteranopia separation against both surfaces.
			</p>
			<div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
				{#each [['bg-series-1', '1 teal'], ['bg-series-2', '2 rust'], ['bg-series-3', '3 violet'], ['bg-series-4', '4 olive'], ['bg-series-5', '5 magenta']] as [cls, name] (name)}
					<div class="overflow-hidden rounded-md border border-hairline">
						<div class="h-12 {cls}"></div>
						<p class="p-2 text-meta font-bold">{name}</p>
					</div>
				{/each}
			</div>
			<p class="mb-8 max-w-prose text-meta text-fg-muted">
				The all-pairs cap is three. In scatter and small-multiple forms, where any two marks can end
				up touching, series 4 and series 2 collapse under deuteranopia. Bars and lines, where only
				neighbours touch, take all five.
			</p>

			<h3 class="mb-3 text-lead font-bold">Magnitude scale</h3>
			<div class="mb-8 flex overflow-hidden rounded-md border border-hairline">
				{#each ['bg-scale-1', 'bg-scale-2', 'bg-scale-3', 'bg-scale-4', 'bg-scale-5'] as cls (cls)}
					<div class="h-12 flex-1 {cls}"></div>
				{/each}
			</div>

			<h3 class="mb-3 text-lead font-bold">Marks, in place</h3>
			<p class="mb-4 max-w-prose text-small text-fg-muted">
				A palette judged from swatches is a palette nobody has read. These bars are one nominal
				series, so every bar takes slot one: colouring them by their own value would spend the
				identity channel re-encoding what length already shows. Rounded at the data end, square
				against the baseline, 2px of surface between them, values in text tokens rather than in the
				series colour.
			</p>
			<div class="rounded-md border border-hairline bg-surface-raised p-4">
				<p class="mb-1 text-small font-bold">Unanswered questions by asset</p>
				<p class="mb-4 text-meta text-fg-muted">Last 30 days · buckets below five suppressed</p>
				<div class="flex flex-col gap-0.5">
					{#each COVERAGE as row (row.asset)}
						<div class="flex items-center gap-3">
							<p class="w-20 shrink-0 text-meta font-bold tabular-nums">{row.asset}</p>
							<div class="flex min-w-0 flex-1 items-center gap-2">
								<!--
									A data-driven width is geometry, not a design decision, so it is
									the one place an inline style is correct rather than a token
									violation. Nothing about the mark's colour or radius is inline.
								-->
								<div
									class="h-4 rounded-e-xs bg-series-1"
									style="width: {(row.unanswered / coverageMax) * 100}%"
								></div>
								<p class="shrink-0 text-meta text-fg-muted tabular-nums">{row.unanswered}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<footer class="border-t-2 border-hairline pt-6">
			<p class="max-w-prose text-small text-fg-muted">
				Contracts live in the header comment of each component file. Rules live in
				<code class="text-meta">AGENTS.md</code>
				and <code class="text-meta">docs/rules/</code>. This page is a dev surface, so its own
				labels are English and exempt from the translation check.
			</p>
		</footer>
	</div>
</div>
