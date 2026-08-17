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
	<div class="mx-auto flex min-h-dvh max-w-office flex-col md:flex-row">
		<!-- Rail on a desk, bottom bar on a phone. -->
		<header
			class="ground-dark sticky top-0 z-10 order-1 border-b border-hairline-inverse
			       bg-surface-inverse text-fg-inverse md:order-none md:flex md:w-60 md:shrink-0
			       md:flex-col md:border-e md:border-b-0"
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
