<!--
	@component
	OfficeRail: navigation and utilities for the office register.

	A side rail from `md` up, a two-row bar below it. Extracted from the layout
	because it had grown past the point where it could be read in place, and
	because a navigation this load-bearing deserves its own contract.

	WHAT WAS WRONG WITH THE FIRST VERSION, SINCE TWO OF THEM WERE NOT COSMETIC
	- **Language and the link back to the device were `hidden md:block`.** On a
	  phone a supervisor could not change language at all, on a surface whose own
	  case study argues that language is the product. The composer is explicitly
	  meant to work standing up between two jobs, so "desktop only" was the wrong
	  answer to a layout problem.
	- **The switcher truncated the endonym.** "Română" rendered as "Ro". The floor
	  holds the rule that a worker scanning for their language is not reading the
	  interface language, and the office quietly chopped the labels to fit.
	- Three fixed buttons, which is exactly the pattern the floor picker was
	  rebuilt to avoid: it quietly claims the product speaks three languages. A
	  select scales to the thirty-five doinstruct advertises without a redesign,
	  and comes with keyboard and screen-reader behaviour already correct.
	- No icons, a bare number for a badge, and utilities styled unlike the
	  navigation beside them, so nothing had a visual system.

	RULES
	- Icons are paired with text, always. They make a rail scannable; they never
	  carry the meaning.
	- The queue badge encodes urgency in form as well as number: it takes the
	  caution treatment once the oldest question has waited over two hours, so
	  "someone has been stuck a while" reads without arithmetic.
	- No yellow. There is no voice action at a desk, so the register spends none
	  of the one reserved colour. Cream marks the current page.
	- Grouped: identity, then where you can go, then what you can change, then the
	  way out to the other surface. A hairline separates navigation from
	  utilities, so the second group reads as secondary without being hidden.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { session } from '$lib/state/session.svelte';
	import { office } from '$lib/state/office.svelte';
	import { tOffice } from '$lib/i18n/office';
	import { LANGUAGE_LABEL, type Language } from '$lib/domain/types';

	const LANGS: Language[] = ['de', 'ro', 'en'];

	const NAV = [
		{ href: '/office', key: 'nav.queue', icon: 'queue' },
		{ href: '/office/coverage', key: 'nav.coverage', icon: 'gaps' },
		{ href: '/office/knowledge', key: 'nav.knowledge', icon: 'knowledge' }
	] as const;

	/** `/office` must match exactly, or it stays current on every child route. */
	const isCurrent = (href: string) =>
		href === '/office' ? page.url.pathname === '/office' : page.url.pathname.startsWith(href);
</script>

{#snippet icon(name: string)}
	<!-- Hidden on the narrowest phones. accessibility.md pairs every icon with
	     text, which means the text is load-bearing and the icon is not, so it is
	     the half that gives way when a row runs out of room. -->
	<svg
		class="hidden size-4 shrink-0 xs:block"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-width="1.75"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if name === 'queue'}
			<path d="M2 9.5h3l1 2h4l1-2h3" />
			<path d="M2.5 9.5 4 3h8l1.5 6.5v3a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
		{:else if name === 'gaps'}
			<path d="M3 13V7M8 13V3" />
			<path d="M13 13v-3" stroke-dasharray="2 2" />
			<path d="M1.5 14.5h13" />
		{:else}
			<path d="M4 2h5l3 3v9H4z" />
			<path d="M9 2v3h3" />
			<path d="M6.25 10.25 7.5 11.5 10 9" />
		{/if}
	</svg>
{/snippet}

