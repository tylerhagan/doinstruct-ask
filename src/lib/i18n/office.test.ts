import { beforeEach, describe, expect, it } from 'vitest';
import { OFFICE, isoDate, tOffice, waitLabel } from './office';
import { DICT } from './floor';
import { session } from '$lib/state/session.svelte';
import type { Language } from '$lib/domain/types';

const NOW = new Date('2026-08-16T09:12:00Z');
const minutesAgo = (n: number) => new Date(NOW.getTime() - n * 60_000).toISOString();

const LANGUAGES: Language[] = ['de', 'ro', 'en'];

beforeEach(() => {
	session.language = 'de';
});

describe('tOffice', () => {
	it('reads the office dictionary', () => {
		expect(tOffice('queue.title')).toBe('Offene Fragen');
	});

	it('falls back to the floor dictionary for shared chrome', () => {
		// The point of the fallback: office components call one function, and the
		// contrast toggle's label is not duplicated into a second dictionary
		// where it could drift away from the floor's wording.
		expect(tOffice('status.contrastShort')).toBe('Kontrast');
	});

	it('follows the session language without a subscription', () => {
		session.language = 'ro';
		expect(tOffice('queue.title')).toBe('Întrebări deschise');
		session.language = 'en';
		expect(tOffice('queue.title')).toBe('Open questions');
	});

	it('interpolates named variables', () => {
		session.language = 'en';
		expect(tOffice('coverage.suppressedWhy', { n: 5 })).toContain('Below 5 events');
	});
});

/**
 * A missing Romanian key does not throw. It renders `undefined` on a screen, in
 * front of the half of a German production line that does not read German
 * comfortably. TypeScript will not catch it either: `satisfies Record<Language,
 * Record<string, string>>` checks the shape of each language, not that the three
 * agree with each other.
 *
 * So the parity of the dictionaries is the one thing worth asserting at runtime,
 * and it is asserted for both registers.
 */
describe.each([
	['office', OFFICE],
	['floor', DICT]
])('%s dictionary', (_name, dict: Record<Language, Record<string, string>>) => {
	const german = Object.keys(dict.de);

	it.each(LANGUAGES)('has every German key in %s', (lang) => {
		const missing = german.filter((key) => !(key in dict[lang]));
		expect(missing).toEqual([]);
	});

	it.each(LANGUAGES)('has no key in %s that German lacks', (lang) => {
		const extra = Object.keys(dict[lang]).filter((key) => !german.includes(key));
		expect(extra).toEqual([]);
	});

	it.each(LANGUAGES)('has no empty string in %s', (lang) => {
		const blank = Object.entries(dict[lang])
			.filter(([, value]) => value.trim() === '')
			.map(([key]) => key);
		expect(blank).toEqual([]);
	});

	it.each(LANGUAGES)('keeps every interpolation placeholder in %s', (lang) => {
		// A translator dropping `{n}` produces a sentence with a hole in it, and
		// the hole is silent. Compare the placeholder sets rather than the text.
		const placeholders = (value: string) => (value.match(/\{[a-z]+\}/g) ?? []).sort().join(',');
		const mismatched = german.filter(
			(key) => placeholders(dict.de[key]) !== placeholders(dict[lang][key] ?? '')
		);
		expect(mismatched).toEqual([]);
	});
});

describe('waitLabel', () => {
	it('reads in minutes under an hour', () => {
		session.language = 'en';
		expect(waitLabel(minutesAgo(41), NOW)).toBe('41 min');
	});

	it('drops the minutes when they are zero', () => {
		session.language = 'en';
		expect(waitLabel(minutesAgo(120), NOW)).toBe('2 h');
	});

	it('combines hours and minutes otherwise', () => {
		session.language = 'en';
		expect(waitLabel(minutesAgo(150), NOW)).toBe('2 h 30 min');
	});

	it('switches to days past twenty-four hours', () => {
		session.language = 'en';
		expect(waitLabel(minutesAgo(60 * 50), NOW)).toBe('2 days');
	});

	it('never returns a negative wait for a clock skew', () => {
		session.language = 'en';
		expect(waitLabel(new Date(NOW.getTime() + 60_000).toISOString(), NOW)).toBe('0 min');
	});

	it('builds the label from whole phrases, not concatenation', () => {
		// German puts the unit after the number here, but that is a fact about
		// German rather than a fact about time, and the moment a language wants
		// it elsewhere a concatenated label has nowhere to put it.
		session.language = 'de';
		expect(waitLabel(minutesAgo(150), NOW)).toBe('2 Std 30 Min');
	});
});

describe('isoDate', () => {
	it('is ISO in every locale', () => {
		for (const lang of LANGUAGES) {
			session.language = lang;
			expect(isoDate('2026-08-14T07:00:00Z')).toBe('2026-08-14');
		}
	});
});
