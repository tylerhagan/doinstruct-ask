<!--
	@component
	Button — the only interactive primitive in the system.

	CONTRACT
	- variant: 'primary' | 'secondary' | 'quiet' | 'stop'   (default 'secondary')
	- size:    'md' | 'lg'                                   (default 'md')
	- full:    stretch to container width                    (default false)
	- ...rest: any native button attribute, incl. onclick, disabled, aria-*

	RULES
	- `primary` is lime and there may be only ONE per screen — the voice action.
	- `stop` is red and is reserved for safety. Never use it for destructive UI
	  actions like "delete", and never for form validation.
	- `md` is 64px tall, `lg` is 96px. Neither may be overridden smaller; both are
	  sized for a cut-resistant glove, not a fingertip.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'quiet' | 'stop';
	type Size = 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		full?: boolean;
		children: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		full = false,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const VARIANT: Record<Variant, string> = {
		primary: 'bg-lime text-ink border-ink',
		secondary: 'bg-surface text-fg border-border-strong',
		quiet: 'bg-transparent text-fg border-transparent underline underline-offset-4',
		stop: 'bg-stop text-cream border-stop'
	};

	const SIZE: Record<Size, string> = {
		md: 'min-h-tap px-5 text-lead',
		lg: 'min-h-tap-primary px-8 text-title'
	};
</script>

<button
	class="inline-flex touch-manipulation items-center justify-center gap-3 rounded-lg border-2
	       font-medium transition-colors active:brightness-95 disabled:opacity-50
	       {VARIANT[variant]} {SIZE[size]} {full ? 'w-full' : ''} {className}"
	{...rest}
>
	{@render children()}
</button>
