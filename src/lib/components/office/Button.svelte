<!--
	@component
	Button (office register): the desk-sized interactive primitive.

	CONTRACT
	- variant: 'primary' | 'secondary' | 'quiet'   (default 'secondary')
	- full:    stretch to container width          (default false)
	- ...rest: any native button attribute, incl. onclick, disabled, aria-*

	WHY THIS IS A SEPARATE COMPONENT FROM THE FLOOR BUTTON
	A shared component with a size prop would let a floor screen opt out of the
	64px gloved-hand floor by passing `size="desk"`, and a prop is invisible to
	scripts/check-register.mjs in a way a class name is not. Two components, two
	floors, one enforceable rule. The duplication is four lines and it buys a
	guarantee.

	RULES
	- 36px minimum (`min-h-control`). A cursor is one pixel and a trackpad gives
	  feedback a glove does not, so the floor's reasoning genuinely does not apply
	  here. It is still comfortably above WCAG 2.2 AA's 24px.
	- `primary` is ink, NOT yellow. Yellow means "this is the voice action" and
	  there is no voice action at a desk, so yellow does not appear in this
	  register at all.
	- No `stop` variant. Red is reserved for safety, and nothing a supervisor
	  clicks at a desk is a hazard. Publishing a wrong answer is recoverable;
	  resetting a Not-Aus is not.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'quiet';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		full?: boolean;
		children: Snippet;
	}

	let {
		variant = 'secondary',
		full = false,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const VARIANT: Record<Variant, string> = {
		primary: 'bg-ink text-fg-inverse border-ink',
		secondary: 'bg-surface text-fg border-border',
		quiet: 'bg-transparent text-fg-muted border-transparent hover:text-fg'
	};
</script>

<button
	class="inline-flex min-h-control touch-manipulation items-center justify-center gap-2
	       rounded-md border px-4 text-small font-bold transition-colors
	       active:brightness-95 disabled:opacity-50
	       {VARIANT[variant]} {full ? 'w-full' : ''} {className}"
	{...rest}
>
	{@render children()}
</button>
