import { describe, expect, it } from 'vitest';
import { MIN_BUCKET, suppress } from './office';
import { COVERAGE, QUEUE } from '$lib/data/office';

/**
 * Suppression is the one rule in this codebase where a silent regression is both
 * easy to introduce and impossible to see. A chart that starts showing "3" where
 * it used to show "too few to show" looks fine, builds clean, and quietly turns
 * a privacy guarantee into a privacy aspiration.
 */
describe('suppress', () => {
	it('hides counts below the threshold', () => {
		expect(suppress(0)).toBe(null);
		expect(suppress(MIN_BUCKET - 1)).toBe(null);
	});

	it('shows counts at and above the threshold', () => {
		expect(suppress(MIN_BUCKET)).toBe(MIN_BUCKET);
		expect(suppress(34)).toBe(34);
	});

	it('returns null rather than zero, so a component cannot render it as a number', () => {
		// The distinction matters: `0` is a legitimate answer meaning "none
		// happened", and `null` means "we are not telling you". Collapsing them
		// would let a suppressed bucket read as a real, reassuring zero.
		expect(suppress(0)).not.toBe(0);
	});
});

describe('coverage fixtures', () => {
	it('never carries a visible count below the threshold', () => {
		for (const bucket of COVERAGE) {
			if (bucket.count !== null) expect(bucket.count).toBeGreaterThanOrEqual(MIN_BUCKET);
		}
	});

	it('includes at least one suppressed bucket, so the demo shows the rule working', () => {
		// A privacy rule nobody can see working is a privacy rule nobody believes.
		expect(COVERAGE.some((b) => b.count === null)).toBe(true);
	});

	it('gives suppressed buckets no trend data to leak the shape of', () => {
		for (const bucket of COVERAGE) {
			if (bucket.count === null) expect(bucket.trend).toHaveLength(0);
		}
	});
});

describe('queue fixtures', () => {
	it('carries no field that accumulates history against a person', () => {
		// The guard is structural: if someone adds `askedBy.questionsThisMonth`,
		// this fails. Present-tense identity is necessary to deliver an answer;
		// accumulation is performance monitoring, and in Germany it is also a
		// works council negotiation under §87(1)(6) BetrVG.
		for (const item of QUEUE) {
			expect(Object.keys(item.askedBy).sort()).toEqual(['name', 'role']);
		}
	});

	it('counts duplicate askers without naming them', () => {
		for (const item of QUEUE) {
			expect(typeof item.alsoWaiting).toBe('number');
		}
	});
});
