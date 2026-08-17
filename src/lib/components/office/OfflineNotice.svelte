<!--
	@component
	OfflineNotice: the office's one honestly degraded state.

	CONTRACT
	Reads `session.online` directly, the same flag the device uses. Renders
	nothing when online.

	WHY THIS IS THE ONLY DEGRADED STATE HERE
	`docs/rules/accessibility.md` asks every surface to handle loading, empty,
	error and offline. Empty is handled on all three office screens. Loading and
	error are absent because this prototype is fully prerendered with fixture
	data: there is no request to be pending and none to fail, and inventing a
	spinner to satisfy a checklist would be the same dishonesty as faking
	retrieval. Offline is different, because it is real for a supervisor on plant
	wifi and the flag already exists.

	RULES
	- Say what still works before saying what does not. A supervisor who can still
	  read the queue has not lost their afternoon, and leading with the loss
	  invites them to close the tab.
	- Caution, not stop. Red is reserved for hazard, and a dropped connection is
	  an inconvenience.
	- `role="status"`, not `alert`. It does not interrupt; nothing here is
	  time-critical enough to talk over what a screen reader was already saying.
	- The draft survives. Losing a connection must never cost a supervisor the
	  answer they were halfway through typing, which is a promise the composer
	  keeps and this notice makes out loud.
-->
<script lang="ts">
	import { session } from '$lib/state/session.svelte';
	import { tOffice } from '$lib/i18n/office';
	import StatusMark from '$lib/components/shared/StatusMark.svelte';
</script>

{#if !session.online}
	<div
		class="flex flex-col gap-1 rounded-lg border border-caution bg-caution-surface px-4 py-3"
		role="status"
	>
		<p class="flex items-center gap-2 text-small font-bold text-caution">
			<StatusMark level="caution" />
			{tOffice('office.offline')}
		</p>
		<p class="max-w-prose text-meta text-caution">{tOffice('office.offlineBody')}</p>
	</div>
{/if}
