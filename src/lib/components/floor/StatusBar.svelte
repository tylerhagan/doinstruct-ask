<!--
	@component
	StatusBar: persistent device context. Always visible, never scrolls away.

	CONTRACT
	- onchangelanguage: () => void   returns the flow to the language picker

	It still reads `session` for machine context and contrast, because those are
	device facts rather than flow state. Language is different now: changing it
	means going back to a screen, and screens are the state machine's business.
	So it is a callback, like every other gesture a component reports.

	WHY THIS IS NO LONGER A ROW OF LANGUAGE BUTTONS
	It used to carry three, one per language, permanently. That made sense when
	the app opened straight into an interface and language was the only way out
	of the wrong one. Now the worker picks a language before anything else, and
	three buttons spend a 64px row of a 440px screen on a choice they made ten
	seconds ago, competing with the answer they are trying to read.

	Deleting it outright is not the answer either: a mis-tap on the picker strands
	someone in a script they cannot read, and the way back has to be obvious and
	must not depend on reading. So it collapses to one control showing the current
	language in its own script. The label doubles as the status, it needs no
	translation to be understood, and it is one tap either way.

	RULES
	- The machine context is displayed, never entered. It comes from the QR code
	  on the machine. Asking a gloved technician to type an asset ID is a design
	  failure.
	- Languages are labelled in their own script. "Română", not "Romanian". A
	  worker scanning for their language does not read the interface language.
	- Language and contrast are the only two settings. There is no settings
	  screen, because a shared device has no one to own preferences, and because
	  a worker in glare should not have to go looking.
-->
<script lang="ts">
	import { session } from '$lib/state/session.svelte';
	import { LANGUAGE_LABEL } from '$lib/domain/types';
	import { t } from '$lib/i18n/floor';

	interface Props {
		onchangelanguage: () => void;
	}

	let { onchangelanguage }: Props = $props();
</script>

<header class="border-b-2 border-hairline bg-surface-raised">
	<div class="flex items-center justify-between gap-3 px-4 py-3">
		<div class="min-w-0">
			<p class="truncate text-small font-bold">{session.machine.line}</p>
			<p class="truncate text-meta text-fg-muted">
				{session.machine.machine} · {session.machine.assetId}
			</p>
		</div>

		<div class="flex shrink-0 items-center gap-2">
			{#if !session.online}
				<span
					class="rounded-full border-2 border-caution bg-caution-surface px-3 py-1 text-meta font-bold text-caution"
				>
					{t('status.offline')}
				</span>
			{/if}

			<!-- Current language, and the way back to the picker. The visible text is
			     the endonym, so it is legible to the one person who most needs it:
			     someone who chose the wrong language and cannot read the rest. -->
			<button
				type="button"
				onclick={onchangelanguage}
				aria-label={t('status.changeLanguage')}
				lang={session.language}
				class="flex min-h-tap items-center rounded-md border-2 border-hairline bg-surface px-3
				       text-meta font-bold transition-colors"
			>
				{LANGUAGE_LABEL[session.language]}
			</button>

			<button
				type="button"
				onclick={() => session.toggleContrast()}
				aria-pressed={session.highContrast}
				aria-label={t('status.contrast')}
				class="flex min-h-tap items-center gap-2 rounded-md border-2 border-hairline bg-surface px-3 transition-colors"
			>
				<svg class="size-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" />
					<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
				</svg>
				<span class="text-meta font-bold">{t('status.contrastShort')}</span>
			</button>
		</div>
	</div>
</header>
