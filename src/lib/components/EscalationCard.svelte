<!--
	@component
	EscalationCard — the miss, routed to a named human, then captured.

	This is the most important component in the system. An assistant that answers
	most questions and shrugs at the rest has rebuilt the dead-end it was built to
	remove. The brief's own words: "the answer is a colleague or supervisor away.
	So they wait."

	CONTRACT
	- escalation: Escalation (required)
	- onnotify?:  () => void — subscribe to the reply
	- oncapture?: () => void — accept the reply into the knowledge base

	RULES
	- Always a named person with a role, never "a supervisor". A worker decides
	  whether to wait based on who is on the other end.
	- The wait time is described as observed behaviour ("usually answers in ~4
	  min"), never as a promise. An SLA the product cannot keep destroys trust
	  faster than a slow answer does.
	- Shared language is surfaced when present. Being routed to someone you cannot
	  talk to is worse than not being routed at all.
	- On `answered`, the capture moment is explicit and shows the audit reference.
	  That is the loop closing: the wait happened once, and it produced an asset
	  that reinforces the compliance product doinstruct already sells.
-->
<script lang="ts">
	import type { Escalation } from '$lib/domain/types';
	import { LANGUAGE_LABEL } from '$lib/domain/types';
	import { session } from '$lib/state/session.svelte';
	import Button from './Button.svelte';
	import { t } from '$lib/i18n/strings';

	interface Props {
		escalation: Escalation;
		onnotify?: () => void;
		oncapture?: () => void;
	}

	let { escalation, onnotify, oncapture }: Props = $props();

	const r = $derived(escalation.responder);
	const sharesLanguage = $derived(r.languages.includes(session.language));
	const waiting = $derived(escalation.status === 'waiting');

	const initials = $derived(
		r.name
			.split(' ')
			.map((p) => p[0])
			.join('')
	);
</script>

<article
	class="flex flex-col gap-5 rounded-lg border-2 p-5
	       {waiting ? 'border-pending bg-pending-surface' : 'border-ok bg-ok-surface'}"
	aria-live="polite"
>
	<header class="flex items-center gap-4">
		<span
			class="grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink bg-surface
			       text-lead font-bold text-ink"
			aria-hidden="true"
		>
			{initials}
		</span>
		<span class="min-w-0">
			<span class="block text-lead font-bold">{r.name}</span>
			<span class="block text-small text-fg-muted">{r.role} · {r.line}</span>
		</span>
	</header>

	{#if waiting}
		<div>
			<p class="text-body">{t('esc.notFound')} {r.name}.</p>
			<ul class="mt-3 flex flex-col gap-1 text-small text-fg-muted">
				<li>{t('esc.replies', { n: r.typicalResponseMinutes })}</li>
				<li>{r.onShift ? t('esc.onShift') : t('esc.offShift')}</li>
				{#if sharesLanguage}
					<li>{t('esc.speaks', { lang: LANGUAGE_LABEL[session.language] })}</li>
				{/if}
			</ul>
		</div>

		<Button variant="primary" full onclick={onnotify}>{t('esc.notify')}</Button>
	{:else}
		<div>
			<p class="text-title font-bold">{escalation.reply}</p>
			<p class="mt-4 text-body">{t('esc.saved')}</p>
			{#if escalation.auditRef}
				<p class="mt-2 text-meta text-fg-muted">
					{t('esc.entry', { ref: escalation.auditRef, name: r.name })}
				</p>
			{/if}
		</div>

		<Button full onclick={oncapture}>{t('esc.ok')}</Button>
	{/if}
</article>
