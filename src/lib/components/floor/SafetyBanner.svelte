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
	import StatusMark from '$lib/components/shared/StatusMark.svelte';

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
	<StatusMark {level} size="lg" />

	<p class="text-body font-medium">{@render children()}</p>
</div>
