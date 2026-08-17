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

	Content comes from src/lib/data/floor.ts rather than being invented here,
	so switching language in the bar above changes what every component says.
-->
<script lang="ts">
	import Button from '$lib/components/floor/Button.svelte';
	import PushToTalk from '$lib/components/floor/PushToTalk.svelte';
	import LevelMeter from '$lib/components/floor/LevelMeter.svelte';
	import TranscriptConfirm from '$lib/components/floor/TranscriptConfirm.svelte';
	import AnswerCard from '$lib/components/floor/AnswerCard.svelte';
	import StepList from '$lib/components/floor/StepList.svelte';
	import SourceChip from '$lib/components/floor/SourceChip.svelte';
	import SafetyBanner from '$lib/components/floor/SafetyBanner.svelte';
	import EscalationCard from '$lib/components/floor/EscalationCard.svelte';
	import StatusBar from '$lib/components/floor/StatusBar.svelte';
	import LanguagePicker from '$lib/components/floor/LanguagePicker.svelte';
	import AssetLabel from '$lib/components/floor/AssetLabel.svelte';

	import OfficeButton from '$lib/components/office/Button.svelte';
	import Panel from '$lib/components/office/Panel.svelte';
	import TriageBadge from '$lib/components/office/TriageBadge.svelte';
	import FilterGroup from '$lib/components/office/FilterGroup.svelte';
	import QueueRow from '$lib/components/office/QueueRow.svelte';
	import RankedBars from '$lib/components/office/RankedBars.svelte';
	import Trend from '$lib/components/office/Trend.svelte';
	import KnowledgeCard from '$lib/components/office/KnowledgeCard.svelte';
	import OfflineNotice from '$lib/components/office/OfflineNotice.svelte';

	import { base } from '$app/paths';
	import { session } from '$lib/state/session.svelte';
	import { t } from '$lib/i18n/floor';
	import { scenarioById } from '$lib/data/floor';
	import { COVERAGE, COVERAGE_WEEKS, KNOWLEDGE, QUEUE } from '$lib/data/office';
	import { ASSETS } from '$lib/data/assets';
	import { LANGUAGE_LABEL, type Source } from '$lib/domain/types';

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
	 * Chart demo data comes from the real office fixtures rather than being
	 * invented here, for the same reason the floor components pull from the real
	 * scenarios: a gallery that makes up its own content is a gallery that can
	 * drift away from the product without anyone noticing.
	 */
	const docBuckets = COVERAGE.filter((b) => b.triage === 'documentation');
	const docMax = Math.max(...COVERAGE.map((b) => b.count ?? 0), 1);
	const docRows = $derived(
		docBuckets.map((b) => ({
			id: b.id,
			label: b.label,
			detail: b.detail[session.language],
			count: b.count,
			tone: 'bg-series-1'
		}))
	);
	const trendBucket = docBuckets.find((b) => b.trend.length > 0);

	let galleryShift = $state('all');

	/**
	 * What one German food plant's configured language set plausibly looks like.
	 * Endonyms throughout: a worker scanning for their language is not reading
	 * the interface language.
	 */
	const SITE_LANGUAGES = [
		{ code: 'de', label: 'Deutsch' },
		{ code: 'ro', label: 'Română' },
		{ code: 'pl', label: 'Polski' },
		{ code: 'bg', label: 'Български' },
		{ code: 'tr', label: 'Türkçe' },
		{ code: 'uk', label: 'Українська' },
		{ code: 'hu', label: 'Magyar' },
		{ code: 'ar', label: 'العربية' },
		{ code: 'en', label: 'English' }
	];

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
		['language', 'LanguagePicker'],
		['label', 'AssetLabel'],
		['register', 'Office register']
	] as const;
</script>

<svelte:head><title>Ask | Design System</title></svelte:head>

