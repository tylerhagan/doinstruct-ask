<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { session } from '$lib/state/session.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => session.restore());

	// Contrast is applied at the document root so it also covers the scrollbar and
	// any portalled content. Written as an effect rather than a class binding
	// because the toggle lives three components away from <html>.
	$effect(() => {
		document.documentElement.dataset.contrast = session.highContrast ? 'high' : 'normal';
	});

	/**
	 * Languages written right to left. None of the three this prototype ships,
	 * but doinstruct advertises 35+ and that list includes Arabic and Dari, so
	 * the mechanism exists rather than the assumption.
	 */
	const RTL = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd', 'yi']);

	/**
	 * The document's own language and direction follow the worker's choice.
	 *
	 * `app.html` hard-codes `lang="en"`, which was wrong for every German and
	 * Romanian screen in the product: a screen reader announces the document
	 * language it is told, so it was reading German copy in an English voice, and
	 * hyphenation and quote marks were resolved against the wrong locale too. It
	 * cost one line and it had been wrong since the first version.
	 *
	 * `dir` is set from the same place, so the day an Arabic translation lands
	 * every logical property in the system flips on its own and the only work
	 * left is mirroring directional icons, which `rtl:` variants already handle.
	 */
	$effect(() => {
		document.documentElement.lang = session.language;
		document.documentElement.dir = RTL.has(session.language) ? 'rtl' : 'ltr';
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
