<!--
	@component
	StatusBar: persistent device context. Always visible, never scrolls away.

	CONTRACT
	Reads `session` directly. This is an app-level component, not a reusable
	primitive; keeping the wiring here means an agent restyling it cannot
	accidentally break language switching.

	RULES
	- The machine context is displayed, never entered. It comes from the wall mount
	  or an NFC tap. Asking a gloved technician to type an asset ID is a design
	  failure.
	- Languages are labelled in their own script: "Română", not "Romanian". A
	  worker scanning for their language does not read the interface language.
	- Language and contrast are the only two settings. There is no settings screen,
	  because a shared device has no one to own preferences.
-->
<script lang="ts">
	import { session } from '$lib/state/session.svelte';
	import { LANGUAGE_LABEL, type Language } from '$lib/domain/types';
	import { t } from '$lib/i18n/floor';

	const LANGS: Language[] = ['de', 'ro', 'en'];
</script>

<header class="border-b-2 border-hairline bg-surface-raised">
	<div class="flex items-center justify-between gap-4 px-4 py-3">
		<div class="min-w-0">
			<p class="truncate text-small font-bold">{session.machine.line}</p>
			<p class="truncate text-meta text-fg-muted">
				{session.machine.machine} · {session.machine.assetId}
			</p>
		</div>

		<div class="flex items-center gap-2">
			{#if !session.online}
				<span
					class="rounded-full border-2 border-caution bg-caution-surface px-3 py-1 text-meta font-bold text-caution"
				>
					{t('status.offline')}
				</span>
			{/if}
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

	<div class="flex gap-2 px-4 pb-3" role="group" aria-label={t('status.language')}>
		{#each LANGS as lang (lang)}
			<button
				type="button"
				onclick={() => session.setLanguage(lang)}
				aria-pressed={session.language === lang}
				class="min-h-tap flex-1 rounded-md border-2 px-3 text-small font-bold transition-colors
				       {session.language === lang
					? 'border-ink bg-ink text-fg-inverse'
					: 'border-hairline bg-surface text-fg-muted'}"
			>
				{LANGUAGE_LABEL[lang]}
			</button>
		{/each}
	</div>
</header>
