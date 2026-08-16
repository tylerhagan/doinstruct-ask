<!--
	@component
	LanguagePicker: the first screen after the QR code.

	CONTRACT
	- onchoose: (lang: Language) => void

	WHY THIS EXISTS
	The first version of this prototype silently defaulted to Romanian and buried
	language in a status bar. Reading doinstruct's product pages properly showed
	that is not their flow: theirs is scan, pick a language, begin. Theirs is
	better, and it is already familiar to every worker who has used the training
	product, so the prototype now matches it. See docs/office-surface.md.

	RULES
	- Nothing on this screen depends on already knowing the worker's language,
	  because they have not chosen yet. The machine context is identifiers, which
	  are never translated. The one word of chrome is rendered in all three
	  languages at once, read straight out of the dictionary so it cannot drift.
	- Languages are labelled in their own script. "Română", not "Romanian". A
	  worker scanning for their language does not read the interface language.
	- 96px targets, not 64px. This is the primary action of the screen and it is
	  the first thing a gloved hand touches.
	- The accessible name uses the device's current language, which is the best
	  available guess before a choice exists. Naming it in one language is better
	  than leaving the heading unnamed.
-->
<script lang="ts">
	import { LANGUAGE_LABEL, type Language } from '$lib/domain/types';
	import { session } from '$lib/state/session.svelte';
	import { DICT, t } from '$lib/i18n/floor';

	interface Props {
		onchoose: (lang: Language) => void;
	}

	let { onchoose }: Props = $props();

	const LANGS: Language[] = ['de', 'ro', 'en'];

	/**
	 * "Sprache · Limbă · Language", built from the dictionary rather than typed
	 * out, so adding a language cannot leave this line behind. Deduplicated in
	 * case two locales share the word.
	 */
	const label = [...new Set(LANGS.map((l) => DICT[l]['status.language']))].join(' · ');
</script>

<div class="flex flex-1 flex-col justify-center gap-8 p-5">
	<div class="text-center">
		<h1 class="sr-only">{t('status.language')}</h1>
		<p class="text-small font-bold text-fg-muted">{session.machine.line}</p>
		<p class="text-display font-bold">{session.machine.machine}</p>
		<p class="text-meta text-fg-muted">{session.machine.assetId}</p>
	</div>

	<div>
		<p class="mb-3 text-center text-small font-bold text-fg-muted">{label}</p>
		<div class="flex flex-col gap-3">
			{#each LANGS as lang (lang)}
				<button
					type="button"
					onclick={() => onchoose(lang)}
					class="min-h-tap-primary w-full rounded-lg border-2 border-hairline bg-surface-raised
					       px-5 text-title font-bold transition-colors active:brightness-95"
				>
					{LANGUAGE_LABEL[lang]}
				</button>
			{/each}
		</div>
	</div>
</div>
