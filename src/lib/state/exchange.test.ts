import { beforeEach, describe, expect, it } from 'vitest';
import { exchange } from './exchange.svelte';
import type { QueueItem } from '$lib/domain/office';

/**
 * The loop is the product's entire argument, so it gets a test rather than a
 * demo that happens to work when someone clicks in the right order.
 */

const item = (id: string, topic?: string): QueueItem => ({
	id,
	question: { de: 'a', ro: 'b', en: 'c' },
	askedIn: 'ro',
	line: 'Linie 3',
	machine: 'Füller F2',
	assetId: 'AST-3121',
	shift: 'early',
	waitingSince: '2026-08-16T09:00:00Z',
	askedBy: { name: 'Ana Popescu', role: { de: 'x', ro: 'y', en: 'z' } },
	alsoWaiting: 0,
	attempt: { outcome: 'no-source', detail: { de: 'a', ro: 'b', en: 'c' }, searched: [] },
	triage: 'documentation',
	safety: 'none',
	topic
});

const answer = (topic: string) => ({
	topic,
	text: 'Nach jedem Formatwechsel nachfetten.',
	writtenIn: 'de' as const,
	safety: 'none' as const,
	verifiedBy: 'Marek Kowalski',
	ref: 'WE-2026-0900',
	at: '2026-08-16T10:00:00Z'
});

beforeEach(() => exchange.reset());

describe('the floor to office direction', () => {
	it('puts an escalated question in the queue', () => {
		exchange.ask(item('live-1', 'capper-knock'));
		expect(exchange.waiting).toHaveLength(1);
	});

	it('does not duplicate a question asked twice', () => {
		// A worker who taps the escalate button again should not appear twice in
		// someone's queue as two people waiting.
		exchange.ask(item('live-1', 'capper-knock'));
		exchange.ask(item('live-1', 'capper-knock'));
		expect(exchange.waiting).toHaveLength(1);
	});
});

describe('the office to floor direction', () => {
	it('knows nothing before anyone answers', () => {
		expect(exchange.answerFor('capper-knock')).toBe(null);
	});

	it('serves the published answer for that topic afterwards', () => {
		exchange.ask(item('live-1', 'capper-knock'));
		exchange.publish(answer('capper-knock'), 'live-1');

		const served = exchange.answerFor('capper-knock');
		expect(served?.text).toContain('Formatwechsel');
		expect(served?.verifiedBy).toBe('Marek Kowalski');
	});

	it('answers nothing for a topic nobody answered', () => {
		exchange.publish(answer('capper-knock'), 'live-1');
		expect(exchange.answerFor('guard-door')).toBe(null);
	});

	it('tolerates a question with no topic', () => {
		// Most queue fixtures exist to populate the list and answer nothing on the
		// floor. That must not throw.
		expect(exchange.answerFor(undefined)).toBe(null);
	});
});

describe('answering removes the person from the queue', () => {
	it('takes the question with them', () => {
		exchange.ask(item('live-1', 'capper-knock'));
		exchange.publish(answer('capper-knock'), 'live-1');
		expect(exchange.waiting).toHaveLength(0);
	});

	it('keeps the answer and not the asker', () => {
		// The surveillance boundary in one assertion: what survives publishing is
		// the answer and the responder. Nothing about who asked.
		exchange.ask(item('live-1', 'capper-knock'));
		exchange.publish(answer('capper-knock'), 'live-1');

		const stored = exchange.answerFor('capper-knock')!;
		expect(Object.keys(stored).sort()).toEqual([
			'at',
			'ref',
			'safety',
			'text',
			'topic',
			'verifiedBy',
			'writtenIn'
		]);
	});
});
