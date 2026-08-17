<!--
	@component
	LanguagePicker: the first screen after the QR code.

	CONTRACT
	- options:  { code, label }[]  languages the CONTENT exists in, any length
	- onchoose: (code: string) => void

	WHY THIS EXISTS
	The first version of this prototype silently defaulted to Romanian and buried
	language in a status bar. doinstruct's own flow is scan, pick a language,
	begin, and theirs is better: it is already familiar to every worker who has
	used the training product. See docs/office-surface.md.

	WHY IT TAKES A LIST RATHER THAN THE THREE THIS PROTOTYPE HAS
	doinstruct advertises 35+ languages, and a first pass at this screen rendered
	three fixed buttons, which quietly claims the product speaks three.

	But a worker never picks from 35. They pick from the languages the content in
	front of them actually exists in, which for one German food plant is more like
	six to ten: German, Romanian, Polish, Bulgarian, Turkish, Ukrainian, Arabic.
	The employer configures that set; nobody scrolls a language atlas at a machine.

	So the list is data, it is ordered by what the device already tells us, and it
	scrolls. The prototype passes three because three is what the scenarios are
	translated into, and faking a fourth would be a lie told in a language I
	cannot check. `/system` shows it at nine, which is the shape a real site has.

	RULES
	- Nothing here may depend on already knowing the worker's language, because
	  they have not chosen. Machine context is identifiers, which are never
	  translated, and the one word of chrome renders in every offered language at
	  once, read out of the dictionary so it cannot drift.
	- Labels are endonyms. "Română", not "Romanian"; "العربية", not "Arabic". A
	  worker scanning for their language is not reading the interface language.
	- The worker's own language goes first: a previously saved choice if there is
	  one, the device's language otherwise. Remembered as an ordering and never as
	  a skip, because the same URL opens on a shared terminal where the previous
	  person's language is the wrong answer for the next one. One tap for someone
	  returning to their own phone; never a language they cannot read.
	- 64px rows rather than three tall buttons. Tall buttons stop working the
	  moment the list is longer than a screen, which is the normal case.
	- Past roughly a dozen this needs a search field. Nine scrolls fine, thirty
	  does not, and pretending otherwise is where this pattern usually fails.

	THE ONE ICON-ONLY CONTROL IN THE SYSTEM
	Contrast has to be reachable here. High contrast in this product is a response
	to a lighting condition, not a preference, and washdown glare does not wait
	politely until a language has been chosen. A first pass at this screen had no
	contrast control at all, which stranded exactly the person who most needed
	one: unable to read the list, with nothing on screen to fix it.

	accessibility.md rule 5 says every icon is paired with text, and here there is
	no language to write the text in. So this is the documented exception, and it
	is narrow for three reasons: there is genuinely no locale yet, the control
	demonstrates its own meaning the instant it is pressed, and it is reversible
	by pressing it again. It still carries a translated accessible name in the
	device's best-guess language, which is better than nothing for a screen reader
	and costs nothing when the guess is wrong.
-->
<script lang="ts">
	import { session } from '$lib/state/session.svelte';
	import { DICT, t } from '$lib/i18n/floor';
	import type { Language } from '$lib/domain/types';

	interface Option {
		code: string;
		label: string;
	}

	interface Props {
		options: Option[];
		onchoose: (code: string) => void;
	}

	let { options, onchoose }: Props = $props();

	/**
	 * Whatever the session already resolved: a saved choice if there is one, the
	 * device's own language otherwise. Computed once, in `session.restore`, so
	 * this component does not repeat the precedence rules and get them subtly
	 * different.
	 */
	const ordered = $derived(
		[...options].sort(
			(a, b) => Number(b.code === session.language) - Number(a.code === session.language)
		)
	);

	/**
	 * "Sprache · Limbă · Language", one word per offered language, built from the
	 * dictionary rather than typed out. Languages with no translation of the word
	 * fall back to their own name, which is still unambiguous in context.
	 * Deduplicated in case two locales share it.
	 */
	const label = $derived(
		[...new Set(options.map((o) => DICT[o.code as Language]?.['status.language'] ?? o.label))].join(
			' · '
		)
	);
</script>

<!-- Colour comes from the route's ground, not from here. The picker is one of
     four screens that share it, and four components each painting the same green
     is four places for it to drift. -->
<div class="flex min-h-0 flex-1 flex-col gap-6 p-5">
	<div class="flex shrink-0 justify-end">
		<button
			type="button"
			onclick={() => session.toggleContrast()}
			aria-pressed={session.highContrast}
			aria-label={t('status.contrast')}
			class="flex size-tap items-center justify-center rounded-md border-2 border-hairline-inverse
			       bg-surface-inverse-raised transition-colors"
		>
			<svg class="size-7" viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" />
				<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
			</svg>
		</button>
	</div>

	<!-- The machine and the list travel together and sit optically centred. Top
	     aligned they left a third of the screen empty under the last language,
	     which reads as a list still loading. -->
	<div class="flex min-h-0 flex-1 flex-col justify-center gap-6">
		<div class="shrink-0 text-center">
			<h1 class="sr-only">{t('status.language')}</h1>
			{#if session.machine}
				<p class="text-small font-bold text-fg-inverse-muted">{session.machine.line}</p>
				<p class="text-display font-bold">{session.machine.machine}</p>
				<p class="text-meta text-fg-inverse-muted">
					<span class="plate">{session.machine.assetId}</span>
				</p>
			{:else if session.scannedAsset}
				<!-- The sticker resolved to nothing. Show the code so it can be read out
			     to whoever prints the stickers; the flow carries on regardless. -->
				<p class="text-lead font-bold">{t('machine.unknown')}</p>
				<p class="text-meta text-fg-inverse-muted">{session.scannedAsset}</p>
			{/if}
		</div>

		<!-- Not flex-1. The centring wrapper owns the spare height; if this block
		     claims it too, it grows to fill and the content pins to the top, which
		     is what happened on the first attempt. -->
		<div class="flex min-h-0 flex-col">
			<p class="mb-3 shrink-0 text-center text-small font-bold text-fg-inverse-muted">{label}</p>

			<!--
			Sizes to its content and scrolls only when it runs out of room, rather
			than stretching. Three languages in a box built for nine reads as a
			loading state; `max-h-full` without `flex-1` gives both cases the right
			shape.
		-->
			<ul
				class="max-h-full min-h-0 divide-y-2 divide-hairline-inverse overflow-y-auto rounded-lg
			       border-2 border-hairline-inverse bg-surface-inverse-raised"
			>
				{#each ordered as option (option.code)}
					<li>
						<button
							type="button"
							onclick={() => onchoose(option.code)}
							lang={option.code}
							class="flex min-h-tap w-full items-center px-5 text-lead font-bold transition-colors
						       active:brightness-95"
						>
							{option.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
