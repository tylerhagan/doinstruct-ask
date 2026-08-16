import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
// `defineConfig` comes from vitest/config, not vite: the vite export does not
// know about the `test` key and rejects it at type-check time.
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	],

	/**
	 * Tests cover logic, not rendering. Component behaviour in this project is
	 * already guarded by four build checks and the type checker, and mounting
	 * Svelte components would mean jsdom plus a testing library, which is three
	 * more dependencies to assert things the checks already assert.
	 *
	 * What is NOT covered by any of those is the small set of pure functions that
	 * encode a rule: suppression, wait formatting, and the i18n fallback. Those
	 * are the ones where a silent change is both easy and consequential.
	 */
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
