<!--
	@component
	StepList — a procedure, executed with hands busy.

	CONTRACT
	- steps:       ProcedureStep[] (required)
	- oncomplete?: () => void — fired when the last step is ticked

	RULES
	- Steps are ticked off, and the tick persists. A technician reads a step, puts
	  the device down, does the work, and comes back thirty seconds later. "Where
	  was I" is the single most common failure of paper procedures on a line, and
	  the reason this is not a static ordered list.
	- The next unticked step is visually dominant; completed steps recede but stay
	  readable, because verifying what you already did is part of the work.
	- A step carrying a safety level renders its own inline marker. Safety
	  information never lives only at the top of a procedure — the worker may
	  arrive mid-list.
	- The tick target spans the entire row. Precision tapping with gloves is not a
	  reasonable expectation.
-->
<script lang="ts">
	import type { ProcedureStep } from '$lib/domain/types';
	import { t } from '$lib/i18n/strings';

	interface Props {
		steps: ProcedureStep[];
		oncomplete?: () => void;
	}

	let { steps, oncomplete }: Props = $props();

	let done = $state<Set<number>>(new Set());

	const nextStep = $derived(steps.find((s) => !done.has(s.n))?.n ?? -1);

	function toggle(n: number) {
		const next = new Set(done);
		if (next.has(n)) next.delete(n);
		else next.add(n);
		done = next;
		if (next.size === steps.length) oncomplete?.();
	}
</script>

<ol class="flex flex-col gap-3">
	{#each steps as step (step.n)}
		{@const isDone = done.has(step.n)}
		{@const isNext = step.n === nextStep}
		<li>
			<button
				type="button"
				onclick={() => toggle(step.n)}
				aria-pressed={isDone}
				class="flex min-h-tap w-full touch-manipulation items-start gap-4 rounded-lg border-2 p-4 text-left
				       transition-colors
				       {isNext ? 'border-ink bg-surface-raised' : 'border-border bg-surface'}
				       {isDone ? 'opacity-60' : ''}"
			>
				<span
					class="grid size-10 shrink-0 place-items-center rounded-full border-2 text-lead font-bold
					       {isDone ? 'border-ok bg-ok text-cream' : 'border-ink text-ink'}"
					aria-hidden="true"
				>
					{#if isDone}✓{:else}{step.n}{/if}
				</span>

				<span class="min-w-0 flex-1">
					<span class="block text-lead {isDone ? 'line-through' : ''}">{step.text}</span>

					{#if step.safety === 'caution'}
						<span class="mt-2 block text-small font-bold text-caution">
							⚠ {t('steps.ppe')}
						</span>
					{:else if step.safety === 'stop'}
						<span class="mt-2 block text-small font-bold text-stop">
							■ {t('steps.expert')}
						</span>
					{/if}
				</span>
			</button>
		</li>
	{/each}
</ol>
