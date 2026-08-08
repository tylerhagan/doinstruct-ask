<!--
	/system, the design system gallery.

	This route exists for two audiences: an engineer who needs to see what exists
	before writing a prompt, and an agent that has been pointed at it to ground a
	change. Every component in the system appears here in every state.
-->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import SourceChip from '$lib/components/SourceChip.svelte';
	import SafetyBanner from '$lib/components/SafetyBanner.svelte';
	import { session } from '$lib/state/session.svelte';
	import type { Source } from '$lib/domain/types';

	const source: Source = {
		id: 'src-1',
		document: 'Wartungshandbuch Füller F2',
		section: '§4.2 Fehlercode E-212',
		page: 87,
		language: 'de',
		updatedAt: '2026-05-02'
	};
</script>

<svelte:head><title>Ask | Design System</title></svelte:head>

<div class="mx-auto max-w-2xl px-5 py-10">
	<header class="mb-10">
		<h1 class="text-display font-bold">Design system</h1>
		<p class="mt-2 text-body text-fg-muted">
			Every component, every state. Sized for a gloved hand on a shared wall-mounted device.
		</p>
		<div class="mt-5">
			<Button size="md" onclick={() => session.toggleContrast()}>
				High contrast: {session.highContrast ? 'on' : 'off'}
			</Button>
		</div>
	</header>

	<section class="mb-10">
		<h2 class="mb-4 text-title font-bold">Button</h2>
		<div class="flex flex-col gap-3">
			<Button variant="primary" size="lg" full>Halt gedrückt und frag</Button>
			<Button variant="secondary">Vorlesen</Button>
			<Button variant="stop">Sicherheitsstopp</Button>
			<Button variant="quiet">Hat nicht geholfen</Button>
			<Button variant="secondary" disabled>Offline</Button>
		</div>
	</section>

	<section class="mb-10">
		<h2 class="mb-4 text-title font-bold">SourceChip</h2>
		<SourceChip {source} />
	</section>

	<section class="mb-10">
		<h2 class="mb-4 text-title font-bold">SafetyBanner</h2>
		<div class="flex flex-col gap-3">
			<SafetyBanner level="caution">
				Schutzbrille und Handschuhe erforderlich, bevor du die Klappe öffnest.
			</SafetyBanner>
			<SafetyBanner level="stop">
				Dieser Fehler betrifft die Verriegelung. Ich gebe dazu keine Anleitung. Hol eine
				Elektrofachkraft.
			</SafetyBanner>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-title font-bold">Type scale</h2>
		<p class="text-meta text-fg-muted">meta 14: timestamps and audit refs only</p>
		<p class="text-small">small 16: supporting labels</p>
		<p class="text-body">body 18: all answer text</p>
		<p class="text-lead">lead 22: procedure steps</p>
		<p class="text-title font-bold">title 28</p>
		<p class="text-display font-bold">display 34</p>
	</section>
</div>
