import { QUEUE } from '$lib/data/office';
import { exchange } from './exchange.svelte';
import { session } from './session.svelte';
import type { QueueItem, Shift, TriageClass } from '$lib/domain/office';
import type { SafetyLevel } from '$lib/domain/types';

/**
 * Office session state.
 *
 * AGENTS: a Svelte 5 rune class in a `.svelte.ts` file, same pattern as
 * `session.svelte.ts`. Reactivity is `$state` and `$derived`, never a store.
 *
 * The split from `session` is deliberate. `session` is what the *device* knows:
 * language, contrast, which machine the QR code came from, and it is shared by
 * both registers. This is what the *supervisor's tab* knows: which question they
 * are looking at, what they have filtered to, what they have typed. A floor
 * route never imports this file, so it never ships to the device.
 *
 * There is no user identity here either. The supervisor is authenticated in the
 * real product, but nothing in this prototype needs to know who they are beyond
 * the name that gets attached to an answer they publish, and inventing an auth
 * model to demonstrate a queue would be scope for its own sake.
 */

/**
 * Who an answer is attributed to.
 *
 * The real product takes this from the authenticated supervisor. Here it is the
 * shift lead the floor already routes to, so the name on the answer is the name
 * the worker was told to expect, which is the point of naming anyone at all.
 */
const SHIFT_LEAD = 'Marek Kowalski';

export type ShiftFilter = Shift | 'all';
export type LineFilter = string;

class OfficeState {
	/** Which question is open in the composer. Null means the empty state. */
	selectedId = $state<string | null>(null);

	/* -- Filters. Area and shift filter; they never group. See office-surface.md. */
	shift = $state<ShiftFilter>('all');
	line = $state<LineFilter>('all');

	/**
	 * Questions answered in this session.
	 *
	 * A Set, and reassigned rather than mutated on every change: `set.add(x)`
	 * does not notify in Svelte 5. This is the second place in the project that
	 * has caught someone out, after `StepList`.
	 *
	 * It is also where the surveillance boundary shows up in the code. Answering
	 * removes the item from the queue and keeps only its id. Nothing accumulates
	 * against the person who asked, because there is nowhere for it to go.
	 */
	answered = $state<Set<string>>(new Set());

	/* -- The draft reply. Cleared on selection change, so drafts never bleed. */
	draft = $state('');
	draftSafety = $state<SafetyLevel>('none');
	draftPatches = $state<string | null>(null);

	/** Set on publish, so the confirmation can name the person and the audit ref. */
	lastPublished = $state<{ name: string; ref: string } | null>(null);

	/**
	 * Everything still waiting, oldest first. Waiting is the whole problem.
	 *
	 * Fixtures plus anything asked on the floor in this session. A question
	 * escalated on the device appears here while the supervisor is looking at
	 * the screen, which is the loop running rather than being described.
	 */
	readonly open = $derived(
		[...QUEUE, ...exchange.waiting]
			.filter((q) => !this.answered.has(q.id))
			.sort((a, b) => Date.parse(a.waitingSince) - Date.parse(b.waitingSince))
	);

	/** What the filters leave. The badge count uses `open`, not this: a filter
	 *  hides work, it does not finish it. */
	readonly visible = $derived(
		this.open.filter(
			(q) =>
				(this.shift === 'all' || q.shift === this.shift) &&
				(this.line === 'all' || q.line === this.line)
		)
	);

	readonly selected = $derived(this.visible.find((q) => q.id === this.selectedId) ?? null);

	/**
	 * Someone has been waiting more than two hours.
	 *
	 * Two hours is where a wait stops being a queue and starts being a person
	 * stuck at a machine. The rail encodes it in the badge's colour so it reads
	 * without arithmetic; the same threshold marks the row.
	 */
	readonly overdue = $derived(
		this.open.some((q) => Date.now() - Date.parse(q.waitingSince) > 2 * 60 * 60 * 1000)
	);

	/** Lines present in the data, for the filter. Identifiers, so not localised. */
	readonly lines = $derived([...new Set(QUEUE.map((q) => q.line))].sort());

	/** How many people are waiting, counting the ones who asked the same thing. */
	readonly peopleWaiting = $derived(this.open.reduce((total, q) => total + 1 + q.alsoWaiting, 0));

	select(item: QueueItem | null) {
		this.selectedId = item?.id ?? null;
		this.draft = '';
		this.draftSafety = item?.safety ?? 'none';
		this.draftPatches = null;
		this.lastPublished = null;
	}

	/**
	 * Publish the draft.
	 *
	 * In the real product this writes a knowledge entry, notifies everyone
	 * waiting, and queues translation. Here it does the one thing that carries
	 * the design argument: the question leaves the queue and the person who asked
	 * it leaves with it.
	 */
	publish() {
		const item = this.selected;
		if (!item || this.draft.trim() === '') return;

		const ref = `WE-2026-${String(900 + this.answered.size).padStart(4, '0')}`;
		this.lastPublished = { name: item.askedBy.name, ref };
		this.answered = new Set([...this.answered, item.id]);

		// The part that makes this a product rather than two screens. Published
		// against a topic, the answer is what the next worker to ask that question
		// gets, with no second escalation.
		if (item.topic) {
			exchange.publish(
				{
					topic: item.topic,
					text: this.draft.trim(),
					writtenIn: session.language,
					safety: this.draftSafety,
					verifiedBy: SHIFT_LEAD,
					ref,
					at: new Date().toISOString()
				},
				item.id
			);
		}
	}

	/** Move to the next waiting question, or back to the empty state. */
	next() {
		this.select(this.visible[0] ?? null);
	}

	/** Reviewer control, so the demo can be run twice. */
	reset() {
		this.answered = new Set();
		this.shift = 'all';
		this.line = 'all';
		this.select(null);
		exchange.reset();
	}
}

export const office = new OfficeState();

/** Triage order, most fixable first. Used by both the queue and coverage. */
export const TRIAGE_ORDER: TriageClass[] = ['documentation', 'machine', 'people'];
