<!--
	@component
	PushToTalk: the primary action. There is exactly one per screen.

	CONTRACT
	- state:   'idle' | 'listening' | 'thinking' | 'speaking' | 'error' (required)
	- label:   string (required): already localised by the caller
	- level:   number 0..1: input level, only read while listening
	- noisy:   boolean: ambient noise threatens recognition
	- onstart: () => void: fired on press
	- onstop:  () => void: fired on release, pointer cancel, or focus loss

	RULES
	- Hold to talk, never tap to toggle. Three reasons, in order of importance:
	  1. A German works council will not approve a device that listens passively.
	     Hold-to-talk makes "we are not recording you" a physical property of the
	     control rather than a policy promise.
	  2. Release is a bigger, more forgiving gesture than a second precise tap when
	     the worker is wearing gloves.
	  3. It bounds the recording window, which bounds the cost.
	- Keyboard equivalent is hold-Space, with the same press/release semantics.
	- This component NEVER holds recognition state itself. It reports gestures; the
	  route owns the machine. Keeping it dumb is what lets an agent restyle it
	  without breaking the flow.
-->
<script lang="ts">
	import LevelMeter from './LevelMeter.svelte';
	import { t } from '$lib/i18n/floor';

	type PttState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

	interface Props {
		state: PttState;
		label: string;
		level?: number;
		noisy?: boolean;
		onstart?: () => void;
		onstop?: () => void;
	}

	let { state, label, level = 0, noisy = false, onstart, onstop }: Props = $props();

	const listening = $derived(state === 'listening');
	const busy = $derived(state === 'thinking');

	function press(event: PointerEvent) {
		if (busy) return;
		// Pointer capture keeps the release event ours even if the finger slides off
		// the control, which it will, on a wet screen.
		(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
		onstart?.();
	}

	function release() {
		if (listening) onstop?.();
	}

	function key(event: KeyboardEvent) {
		if (event.key !== ' ' && event.key !== 'Enter') return;
		event.preventDefault();
		if (event.type === 'keydown' && !event.repeat && !busy) onstart?.();
		if (event.type === 'keyup') release();
	}

	const SURFACE: Record<PttState, string> = {
		idle: 'bg-yellow border-ink text-ink',
		listening: 'bg-surface-inverse border-ink text-fg-inverse',
		thinking: 'bg-surface-raised border-border-strong text-fg-muted',
		speaking: 'bg-surface-raised border-ink text-fg',
		error: 'bg-stop-surface border-stop text-stop'
	};
</script>

<button
	type="button"
	aria-pressed={listening}
	aria-busy={busy}
	disabled={busy}
	onpointerdown={press}
	onpointerup={release}
	onpointercancel={release}
	onblur={release}
	onkeydown={key}
	onkeyup={key}
	class="flex min-h-tap-primary w-full touch-none flex-col items-center justify-center gap-2
	       rounded-xl border-2 px-6 py-5 transition-colors select-none {SURFACE[state]}"
>
	{#if listening}
		<LevelMeter {level} {noisy} />
		<span class="text-lead font-medium">{label}</span>
	{:else if busy}
		<span class="text-lead font-medium">{label}</span>
	{:else}
		<!-- Microphone. Paired with text, never alone: an unlabelled icon is a
		     literacy tax, and this is the one control that must never be guessed at. -->
		<svg class="size-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<rect x="9" y="2" width="6" height="12" rx="3" />
			<path
				d="M5 11a7 7 0 0 0 14 0"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<path d="M12 18v4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
		</svg>
		<span class="text-title font-bold">{label}</span>
	{/if}
</button>

{#if noisy && listening}
	<p class="mt-3 text-center text-small font-medium text-caution">
		{t('ptt.noisy')}
	</p>
{/if}
