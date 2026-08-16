<!--
	@component
	LevelMeter: visible proof that the device can hear the worker.

	CONTRACT
	- level:  number 0..1 (required): current input level
	- noisy:  boolean: ambient noise is high enough to threaten recognition
	- bars:   number (default 7)

	RULES
	- This is not decoration. In a 90 dB room the worker has no audio feedback and
	  cannot tell whether the mic is working. The meter is the only signal that
	  their voice is arriving, so it must react within one animation frame.
	- Bars grow from the centre outward, never left-to-right, so the shape reads
	  identically from an oblique angle. A worker stands beside a wall mount, not
	  square to it.
-->
<script lang="ts">
	import { t } from '$lib/i18n/floor';

	interface Props {
		level: number;
		noisy?: boolean;
		bars?: number;
	}

	let { level, noisy = false, bars = 7 }: Props = $props();

	// Centre-weighted: middle bars respond first, outer bars need a louder signal.
	const heights = $derived.by(() => {
		const mid = (bars - 1) / 2;
		return Array.from({ length: bars }, (_, i) => {
			const falloff = 1 - Math.abs(i - mid) / (mid + 1);
			return Math.max(0.12, Math.min(1, level * falloff * 1.6));
		});
	});
</script>

<div
	class="flex h-16 items-center justify-center gap-2"
	role="meter"
	aria-valuenow={Math.round(level * 100)}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label={t('a11y.level')}
>
	{#each heights as h, i (i)}
		<span
			class="w-3 rounded-full transition-[height] duration-75 {noisy ? 'bg-caution' : 'bg-yellow'}"
			style="height: {Math.round(h * 100)}%"
		></span>
	{/each}
</div>
