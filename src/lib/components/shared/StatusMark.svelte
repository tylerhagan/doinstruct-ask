<!--
	@component
	StatusMark: a status as a SHAPE, not only a colour.

	CONTRACT
	- level: 'stop' | 'caution' | 'ok' | 'pending'
	- size:  'sm' | 'lg'   (default 'sm')

	Always decorative. Every status in this product ships with a word beside it,
	so this carries no accessible name; it is the third channel, after the word
	and the colour, and never the only one.

	WHY SHAPES, AND WHY IN THE SHIPPED PRODUCT RATHER THAN THE PROPOSED THEME
	This came out of a rebrand concept built on the grammar of industrial safety
	signage, where meaning has a form: an octagon means stop before you have read
	anything, a triangle means take care, and both work through a face shield, in
	a photocopy, and for the one man in twelve who cannot separate the two by
	hue. That is an accessibility property rather than a brand flourish, so it
	belongs to the product. The proposed theme amplifies it; it does not own it.

	THE FOUR SILHOUETTES
	- Octagon, stop. The shape of the physical sign already on the floor.
	- Triangle, caution. Warning, in every signage system there is.
	- Square, verified. A settled, stable form; ISO uses it for safe conditions.
	- Circle, pending. Ongoing rather than resolved.

	They are distinguishable at 16px and in monochrome, which is the test that
	matters: a shape that only reads in colour is a colour.

	THE KNOCKOUT IS A TOKEN, NOT A HEX
	The glyph is punched out in the status's own surface colour. It used to be
	two literal hex values inside SafetyBanner, which broke the no-raw-values
	rule and, more to the point, would have rendered the wrong colour the moment
	a theme changed those surfaces. Systematising this fixed a real defect rather
	than only tidying one.
-->
<script lang="ts">
	type Level = 'stop' | 'caution' | 'ok' | 'pending';

	interface Props {
		level: Level;
		size?: 'sm' | 'lg';
	}

	let { level, size = 'sm' }: Props = $props();

	/** The knockout follows the theme, because it is the surface behind it. */
	const KNOCKOUT: Record<Level, string> = {
		stop: 'var(--color-stop-surface)',
		caution: 'var(--color-caution-surface)',
		ok: 'var(--color-ok-surface)',
		pending: 'var(--color-pending-surface)'
	};
</script>

<svg
	class="shrink-0 {size === 'lg' ? 'size-8' : 'size-4'}"
	viewBox="0 0 24 24"
	fill="currentColor"
	aria-hidden="true"
>
	{#if level === 'stop'}
		<path d="M7.7 2h8.6L22 7.7v8.6L16.3 22H7.7L2 16.3V7.7z" />
		<path
			d="M12 6.5v7"
			stroke={KNOCKOUT.stop}
			stroke-width="2.5"
			stroke-linecap="round"
			fill="none"
		/>
		<circle cx="12" cy="17.2" r="1.5" fill={KNOCKOUT.stop} />
	{:else if level === 'caution'}
		<path d="M12 2.5 23 21H1z" />
		<path
			d="M12 9v5.5"
			stroke={KNOCKOUT.caution}
			stroke-width="2.5"
			stroke-linecap="round"
			fill="none"
		/>
		<circle cx="12" cy="18" r="1.4" fill={KNOCKOUT.caution} />
	{:else if level === 'ok'}
		<rect x="2" y="2" width="20" height="20" rx="4" />
		<path
			d="m7 12.3 3.4 3.4L17 9"
			stroke={KNOCKOUT.ok}
			stroke-width="2.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			fill="none"
		/>
	{:else}
		<circle cx="12" cy="12" r="10" />
		<circle cx="7.4" cy="12" r="1.5" fill={KNOCKOUT.pending} />
		<circle cx="12" cy="12" r="1.5" fill={KNOCKOUT.pending} />
		<circle cx="16.6" cy="12" r="1.5" fill={KNOCKOUT.pending} />
	{/if}
</svg>
