import { beforeEach, describe, expect, it, vi } from 'vitest';
import { session } from './session.svelte';
import { LANGUAGES } from '$lib/domain/types';

/**
 * The precedence between a saved choice, the device's language and the default
 * is a rule, and rules in this project get tests rather than promises.
 *
 * A minimal localStorage, because the node environment has none. Only the three
 * methods the session actually calls.
 */
function fakeStorage(seed: Record<string, string> = {}) {
	const store = new Map(Object.entries(seed));
	return {
		getItem: (k: string) => store.get(k) ?? null,
		setItem: (k: string, v: string) => void store.set(k, v),
		removeItem: (k: string) => void store.delete(k),
		get size() {
			return store.size;
		},
		raw: store
	};
}

beforeEach(() => {
	session.language = 'de';
	session.highContrast = false;
	vi.unstubAllGlobals();
});

describe('a saved choice beats everything', () => {
	it('is restored over the device language', () => {
		vi.stubGlobal('localStorage', fakeStorage({ 'ask:language': 'ro' }));
		vi.stubGlobal('navigator', { languages: ['en-GB', 'en'] });

		session.restore(LANGUAGES);
		expect(session.language).toBe('ro');
	});

	it('is ignored when it is not a language this build ships', () => {
		// A language could be removed between visits, and a stale key must not
		// leave someone on a locale with no copy behind it.
		vi.stubGlobal('localStorage', fakeStorage({ 'ask:language': 'pl' }));
		vi.stubGlobal('navigator', { languages: ['en-GB'] });

		session.restore(LANGUAGES);
		expect(session.language).toBe('en');
	});
});

describe('the device language is the fallback', () => {
	it('matches on the primary subtag, so ro-RO finds ro', () => {
		vi.stubGlobal('localStorage', fakeStorage());
		vi.stubGlobal('navigator', { languages: ['ro-RO'] });

		session.restore(LANGUAGES);
		expect(session.language).toBe('ro');
	});

	it('leaves the default alone when we speak none of the device languages', () => {
		vi.stubGlobal('localStorage', fakeStorage());
		vi.stubGlobal('navigator', { languages: ['ja-JP', 'ja'] });

		session.restore(LANGUAGES);
		expect(session.language).toBe('de');
	});
});

describe('choosing writes it back', () => {
	it('persists so the next scan puts it first', () => {
		const storage = fakeStorage();
		vi.stubGlobal('localStorage', storage);

		session.setLanguage('en');
		expect(storage.getItem('ask:language')).toBe('en');
	});

	it('does not throw where there is no storage at all', () => {
		// Server-side render, or a browser with storage disabled. Neither should
		// take the product down over a preference.
		vi.stubGlobal('localStorage', undefined);
		expect(() => session.setLanguage('ro')).not.toThrow();
		expect(session.language).toBe('ro');
	});
});

describe('what is NOT remembered', () => {
	it('never persists anything about the machine or the person', () => {
		// The device is shared and has no login. Remembering a language is a
		// courtesy; remembering who stood here is a different product.
		const storage = fakeStorage();
		vi.stubGlobal('localStorage', storage);

		session.setLanguage('ro');
		session.toggleContrast();

		expect([...storage.raw.keys()].sort()).toEqual(['ask:contrast', 'ask:language']);
	});
});