<div class="min-h-dvh bg-surface-sunken">
	<div class="mx-auto max-w-3xl bg-surface px-5 py-10 sm:px-8">
		<header class="mb-10 border-b-2 border-hairline pb-8">
			<h1 class="text-display font-bold">Design system</h1>
			<p class="mt-3 max-w-prose text-body text-fg-muted">
				Toggle <b>Design language</b> to see the proposed rebrand applied to every component on this
				page. It is a real theme, not a mock: same tokens, same components, and every colour pair in
				it is validated by <code class="text-meta">scripts/check-contrast.mjs</code> against the same
				7:1 floor as the shipped palette.
			</p>
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

			<!--
				Language lives here now rather than in StatusBar. StatusBar used to carry
				three language buttons and this page borrowed them; it now carries one
				chip that hands the choice back to the flow, which a catalogue has none
				of. A gallery control is the right home for a gallery affordance.
			-->
			<div class="mt-6 flex flex-wrap gap-3">
				<Button
					variant={session.theme === 'v2' ? 'primary' : 'secondary'}
					onclick={() => session.toggleTheme()}
				>
					Design language: {session.theme === 'v2' ? 'proposed' : 'today'}
				</Button>
				<Button onclick={() => session.toggleContrast()}>
					High contrast: {session.highContrast ? 'on' : 'off'}
				</Button>
				<Button onclick={() => (session.online = !session.online)}>
					Connection: {session.online ? 'online' : 'offline'}
				</Button>
				{#each ['de', 'ro', 'en'] as const as lang (lang)}
					<Button
						variant={session.language === lang ? 'primary' : 'secondary'}
						onclick={() => session.setLanguage(lang)}
					>
						{LANGUAGE_LABEL[lang]}
					</Button>
				{/each}
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
				<StatusBar onchangelanguage={() => {}} />
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
		<!-- Shown on the dark ground because that is the only ground it has. Its
		     three live states render in a footer that follows the screen, and the
		     screen is dark for standby, listening and thinking. -->
		<section id="pushtotalk" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">PushToTalk</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				Hold to talk, never tap to toggle, so "this is not recording you" is a physical property of
				the control. Five states.
			</p>
			<div class="flex flex-col gap-4">
				<div class="ground-dark rounded-lg bg-surface-inverse p-4">
					<p class="mb-2 text-meta font-bold text-fg-inverse-muted">idle</p>
					<PushToTalk state="idle" label={t('ptt.idle')} />
				</div>
				<div class="ground-dark rounded-lg bg-surface-inverse p-4">
					<p class="mb-2 text-meta font-bold text-fg-inverse-muted">listening</p>
					<PushToTalk state="listening" label={t('ptt.listening')} level={0.7} />
				</div>
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">listening · loud room</p>
					<PushToTalk state="listening" label={t('ptt.listening')} level={0.5} noisy />
				</div>
				<div class="ground-dark rounded-lg bg-surface-inverse p-4">
					<p class="mb-2 text-meta font-bold text-fg-inverse-muted">thinking</p>
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

		<!-- ── LanguagePicker ─────────────────────────────────────────────── -->
		<section id="language" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">LanguagePicker</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				The first screen after the QR code, and the fix for the worst assumption in the first build,
				which defaulted silently to Romanian. Nothing here depends on already knowing the worker's
				language: the machine context is identifiers, and the one word of chrome renders in every
				offered language at once, read out of the dictionary so it cannot drift.
			</p>
			<p class="mb-5 max-w-prose text-small text-fg-muted">
				Shown here at nine, which is the shape a real site has. A worker never picks from
				doinstruct's 35+; they pick from the languages the content in front of them exists in, and
				the employer configures that set. The product passes three because three is what these
				scenarios are translated into. Past roughly a dozen this needs a search field, and saying so
				is better than pretending nine and thirty are the same problem. Arabic is in the list on
				purpose: it is right to left, and this system's RTL gap is real and named in
				<code class="text-meta">docs/rules/accessibility.md</code>.
			</p>
			<div class="h-frame overflow-hidden rounded-lg border-2 border-ink sm:h-auto">
				<!-- The picker takes its ground from the route it lives in, so the
				     catalogue has to supply one. -->
				<div class="ground-dark flex h-125 flex-col bg-surface-inverse text-fg-inverse">
					<LanguagePicker options={SITE_LANGUAGES} onchoose={() => {}} />
				</div>
			</div>
		</section>

		<!-- ── AssetLabel ─────────────────────────────────────────────────── -->
		<section id="label" class="mb-14 scroll-mt-4">
			<h2 class="text-title font-bold">AssetLabel</h2>
			<p class="mt-2 mb-5 max-w-prose text-small text-fg-muted">
				The product's front door, and the one part of it that is not a screen. Every claim about no
				app, no login and no barriers rests on a worker scanning a piece of adhesive vinyl on a wet
				machine, and until now nobody had designed it.
			</p>
			<p class="mb-5 max-w-prose text-small text-fg-muted">
				The codes below are real. Point a phone at one and it opens this prototype already knowing
				which machine you are standing at, because that is the entire mechanism: the QR carries the
				identity, so the person does not have to. Generated at build time by
				<code class="text-meta">scripts/generate-labels.mjs</code>, committed as SVG, so the device
				pays nothing for them.
			</p>
			<p class="mb-5 max-w-prose text-small text-fg-muted">
				The asset ID is set as large as it is because it is the fallback, not a caption. Cameras
				fail: cracked lens, greasy screen, permission never granted, phone in a locker. That number
				is what a worker reads out over the line noise. Two printed languages rather than nine,
				because a site can run nine on screen and still not fit nine on 80mm of vinyl.
			</p>
			<div class="flex flex-wrap gap-6">
				{#each ['AST-3121', 'AST-1180'] as id (id)}
					<AssetLabel
						asset={ASSETS[id]}
						instruction={['Frage stellen. Kein Login.', 'Ask a question. No login.']}
						href="{base}/labels/{id}.svg"
					/>
				{/each}
			</div>
			<p class="mt-5 max-w-prose text-meta text-fg-muted">
				Laminated or on washdown-safe vinyl; paper lasts one shift in a wet zone. Eye height, on a
				fixed panel and never on a guard door, both because a moving target is hard to scan and
				because the label has to stay readable while the machine is locked out. Out of the spray
				path of a CIP nozzle. Replaced when the machine is, which is the failure this product
				handles rather than prevents: an outlived sticker resolves to nothing and the app says so
				instead of guessing.
			</p>
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
				A palette judged from swatches is a palette nobody has read. This is the real
				<code class="text-meta">RankedBars</code> component on the real coverage fixtures, not a mock
				of it: a gallery that reimplements what it documents is a gallery that drifts. One nominal series,
				so every bar takes slot one, because colouring them by their own value would spend the identity
				channel re-encoding what length already shows. The last row is below the suppression threshold
				and says so instead of drawing a very short bar.
			</p>
			<div class="rounded-md border border-hairline bg-surface-raised p-4">
				<p class="mb-1 text-small font-bold">Unanswered questions, documentation gaps</p>
				<p class="mb-4 text-meta text-fg-muted">Last 6 weeks · buckets below five suppressed</p>
				<RankedBars rows={docRows} max={docMax} suppressedLabel="Too few to show" />
			</div>

			<h3 class="mt-8 mb-3 text-lead font-bold">Office components</h3>
			<p class="mb-4 max-w-prose text-small text-fg-muted">
				The desk-register set. Contracts live in each file's header, same as the floor components
				above. Content comes from the office fixtures, so switching language in the header changes
				what these say too.
			</p>

			<div class="flex flex-col gap-6">
				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						Button · 36px, ink rather than yellow
					</p>
					<div class="flex flex-wrap items-center gap-2">
						<OfficeButton variant="primary">primary</OfficeButton>
						<OfficeButton>secondary</OfficeButton>
						<OfficeButton variant="quiet">quiet</OfficeButton>
						<OfficeButton disabled>disabled</OfficeButton>
					</div>
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						TriageBadge · icon and word, never colour alone
					</p>
					<div class="flex flex-wrap gap-4">
						<TriageBadge triage="documentation" showAction />
						<TriageBadge triage="machine" showAction />
						<TriageBadge triage="people" showAction />
					</div>
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">FilterGroup · radios, not buttons</p>
					<FilterGroup
						label="Shift"
						options={[
							{ value: 'all', label: 'All' },
							{ value: 'early', label: 'Early' },
							{ value: 'late', label: 'Late' }
						]}
						bind:value={galleryShift}
						name="gallery-shift"
					/>
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						Panel · flat, raised, overlay. Toggle high contrast: the shadows go, the hairlines stay.
					</p>
					<div class="grid gap-3 sm:grid-cols-3">
						<Panel level={3} title="flat"><p class="px-4 py-3 text-meta">on the plane</p></Panel>
						<Panel level={3} title="raised" elevation="raised">
							<p class="px-4 py-3 text-meta">chrome content scrolls under</p>
						</Panel>
						<Panel level={3} title="overlay" elevation="overlay">
							<p class="px-4 py-3 text-meta">genuinely detached</p>
						</Panel>
					</div>
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						Trend · six points, values printed. Four is the floor; below it the component says so
						rather than drawing a line through noise.
					</p>
					<div class="grid gap-6 rounded-md border border-hairline bg-surface p-4 sm:grid-cols-2">
						<Trend
							values={trendBucket?.trend ?? []}
							labels={COVERAGE_WEEKS}
							title="Trend · documentation gap"
							tooFew="Too little data for a trend."
						/>
						<Trend
							values={[2, 3]}
							labels={COVERAGE_WEEKS}
							tone="text-series-2"
							title="Trend · not enough points"
							tooFew="Too little data for a trend."
						/>
					</div>
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						QueueRow · the whole row is the target, and the wait carries the emphasis rather than
						the name
					</p>
					<div class="overflow-hidden rounded-md border border-hairline">
						<div class="divide-y divide-hairline">
							{#each QUEUE.slice(0, 2) as item, i (item.id)}
								<QueueRow {item} selected={i === 0} onselect={() => {}} />
							{/each}
						</div>
					</div>
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						OfflineNotice · the office's one honestly degraded state. Toggle Connection in the
						header; it renders nothing while online.
					</p>
					<OfflineNotice />
				</div>

				<div>
					<p class="mb-2 text-meta font-bold text-fg-muted">
						KnowledgeCard · every field is one an auditor asks for
					</p>
					<div class="overflow-hidden rounded-md border border-hairline bg-surface">
						<KnowledgeCard entry={KNOWLEDGE[0]} />
					</div>
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
