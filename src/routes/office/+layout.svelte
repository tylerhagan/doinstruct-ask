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
	import { tOffice } from '$lib/i18n/office';
	import OfficeRail from '$lib/components/office/OfficeRail.svelte';

	let { children }: { children: Snippet } = $props();

	/**
	 * Focus follows the route, for the same reason it follows the phase on the
	 * floor. SvelteKit does not move it on client-side navigation, so a keyboard
	 * user clicking a rail item stays in the rail on a page whose content they
	 * were never taken to. Skipped on first paint.
	 */
	let mainEl = $state<HTMLElement | null>(null);
	let focusReady = false;

	$effect(() => {
		page.url.pathname;
		if (!focusReady) {
			focusReady = true;
			return;
		}
		mainEl?.focus();
	});
</script>

<svelte:head><title>Ask | {tOffice('office.title')}</title></svelte:head>

<!-- The ground is the sunken step, so panels read as sitting on the page rather
     than as boxes drawn beside it. Two surfaces plus a shadow is the whole
     hierarchy; a third would be decoration. -->
<div class="min-h-dvh bg-surface-sunken">
	<div class="flex min-h-dvh flex-col md:flex-row">
		<!-- Rail on a desk, bottom bar on a phone. -->
		<!--
			The rail is exactly one viewport tall from `md` up, and scrolls inside
			itself if it ever outgrows one.

			It used to be as tall as the page, because a flex child stretches by
			default and the page is long. That made `mt-auto` on the utilities push
			them to the bottom of a two-thousand pixel column rather than to the
			bottom of the screen, so language and contrast sat below the fold on
			every screen with a queue in it. `self-start` is the part that is easy
			to miss: a stretched item has no room to move, so sticky does nothing
			until you stop it stretching.
		-->
		<header
			class="ground-dark sticky top-0 z-10 order-1 border-b border-hairline-inverse
			       bg-surface-inverse text-fg-inverse md:order-none md:flex md:h-dvh md:w-60
			       md:shrink-0 md:flex-col md:self-start md:overflow-y-auto md:border-e md:border-b-0"
		>
			<OfficeRail />
		</header>

		<!-- Flush, because each screen opens with its own dark header band and the
		     band has to reach the edges to close the L with the rail. Padding is
		     the page's business now. -->
		<main
			bind:this={mainEl}
			tabindex="-1"
			class="order-2 min-w-0 flex-1 outline-none md:order-none"
		>
			{@render children()}
		</main>
	</div>
</div>
