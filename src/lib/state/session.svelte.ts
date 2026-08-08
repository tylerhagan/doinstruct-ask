import type { Language, MachineContext } from '$lib/domain/types';

/**
 * Device-level session state.
 *
 * AGENTS: this is a Svelte 5 rune class in a `.svelte.ts` file. Reactivity comes
 * from `$state`, NOT from `writable()` stores. Do not import `svelte/store` in
 * this project — if you find yourself reaching for it, you are writing Svelte 4.
 *
 * There is no user identity here on purpose. The device is shared and has no
 * login, which is doinstruct's own product principle. That constraint is what
 * scoped this prototype to operational knowledge: HR questions would require
 * per-worker auth and would break it.
 */
class Session {
	/** Chosen by the worker per interaction, and reset after idle. */
	language = $state<Language>('ro');

	/** A lighting condition, not a preference. Persisted per device. */
	highContrast = $state(false);

	/** Simulated for the demo; real builds read navigator.onLine + a heartbeat. */
	online = $state(true);

	/** Resolved from the wall mount. Never typed by a gloved hand. */
	machine = $state<MachineContext>({
		line: 'Linie 3 — Abfüllung',
		machine: 'Füller F2',
		assetId: 'AST-3121',
		faultCode: 'E-212'
	});

	setLanguage(next: Language) {
		this.language = next;
	}

	toggleContrast() {
		this.highContrast = !this.highContrast;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('ask:contrast', this.highContrast ? 'high' : 'normal');
		}
	}

	/** Called once on mount. Safe to call during SSR — it no-ops. */
	restore() {
		if (typeof localStorage === 'undefined') return;
		this.highContrast = localStorage.getItem('ask:contrast') === 'high';
	}
}

export const session = new Session();
