<!--
	@component
	AssetLabel: the sticker that goes on the machine.

	CONTRACT
	- asset:       MachineContext (line, machine, assetId)
	- instruction: [string, string]  the printed prompt, in the site's two languages
	- href:        the QR SVG, generated at build time by scripts/generate-labels.mjs

	WHY A COMPONENT AND NOT A PDF SOMEONE MAKES IN WORD
	This label is the product's front door. Every claim about no app, no login and
	no barriers depends on a worker being able to scan a piece of adhesive vinyl
	on a wet machine, and until now it was the one part of the product nobody had
	designed. A prototype that ships three polished screens and leaves its own
	entry point to whoever owns the label printer has not finished the job.

	THE DESIGN DECISIONS, WHICH ARE MOSTLY NOT VISUAL
	- **The asset ID is as important as the code.** Cameras fail: cracked lens,
	  greasy screen, no permission granted, phone in a locker. The ID is set large
	  enough to read out over 90 dB of line noise, and it is the thing a worker
	  quotes when they call the shift lead. It is not a caption on the QR, it is
	  the fallback path.
	- **Two languages, not nine.** A site may run nine languages on the screen and
	  still cannot print nine on 80mm of vinyl. So the printed words are the
	  plant's operating language plus one, and the rest of the burden moves to the
	  QR, which needs no language at all, and to the app, which asks.
	- **Black on white, no brand colour.** Not a stylistic choice. A QR needs
	  maximum contrast between module and quiet zone, and the surrounding area
	  must stay light or a camera hunting for the finder patterns struggles.
	  doinstruct's yellow at 1.1:1 would be actively harmful here.
	- **The quiet zone is not padding.** The white margin around the code is part
	  of the code. Trimming it to fit is the single most common way a printed QR
	  stops working, so the border sits outside it.
	- **No fault code.** A sticker is static and cannot know today's fault. That
	  is exactly the claim the standby screen used to make and no longer does.

	PRINT AND PLACEMENT, WHICH BELONG TO THE DESIGN
	Laminated or printed on washdown-safe vinyl; a paper label in a wet zone lasts
	one shift. Mounted at eye height on a fixed panel, never on a guard door or
	anything that moves, both because a moving target is hard to scan and because
	the label must stay readable while the machine is locked out. Not directly in
	the spray path of a CIP nozzle. Replaced when the machine is replaced, which
	is the failure this product handles rather than prevents: an outlived sticker
	resolves to nothing, and the app says so instead of guessing.
-->
<script lang="ts">
	import type { MachineContext } from '$lib/domain/types';

	interface Props {
		asset: Omit<MachineContext, 'faultCode'>;
		instruction: [string, string];
		href: string;
	}

	let { asset, instruction, href }: Props = $props();
</script>

<!--
	Deliberately not using the theme's surface tokens. This is ink on vinyl, not
	a screen: it has no dark mode, no high-contrast variant and no brand ground,
	and borrowing the app's cream would print as a muddy grey and cost the QR
	contrast it cannot spare.
-->
<div
	class="flex w-label flex-col gap-3 border-2 border-black bg-white p-4 text-black"
	style="break-inside: avoid"
>
	<div>
		<p class="text-meta font-bold tracking-wide uppercase">{asset.line}</p>
		<p class="text-title font-bold">{asset.machine}</p>
	</div>

	<!--
		Full width and nowrap, because this is the fallback path rather than a
		caption on the code. A first pass put it in a column beside the QR, where
		80mm of vinyl left it 35mm and it broke as "AST-" / "3121": an identifier
		split across two lines is no longer an identifier, and this is precisely
		the string someone reads out over the line noise when the camera will not
		focus.
	-->
	<p class="text-hero font-bold whitespace-nowrap tabular-nums">{asset.assetId}</p>

	<!-- The quiet zone is baked into the generated SVG. Do not crop it. -->
	<img src={href} alt="" class="size-label-qr" />

	<div>
		<p class="text-small font-bold">{instruction[0]}</p>
		<p class="text-small">{instruction[1]}</p>
	</div>
</div>
