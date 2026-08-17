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
	 * The device's own language, if we speak it.
	 *
	 * Matched on the primary subtag, so `ro-RO` finds `ro`. Returns null rather
	 * than assigning, because the caller decides what beats what.
	 */
	#deviceLanguage(available: Language[]): Language | null {
		if (typeof navigator === 'undefined') return null;
		const tags = navigator.languages ?? [navigator.language ?? ''];
		for (const tag of tags) {
			const primary = tag.split('-')[0] as Language;
			if (available.includes(primary)) return primary;
		}
		return null;
	}

	resolveMachine(url: URL) {
		this.scannedAsset = url.searchParams.get('asset');
		this.machine = resolveAsset(url);
	}

	/**
	 * A worker's explicit choice, remembered.
	 *
	 * WHY THIS IS SAVED AND WHY THE PICKER STILL APPEARS
	 * On a personal phone, asking someone to pick their language every time they
	 * scan a machine is the interface forgetting who it is talking to. So the
	 * choice persists.
	 *
	 * But the same URL opens on a shared terminal in a hygiene zone, and there
	 * the previous person's language is the wrong answer for the next one. This
	 * product has argued from the start that a shared device has nobody to own
	 * preferences, and silently starting in Romanian for a Polish worker because
	 * someone else stood here an hour ago is exactly the failure the language
	 * screen exists to prevent.
	 *
	 * So it is remembered as an ORDERING, not as a skip. The saved language goes
	 * to the top of the picker and is one tap away; it never removes the screen.
	 * A returning worker on their own phone pays one tap, and a worker on a
	 * shared terminal is never handed a language they cannot read.
	 */
	setLanguage(next: Language) {
		this.language = next;
		if (typeof localStorage !== 'undefined') localStorage.setItem('ask:language', next);
	}

	toggleContrast() {
		this.highContrast = !this.highContrast;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('ask:contrast', this.highContrast ? 'high' : 'normal');
		}
	}

	/**
	 * Called once on mount. Safe to call during SSR, where it no-ops.
	 *
	 * Precedence, and it is deliberate: a previous explicit choice beats the
	 * device's own setting, because someone who has told us once has told us
	 * something the browser locale cannot know. The device setting beats the
	 * hardcoded default. Neither skips the picker.
	 */
	restore(available: Language[]) {
		if (typeof localStorage === 'undefined') return;

		this.highContrast = localStorage.getItem('ask:contrast') === 'high';

		const saved = localStorage.getItem('ask:language') as Language | null;
		if (saved && available.includes(saved)) {
			this.language = saved;
			return;
		}

		const device = this.#deviceLanguage(available);
		if (device) this.language = device;
	}
}

export const session = new Session();
