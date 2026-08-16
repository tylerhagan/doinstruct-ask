import type { Language, MachineContext } from '$lib/domain/types';
import { resolveAsset } from '$lib/data/assets';

/**
 * Device-level session state.
 *
 * AGENTS: this is a Svelte 5 rune class in a `.svelte.ts` file. Reactivity comes
 * from `$state`, NOT from `writable()` stores. Do not import `svelte/store` in
 * this project, if you find yourself reaching for it, you are writing Svelte 4.
 *
 * There is no user identity here on purpose. The device is shared and has no
 * login, which is doinstruct's own product principle. That constraint is what
 * scoped this prototype to operational knowledge: HR questions would require
 * per-worker auth and would break it.
 */
class Session {
	/**
	 * Chosen by the worker per interaction, and reset after idle.
	 *
	 * The initial value is only ever a guess, used for the handful of words that
	 * appear before anyone has chosen: the unrecognised-sticker message and the
	 * accessible name on the language screen. `guessLanguage()` improves it from
	 * the device. An explicit choice always wins, because it happens afterwards.
	 */
	language = $state<Language>('de');

	/** A lighting condition, not a preference. Persisted per device. */
	highContrast = $state(false);

	/** Simulated for the demo; real builds read navigator.onLine + a heartbeat. */
	online = $state(true);

	/**
	 * The machine this session is about, or null if nothing resolved it yet.
	 *
	 * Null is a real state, not a loading artefact. Someone can open the app
	 * without scanning anything, and a sticker can outlive the machine it was
	 * printed for. Modelling it as nullable means no screen can render a
	 * confident machine name that came from nowhere.
	 */
	machine = $state<MachineContext | null>(null);

	/** What the QR code actually said, kept even when it resolves to nothing, so
	 *  a worker can read the bad code out to someone who can fix the sticker. */
	scannedAsset = $state<string | null>(null);

	/**
	 * Resolve the machine from the URL the QR code produced.
	 *
	 * Client-side only, because the app is prerendered and a query string cannot
	 * be baked in at build time. The first render shows no machine rather than
	 * the wrong one, which is the correct trade.
	 */
	/**
	 * Take the device's own language as the pre-choice default, if we speak it.
	 *
	 * On a personal phone this is very often right, and it costs nothing when it
	 * is wrong because the picker is the very next thing the worker sees. Matched
	 * on the primary subtag, so `ro-RO` finds `ro`.
	 */
	guessLanguage(available: Language[]) {
		if (typeof navigator === 'undefined') return;
		const tags = navigator.languages ?? [navigator.language ?? ''];
		for (const tag of tags) {
			const primary = tag.split('-')[0] as Language;
			if (available.includes(primary)) {
				this.language = primary;
				return;
			}
		}
	}

	resolveMachine(url: URL) {
		this.scannedAsset = url.searchParams.get('asset');
		this.machine = resolveAsset(url);
	}

	setLanguage(next: Language) {
		this.language = next;
	}

	toggleContrast() {
		this.highContrast = !this.highContrast;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('ask:contrast', this.highContrast ? 'high' : 'normal');
		}
	}

	/** Called once on mount. Safe to call during SSR, it no-ops. */
	restore() {
		if (typeof localStorage === 'undefined') return;
		this.highContrast = localStorage.getItem('ask:contrast') === 'high';
	}
}

export const session = new Session();
