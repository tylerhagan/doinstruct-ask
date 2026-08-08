<!--
	@component
	SafetyBanner: the refusal and caution surface.

	CONTRACT
	- level:    'caution' | 'stop' (required)
	- children: Snippet: the note text

	RULES
	- `stop` means the assistant will NOT supply a procedure and a qualified person
	  is required. It is a deliberate refusal, not a low-confidence answer, and it
	  must never be phrased as an apology.
	- `stop` uses role="alert" so it interrupts a screen reader. `caution` uses
	  role="note" so it does not.
	- Red appears nowhere else in this system. That exclusivity is the whole point:
	  a worker must be able to trust that red means stop working.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		level: 'caution' | 'stop';
		children: Snippet;
	}

	let { level, children }: Props = $props();

	const isStop = $derived(level === 'stop');
</script>

<div
	role={isStop ? 'alert' : 'note'}
	class="flex items-start gap-4 rounded-lg border-2 p-4
	       {isStop
		? 'border-stop bg-stop-surface text-stop'
		: 'border-caution bg-caution-surface text-caution'}"
>
	{#if isStop}
		<!-- Octagon: the same shape as a physical stop sign on the floor. -->
		<svg class="size-8 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M7.7 2h8.6L22 7.7v8.6L16.3 22H7.7L2 16.3V7.7z" />
			<path d="M12 6.5v7" stroke="#FBEAE9" stroke-width="2.5" stroke-linecap="round" />
			<circle cx="12" cy="17.2" r="1.5" fill="#FBEAE9" />
		</svg>
	{:else}
		<svg class="size-8 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M12 2.5 23 21H1z" />
			<path d="M12 9v5.5" stroke="#FDF3E2" stroke-width="2.5" stroke-linecap="round" />
			<circle cx="12" cy="18" r="1.4" fill="#FDF3E2" />
		</svg>
	{/if}

	<p class="text-body font-medium">{@render children()}</p>
</div>