<div class="flex flex-col gap-3 px-3 py-3 md:h-full md:gap-4 md:px-3 md:py-4">
	<!-- Identity. Typographic rather than an invented mark: this is doinstruct's
	     product, and drawing a logo for it would be a misread. -->
	<div class="flex items-center justify-between gap-3 md:block">
		<div class="min-w-0 px-1">
			<p class="truncate text-small font-bold">{tOffice('office.title')}</p>
			<p class="truncate text-meta text-fg-inverse-muted">{tOffice('office.plant')}</p>
		</div>
	</div>

	<nav aria-label={tOffice('nav.label')}>
		<!--
			Content width on a phone, not equal thirds. `flex-1` split the row three
			ways and the widest item lost: "Offen" truncated to "O" while "Wissen"
			had room to spare, because the queue item also carries a badge. Sized to
			content they all fit at 320px. In the column from `md` up, stretch is the
			flex default and does the right thing anyway.
		-->
		<ul class="flex justify-between gap-1 md:flex-col md:justify-start">
			{#each NAV as link (link.href)}
				{@const current = isCurrent(link.href)}
				<li class="min-w-0">
					<a
						href={link.href}
						aria-current={current ? 'page' : undefined}
						class="flex min-h-control min-w-0 items-center gap-2.5 rounded-md px-3 text-small font-bold
						       transition-colors
						       {current
							? 'bg-surface text-ink'
							: 'text-fg-inverse-muted hover:bg-surface-inverse-raised hover:text-fg-inverse'}"
					>
						{@render icon(link.icon)}
						<span class="min-w-0 truncate">{tOffice(link.key)}</span>

						{#if link.href === '/office' && office.open.length > 0}
							<span
								class="ms-auto shrink-0 rounded-full px-2 py-0.5 text-meta font-bold tabular-nums
								       {office.overdue
									? 'bg-caution-surface text-caution'
									: current
										? 'bg-ink text-fg-inverse'
										: 'bg-surface-inverse-raised text-fg-inverse'}"
								aria-label={tOffice('nav.waitingCount', { n: office.peopleWaiting })}
							>
								{office.open.length}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Utilities. Below the rule on a desk, beside the navigation on a phone,
	     and present in both, which the first version was not. -->
	<div
		class="flex flex-wrap items-end gap-2 md:mt-auto md:flex-col md:items-stretch md:gap-3
	            md:border-t md:border-hairline-inverse md:pt-4"
	>
		<label class="min-w-0 flex-1 md:flex-none">
			<span class="mb-1 block px-1 text-meta font-bold text-fg-inverse-muted">
				{tOffice('status.language')}
			</span>
			<div class="relative">
				<select
					value={session.language}
					onchange={(e) => session.setLanguage(e.currentTarget.value as Language)}
					class="min-h-control w-full appearance-none rounded-md border border-hairline-inverse
					       bg-surface-inverse-raised ps-3 pe-8 text-meta font-bold text-fg-inverse"
				>
					{#each LANGS as lang (lang)}
						<!-- Endonyms, in full. "Română", never "Ro". -->
						<option value={lang} {lang}>{LANGUAGE_LABEL[lang]}</option>
					{/each}
				</select>
				<svg
					class="pointer-events-none absolute inset-y-0 end-2.5 my-auto size-4 text-fg-inverse-muted"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m4 6 4 4 4-4" />
				</svg>
			</div>
		</label>

		<button
			type="button"
			onclick={() => session.toggleContrast()}
			aria-pressed={session.highContrast}
			class="flex min-h-control shrink-0 items-center gap-2 rounded-md border border-hairline-inverse
			       px-3 transition-colors md:w-full
			       {session.highContrast ? 'bg-surface text-ink' : 'bg-surface-inverse-raised text-fg-inverse'}"
		>
			<svg class="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" />
				<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
			</svg>
			<span class="text-meta font-bold">{tOffice('status.contrastShort')}</span>
		</button>

		<a
			href="/"
			class="flex min-h-control w-full items-center gap-2 rounded-md px-3 text-meta font-bold
			       text-fg-inverse-muted transition-colors hover:bg-surface-inverse-raised
			       hover:text-fg-inverse"
		>
			<svg
				class="size-4 shrink-0"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<rect x="4.5" y="1.5" width="7" height="13" rx="1.5" />
				<path d="M7 12.5h2" />
			</svg>
			<span class="truncate">{tOffice('nav.toFloor')}</span>
		</a>
	</div>
</div>
