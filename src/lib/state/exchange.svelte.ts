import type { QueueItem } from '$lib/domain/office';
import type { Language, SafetyLevel } from '$lib/domain/types';

/**
 * The loop, made real.
 *
 * The whole product argument is one sentence: a supervisor answers once, and
 * the assistant answers it forever after. Until now that sentence appeared in
 * the composer, in the writeup and nowhere in the running software. The two
 * surfaces were separate demonstrations that happened to share fixtures.
 *
 * This module is the wire between them. A question escalated on the floor
 * arrives in the supervisor's queue while they are looking at it; the answer
 * they publish is what the next worker to ask gets, instantly, without another
 * escalation. Nothing here is faked or on a timer: it is the same state object
 * read from both registers.
 *
 * WHY THIS DOES NOT BREAK THE BUNDLE SEPARATION
 * The floor deliberately never imports the office's copy, because a worker in a
 * cold store should not download a supervisor's vocabulary. That still holds:
 * this file carries data and no words. It is a few hundred bytes of domain
 * state, and `QueueItem` is a type, which erases at compile time.
 *
 * AGENTS: this is the one module both registers may import. If you find
 * yourself adding a string to it, you are adding it in the wrong place.
 */

/** What a supervisor published, keyed by the topic it answers. */
export interface PublishedAnswer {
	topic: string;
	/** The reply, in the language the supervisor wrote it in. */
	text: string;
	writtenIn: Language;
	safety: SafetyLevel;
	/** A person, because accountability for an instruction lands on a human. */
	verifiedBy: string;
	ref: string;
	at: string;
}

class Exchange {
	/**
	 * Questions asked on the floor in this session and not yet answered.
	 *
	 * Reassigned rather than mutated, because Svelte 5 does not notify on
	 * `array.push`. Third place in this project that rule has mattered.
	 */
	waiting = $state<QueueItem[]>([]);

	/** Published answers by topic. A Map, reassigned for the same reason. */
	published = $state<Map<string, PublishedAnswer>>(new Map());

	/** The floor escalated. The supervisor's queue gains a row, live. */
	ask(item: QueueItem) {
		if (this.waiting.some((q) => q.id === item.id)) return;
		this.waiting = [...this.waiting, item];
	}

	/** The supervisor answered. The question leaves the queue with the person. */
	publish(answer: PublishedAnswer, itemId: string) {
		this.published = new Map([...this.published, [answer.topic, answer]]);
		this.waiting = this.waiting.filter((q) => q.id !== itemId);
	}

	/**
	 * What the assistant can now answer that it could not before.
	 *
	 * Returns null for a topic nobody has answered, which is the honest default
	 * and the state the demo starts in.
	 */
	answerFor(topic: string | undefined): PublishedAnswer | null {
		if (!topic) return null;
		return this.published.get(topic) ?? null;
	}

	/** Reviewer control, so the loop can be watched more than once. */
	reset() {
		this.waiting = [];
		this.published = new Map();
	}
}

export const exchange = new Exchange();
