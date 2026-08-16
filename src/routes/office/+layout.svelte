<!--
	The office shell.

	Responsive on purpose, and not as a box-ticking exercise. doinstruct's own
	case study says foremen lose their day to repetition, and a foreman is not at
	a desk all day. The composer specifically has to work standing up between two
	jobs, so the shell is a bottom bar on a phone and a side rail from `md` up.

	The register does not change with the viewport. A narrow office screen is
	still the office: a supervisor's own phone, held in a clean hand, not a
	gloved one under washdown lighting. Density stays at the desk floor.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { session } from '$lib/state/session.svelte';
	import { office } from '$lib/state/office.svelte';
	import { tOffice } from '$lib/i18n/office';
	import { LANGUAGE_LABEL, type Language } from '$lib/domain/types';

	let { children }: { children: Snippet } = $props();

	const LANGS: Language[] = ['de', 'ro', 'en'];

	const NAV = [
		{ href: '/office', key: 'nav.queue' },
		{ href: '/office/coverage', key: 'nav.coverage' },
		{ href: '/office/knowledge', key: 'nav.knowledge' }
	] as const;

	/**
	 * No yellow anywhere in this register, including the "you are here" marker.
	 *
	 * A first pass used it for the active nav item and the active language, which
	 * broke the one-yellow-per-screen rule twice on the same rail and, worse,
	 * contradicted this register's own Button contract: yellow means "this is the
	 * voice action" and there is no voice action at a desk. Cream on the dark
	 * ground marks the current page instead, which reads just as loudly and
	 * spends nothing reserved.
	 */

	/** `/office` must match exactly, or it stays highlighted on every child. */
	const isCurrent = (href: string) =>
		href === '/office' ? page.url.pathname === '/office' : page.url.pathname.startsWith(href);
</script>

<svelte:head><title>Ask | {tOffice('office.title')}</title></svelte:head>

<div class="min-h-dvh bg-surface-sunken">
	<div class="mx-auto flex min-h-dvh max-w-office flex-col md:flex-row">
		<!-- Rail on a desk, bottom bar on a phone. -->
		<header
			class="sticky top-0 z-10 order-1 border-b border-hairline-inverse bg-surface-inverse
			       text-fg-inverse md:order-none md:flex md:w-56 md:shrink-0 md:flex-col
			       md:border-e md:border-b-0"
		>
			<div class="flex items-center justify-between gap-3 px-4 py-3 md:block">
				<div class="min-w-0">
					<p class="truncate text-small font-bold">{tOffice('office.title')}</p>
					<p class="truncate text-meta text-fg-inverse-muted">{tOffice('office.plant')}</p>
				</div>

				<button
					type="button"
					onclick={() => session.toggleContrast()}
					aria-pressed={session.highContrast}
					class="flex min-h-control shrink-0 items-center gap-2 rounded-md border
					       border-hairline-inverse bg-surface-inverse-raised px-3 transition-colors
					       md:mt-3 md:w-full"
				>
					<svg class="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" />
						<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
					</svg>
					<span class="text-meta font-bold">{tOffice('status.contrastShort')}</span>
				</button>
			</div>

			<nav aria-label={tOffice('nav.label')} class="px-2 pb-2 md:px-2">
				<ul class="flex gap-1 md:flex-col">
					{#each NAV as link (link.href)}
						<li class="min-w-0 flex-1">
							<a
								href={link.href}
								aria-current={isCurrent(link.href) ? 'page' : undefined}
								class="flex min-h-control items-center justify-between gap-2 rounded-md px-3
								       text-small font-bold transition-colors
								       {isCurrent(link.href)
									? 'bg-surface text-ink'
									: 'text-fg-inverse-muted hover:bg-surface-inverse-raised hover:text-fg-inverse'}"
							>
								<span class="truncate">{tOffice(link.key)}</span>
								{#if link.href === '/office' && office.open.length > 0}
									<span class="text-meta tabular-nums">{office.open.length}</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Language sits with the rest of the chrome, and switching it changes
			     the questions themselves, not only the labels. -->
			<div class="hidden px-2 pb-2 md:block">
				<p class="px-3 pb-1 text-meta font-bold text-fg-inverse-muted">
					{tOffice('status.language')}
				</p>
				<div class="flex gap-1">
					{#each LANGS as lang (lang)}
						<button
							type="button"
							onclick={() => session.setLanguage(lang)}
							aria-pressed={session.language === lang}
							class="min-h-control flex-1 rounded-md border px-2 text-meta font-bold transition-colors
							       {session.language === lang
								? 'border-surface bg-surface text-ink'
								: 'border-hairline-inverse bg-surface-inverse-raised text-fg-inverse-muted hover:text-fg-inverse'}"
						>
							{LANGUAGE_LABEL[lang].slice(0, 2)}
						</button>
					{/each}
				</div>
			</div>

			<div class="mt-auto hidden px-2 pb-3 md:block">
				<a
					href="/"
					class="flex min-h-control items-center rounded-md px-3 text-meta font-bold
					       text-fg-inverse-muted transition-colors hover:bg-surface-inverse-raised
					       hover:text-fg-inverse"
				>
					{tOffice('nav.toFloor')}
				</a>
			</div>
		</header>

		<main class="order-2 min-w-0 flex-1 p-4 md:order-none md:p-6">
			{@render children()}
		</main>
	</div>
</div>
