<!--
	Coverage: where the documentation runs out.

	The analytical surface, and the commercial argument: it tells a plant manager
	which document to fix to remove the most downtime. It is also the surface with
	the most temptation in it, which is why the refusal is stated on the page and
	not only in the code.

	Grouped by what a supervisor can actually fix rather than by one hierarchy,
	because each of the three classes hands them a different next action. Rewrite
	the section, call engineering, or hand it to Genius.
-->
<script lang="ts">
	import { COVERAGE, COVERAGE_WEEKS } from '$lib/data/office';
	import { MIN_BUCKET, type TriageClass } from '$lib/domain/office';
	import { TRIAGE_ORDER } from '$lib/state/office.svelte';
	import { session } from '$lib/state/session.svelte';
	import { tOffice } from '$lib/i18n/office';
	import Panel from '$lib/components/office/Panel.svelte';
	import RankedBars from '$lib/components/office/RankedBars.svelte';
	import Trend from '$lib/components/office/Trend.svelte';
	import TriageBadge from '$lib/components/office/TriageBadge.svelte';
	import Button from '$lib/components/office/Button.svelte';

	/** Colour follows the entity, never the rank: the slot is fixed per class,
	 *  so filtering the view never repaints the survivors. */
	const TONE: Record<TriageClass, string> = {
		documentation: 'bg-series-1',
		machine: 'bg-series-2',
		people: 'bg-series-3'
	};
	const LINE_TONE: Record<TriageClass, string> = {
		documentation: 'text-series-1',
		machine: 'text-series-2',
		people: 'text-series-3'
	};

	let asTable = $state(false);

	/** One scale across all three groups, so a bar means the same thing in each.
	 *  Per-group maxima would make a group of small numbers look like a crisis. */
	const max = $derived(Math.max(...COVERAGE.map((b) => b.count ?? 0), 1));

	const grouped = $derived(
		TRIAGE_ORDER.map((triage) => ({
			triage,
			buckets: COVERAGE.filter((b) => b.triage === triage).sort(
				(a, b) => (b.count ?? -1) - (a.count ?? -1)
			)
		}))
	);

	const rowsFor = (triage: TriageClass) =>
		COVERAGE.filter((b) => b.triage === triage)
			.sort((a, b) => (b.count ?? -1) - (a.count ?? -1))
			.map((b) => ({
				id: b.id,
				label: b.label,
				detail: b.detail[session.language],
				count: b.count,
				tone: TONE[triage]
			}));
</script>

<div class="flex flex-col gap-4">
	<header>
		<h1 class="text-title font-bold">{tOffice('coverage.title')}</h1>
		<p class="mt-1 max-w-prose text-small text-fg-muted">{tOffice('coverage.lede')}</p>
	</header>

	<div class="flex flex-wrap items-center gap-3">
		<p class="text-meta font-bold text-fg-muted">{tOffice('coverage.period')}</p>
		<Button onclick={() => (asTable = !asTable)}>
			{asTable ? tOffice('coverage.chartView') : tOffice('coverage.tableView')}
		</Button>
	</div>

	{#if asTable}
		<!-- The table view is not a fallback, it is a peer. Some people would
		     rather read the numbers, and at high contrast so would everyone. -->
		<Panel class="overflow-x-auto">
			<table class="w-full min-w-xl border-collapse">
				<thead>
					<tr class="border-b border-hairline text-start">
						<th scope="col" class="px-4 py-2 text-start text-meta font-bold"
							>{tOffice('coverage.colDocument')}</th
						>
						<th scope="col" class="px-4 py-2 text-start text-meta font-bold"
							>{tOffice('coverage.colTriage')}</th
						>
						<th scope="col" class="px-4 py-2 text-end text-meta font-bold"
							>{tOffice('coverage.colCount')}</th
						>
					</tr>
				</thead>
				<tbody>
					{#each COVERAGE as bucket (bucket.id)}
						<tr class="border-b border-hairline last:border-b-0">
							<td class="px-4 py-2">
								<p class="text-meta font-bold">{bucket.label}</p>
								<p class="text-meta text-fg-muted">{bucket.detail[session.language]}</p>
							</td>
							<td class="px-4 py-2"><TriageBadge triage={bucket.triage} /></td>
							<td class="px-4 py-2 text-end text-meta tabular-nums">
								{bucket.count ?? tOffice('coverage.suppressed')}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Panel>
	{:else}
		<div class="grid gap-4 xl:grid-cols-3">
			{#each grouped as group (group.triage)}
				<Panel level={3} class="flex flex-col">
					<div class="border-b border-hairline px-4 py-3">
						<TriageBadge triage={group.triage} showAction />
						<p class="mt-1 max-w-prose text-meta text-fg-muted">
							{tOffice(`triage.${group.triage}.why`)}
						</p>
					</div>

					<div class="px-4 py-3">
						<h3 class="sr-only">{tOffice('coverage.unanswered')}</h3>
						<RankedBars
							rows={rowsFor(group.triage)}
							{max}
							suppressedLabel={tOffice('coverage.suppressed')}
						/>
					</div>

					<div class="mt-auto border-t border-hairline px-4 py-3">
						{#each group.buckets
							.filter((b) => b.trend.length > 0)
							.slice(0, 1) as bucket (bucket.id)}
							<Trend
								values={bucket.trend}
								labels={COVERAGE_WEEKS}
								tone={LINE_TONE[group.triage]}
								title={`${tOffice('coverage.trend')} · ${bucket.label}`}
								tooFew={tOffice('coverage.trendTooFew')}
							/>
						{/each}
					</div>
				</Panel>
			{/each}
		</div>
	{/if}

	<!--
		The refusal, on the page rather than only in the code.

		A supervisor who wonders why they cannot break this down by person should
		find the answer here, not conclude the feature is missing. It is also the
		screen a Betriebsrat will be shown, and that conversation goes better when
		the boundary is written on the product instead of asserted about it.
	-->
	<Panel title={tOffice('coverage.noPeople')} level={3}>
		<div class="px-4 py-3">
			<p class="max-w-prose text-small">{tOffice('coverage.noPeopleWhy')}</p>
			<p class="mt-2 max-w-prose text-meta text-fg-muted">
				{tOffice('coverage.suppressedWhy', { n: MIN_BUCKET })}
			</p>
		</div>
	</Panel>
</div>
