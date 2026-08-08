<!--
	@component
	DemoPanel: reviewer controls. NOT part of the product.

	Deliberately styled as an overlay with a dashed border so nobody mistakes it
	for shipped UI. It exists so the flow can be driven live in a review without
	waiting for a real fault on a real line, and so the three states this product
	can be in (answer, refuse, route to a human) are all reachable in one tap.

	Delete this component and its one usage in `+page.svelte` to ship.
-->
<script lang="ts">
	import { SCENARIOS, type ScenarioId } from '$lib/data/scenarios';
	import { session } from '$lib/state/session.svelte';
	import { recognition } from '$lib/voice/recognition.svelte';

	interface Props {
		scenarioId: ScenarioId;
		onreset?: () => void;
	}

	let { scenarioId = $bindable(), onreset }: Props = $props();

	let open = $state(false);

	function pick(id: ScenarioId) {
		scenarioId = id;
		onreset?.();
	}
</script>

<div class="fixed right-4 bottom-4 z-50 font-mono text-[13px]">
	{#if open}
		<div class="mb-2 w-72 rounded-lg border-2 border-dashed border-ink bg-cream p-4 shadow-none">
			<p class="mb-3 font-bold tracking-wide uppercase">Reviewer controls</p>

			<p class="mb-1 text-fg-muted">Scenario</p>
			<div class="mb-4 flex flex-col gap-1">
				{#each SCENARIOS as s (s.id)}
					<button
						type="button"
						onclick={() => pick(s.id)}
						class="rounded border-2 px-2 py-2 text-left
						       {scenarioId === s.id ? 'border-ink bg-yellow' : 'border-border bg-surface'}"
					>
						{s.label}
					</button>
				{/each}
			</div>

			<p class="mb-1 text-fg-muted">Microphone</p>
			<div class="mb-4 flex gap-1">
				<button
					type="button"
					onclick={() => (recognition.mode = 'live')}
					disabled={!recognition.supported}
					class="flex-1 rounded border-2 px-2 py-2 disabled:opacity-40
					       {recognition.mode === 'live' ? 'border-ink bg-yellow' : 'border-border bg-surface'}"
				>
					live
				</button>
				<button
					type="button"
					onclick={() => (recognition.mode = 'scripted')}
					class="flex-1 rounded border-2 px-2 py-2
					       {recognition.mode === 'scripted' ? 'border-ink bg-yellow' : 'border-border bg-surface'}"
				>
					scripted
				</button>
			</div>
			{#if !recognition.supported}
				<p class="-mt-3 mb-4 text-fg-muted">No Web Speech API in this browser.</p>
			{/if}

			<label class="mb-2 flex items-center justify-between">
				<span>Loud room</span>
				<input type="checkbox" bind:checked={recognition.noisy} class="size-6" />
			</label>

			<label class="mb-4 flex items-center justify-between">
				<span>Offline</span>
				<input
					type="checkbox"
					checked={!session.online}
					onchange={(e) => (session.online = !e.currentTarget.checked)}
					class="size-6"
				/>
			</label>

			<button
				type="button"
				onclick={onreset}
				class="w-full rounded border-2 border-ink bg-surface px-2 py-2"
			>
				Reset flow
			</button>
		</div>
	{/if}

	<button
		type="button"
		onclick={() => (open = !open)}
		class="ml-auto block rounded-lg border-2 border-dashed border-ink bg-cream px-4 py-2 font-bold"
		aria-expanded={open}
	>
		{open ? 'Hide' : 'Demo'}
	</button>
</div>
