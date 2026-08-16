<!--
	Queue, the default view, with the answer composer beside it.

	List and detail rather than a route per question. A supervisor works through
	a queue, and sending them to a new URL and back for each item costs the thing
	they have least of: the thread of what they were doing.

	Same architectural rule as the floor: this file owns the flow, the components
	render props and report gestures. That is why "change what a queue row shows"
	and "change what happens on publish" are two different files.
-->
<script lang="ts">
	import { office } from '$lib/state/office.svelte';
	import { tOffice } from '$lib/i18n/office';
	import QueueRow from '$lib/components/office/QueueRow.svelte';
	import Composer from '$lib/components/office/Composer.svelte';
	import Panel from '$lib/components/office/Panel.svelte';
	import FilterGroup from '$lib/components/office/FilterGroup.svelte';
	import type { Shift } from '$lib/domain/office';

	const SHIFTS: Shift[] = ['early', 'late', 'night'];

	const shiftOptions = $derived([
		{ value: 'all', label: tOffice('queue.filterAll') },
		...SHIFTS.map((s) => ({ value: s, label: tOffice(`queue.shift.${s}`) }))
	]);

	const lineOptions = $derived([
		{ value: 'all', label: tOffice('queue.filterAll') },
		...office.lines.map((l) => ({ value: l, label: l }))
	]);
</script>

<div class="flex flex-col gap-4">
	<header>
		<h1 class="text-display font-bold">{tOffice('queue.title')}</h1>
		<p class="mt-2 max-w-prose text-small text-fg-muted">{tOffice('queue.lede')}</p>
	</header>

	<div class="flex flex-wrap gap-x-6 gap-y-3">
		<FilterGroup
			label={tOffice('queue.filterShift')}
			options={shiftOptions}
			bind:value={office.shift}
			name="filter-shift"
		/>
		<FilterGroup
			label={tOffice('queue.filterLine')}
			options={lineOptions}
			bind:value={office.line}
			name="filter-line"
		/>
	</div>

	<div class="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,8fr)] lg:items-start">
		<Panel
			title={tOffice('nav.queue')}
			lede={tOffice('nav.waitingCount', { n: office.peopleWaiting })}
			class="overflow-hidden"
		>
			{#if office.open.length === 0}
				<div class="px-5 py-8">
					<p class="text-small font-bold">{tOffice('queue.empty.title')}</p>
					<p class="mt-1 max-w-prose text-meta text-fg-muted">{tOffice('queue.empty.body')}</p>
				</div>
			{:else if office.visible.length === 0}
				<div class="px-5 py-8">
					<p class="text-small text-fg-muted">{tOffice('queue.noMatch')}</p>
				</div>
			{:else}
				<ul class="divide-y divide-hairline">
					{#each office.visible as item (item.id)}
						<li>
							<QueueRow
								{item}
								selected={office.selectedId === item.id}
								onselect={() => office.select(item)}
							/>
						</li>
					{/each}
				</ul>
			{/if}
		</Panel>

		<div class="lg:sticky lg:top-4">
			<Composer
				item={office.selected}
				bind:draft={office.draft}
				bind:safety={office.draftSafety}
				published={office.lastPublished}
				onpublish={() => office.publish()}
				oncancel={() => office.select(null)}
				onnext={() => office.next()}
			/>
		</div>
	</div>
</div>
