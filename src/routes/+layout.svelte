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
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
