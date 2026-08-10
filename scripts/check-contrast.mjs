/**
 * Contrast check.
 *
 * AGENTS.md states "no text token below 7:1 exists". That was prose, which means
 * it degraded the moment anyone changed a colour. This makes it a build failure
 * instead.
 *
 * Text pairs must clear 7:1. AA's 4.5:1 is not enough under washdown glare or
 * in a dim cold store. Non-text UI (borders) must clear WCAG's 3:1.
 *
 * Run: npm run check:contrast
 */

import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/lib/design/tokens.css', import.meta.url), 'utf8');

const readTokens = (block) =>
	Object.fromEntries(
		[...block.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]])
	);

const highStart = css.indexOf("[data-contrast='high']");

/**
 * The two palettes are checked separately rather than merged into one lookup.
 * Letting the high-contrast overrides win globally would make every check
 * trivially pass, since that block is mostly pure black and white, and a silent
 * green tick is exactly what this script exists to prevent.
 */
const base = readTokens(css.slice(css.indexOf('@theme'), highStart));

/** High contrast only overrides some names; the rest fall through to base. */
const high = { ...base, ...readTokens(css.slice(highStart, css.indexOf('[data-contrast', highStart + 1))) };

const channel = (v) => {
	const c = v / 255;
	return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
	const n = parseInt(hex.slice(1), 16);
	return (
		0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
	);
};

const ratio = (a, b) => {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
};

/** [foreground, background, minimum, description] */
const PAIRS = [
	['fg', 'surface', 7, 'body text on page'],
	['fg', 'surface-raised', 7, 'body text on cards'],
	['fg-muted', 'surface', 7, 'secondary text on page'],
	['fg-muted', 'surface-raised', 7, 'secondary text on cards'],
	['fg-inverse', 'surface-inverse', 7, 'text on the listening state'],
	['ink', 'yellow', 7, 'label on the primary voice action'],
	['stop', 'stop-surface', 7, 'safety stop text'],
	['caution', 'caution-surface', 7, 'caution text'],
	['ok', 'ok-surface', 7, 'sourced-answer badge'],
	['pending', 'pending-surface', 7, 'escalation-waiting text'],
	// --color-hairline is deliberately absent. It is a decorative edge on a filled
	// surface and never the sole carrier of a boundary: fill does that in normal
	// light, and in high contrast the token flips to pure black. Exempting it is
	// a statement about what it is for, not a threshold quietly lowered.
	['border', 'surface', 3, 'default border against page'],
	['border-strong', 'surface', 3, 'strong border against page']
];

let failed = 0;

function run(name, tokens) {
	console.log(`\n${name}`);
	for (const [fg, bg, min, label] of PAIRS) {
		if (!tokens[fg] || !tokens[bg]) {
			console.error(`MISSING  --color-${fg} or --color-${bg}`);
			failed++;
			continue;
		}
		const r = ratio(tokens[fg], tokens[bg]);
		const ok = r >= min;
		if (!ok) failed++;
		console.log(
			`${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${fg} on ${bg}  ${label}`
		);
	}
}

run('Default palette', base);
run('High contrast', high);

if (failed) {
	console.error(`\n${failed} contrast check(s) failed.`);
	process.exit(1);
}
console.log('\nAll contrast checks passed.');
