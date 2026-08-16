<!--
	@component
	FilterGroup: a labelled row of mutually exclusive filters.

	CONTRACT
	- label:   what is being filtered (already translated)
	- options: [{ value, label }]
	- value:   $bindable current selection
	- name:    unique id stem, so the label associates correctly

	RULES
	- Filters narrow, they never group. Area and shift are legitimate filters;
	  role, team and group are not offered at all, because at small counts they
	  re-identify a person. See docs/office-surface.md.
	- Radio semantics, not buttons. A screen reader user needs to hear that these
	  are one choice out of several and which one is current, and `aria-pressed`
	  on a row of buttons does not say that.
	- 36px targets with an 8px gap, the desk floor. On the floor this row would
	  be illegal twice over.
-->
<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		label: string;
		options: Option[];
		value: string;
		name: string;
	}

	let { label, options, value = $bindable(), name }: Props = $props();
</script>

<fieldset class="min-w-0">
	<legend class="mb-1 text-meta font-bold text-fg-muted">{label}</legend>
	<div class="flex flex-wrap gap-2">
		{#each options as option (option.value)}
			<label
				class="inline-flex min-h-control cursor-pointer items-center rounded-md border px-3
				       text-meta font-bold transition-colors
				       {value === option.value
					? 'border-ink bg-ink text-fg-inverse'
					: 'border-hairline bg-surface text-fg-muted hover:text-fg'}"
			>
				<input type="radio" {name} value={option.value} bind:group={value} class="sr-only" />
				{option.label}
			</label>
		{/each}
	</div>
</fieldset>
