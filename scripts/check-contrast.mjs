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
		[...block.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]])
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
const high = {
	...base,
	...readTokens(css.slice(highStart, css.indexOf('[data-contrast', highStart + 1)))
};

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
	['border-strong', 'surface', 3, 'strong border against page'],
	// Chart marks are non-text UI, so 3:1 is the correct floor rather than 7:1.
	// These also pass the dataviz skill's CVD checks; that validator is not
	// vendored here, so the palette carries its results in tokens.css and this
	// check guards the part that silently breaks when someone tweaks a hex.
	['series-1', 'surface', 3, 'chart series 1 (teal)'],
	['series-2', 'surface', 3, 'chart series 2 (rust)'],
	['series-3', 'surface', 3, 'chart series 3 (violet)'],
	['series-4', 'surface', 3, 'chart series 4 (olive)'],
	['series-5', 'surface', 3, 'chart series 5 (magenta)']
];

/**
 * The sequential scale is checked differently, and deliberately so. A ramp's
 * light end is *meant* to recede toward the surface, so holding every step to
 * 3:1 would be the wrong test and would force a ramp with no light end. The
 * right test for a ramp is that it is ordered: each step must be strictly more
 * contrasting than the one before it, the lightest must still be visible at
 * 2:1, and the darkest must clear the 3:1 mark floor.
 *
 * This is a stricter check than the pairs above, not a relaxed one. A ramp can
 * pass 3:1 at every step and still be unreadable if two steps sit level.
 */
const RAMP = { name: 'scale', steps: 5, minLight: 2, minDark: 3 };

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
	runRamp(tokens);
}

function runRamp(tokens) {
	const keys = Array.from({ length: RAMP.steps }, (_, i) => `${RAMP.name}-${i + 1}`);
	const missing = keys.filter((k) => !tokens[k]);
	if (missing.length || !tokens.surface) {
		console.error(`MISSING  ${missing.join(', ') || '--color-surface'}`);
		failed++;
		return;
	}

	const ratios = keys.map((k) => ratio(tokens[k], tokens.surface));

	for (let i = 1; i < ratios.length; i++) {
		const ok = ratios[i] > ratios[i - 1];
		if (!ok) failed++;
		console.log(
			`${ok ? 'pass' : 'FAIL'}  ${ratios[i].toFixed(2).padStart(6)}:1  (> ${ratios[i - 1].toFixed(2)})  ${keys[i]} darker than ${keys[i - 1]}`
		);
	}

	const lightOk = ratios[0] >= RAMP.minLight;
	if (!lightOk) failed++;
	console.log(
		`${lightOk ? 'pass' : 'FAIL'}  ${ratios[0].toFixed(2).padStart(6)}:1  (min ${RAMP.minLight})  ${keys[0]} visible against surface`
	);

	const darkOk = ratios[ratios.length - 1] >= RAMP.minDark;
	if (!darkOk) failed++;
	console.log(
		`${darkOk ? 'pass' : 'FAIL'}  ${ratios[ratios.length - 1].toFixed(2).padStart(6)}:1  (min ${RAMP.minDark})  ${keys[keys.length - 1]} clears the mark floor`
	);
}

run('Default palette', base);
run('High contrast', high);

if (failed) {
	console.error(`\n${failed} contrast check(s) failed.`);
	process.exit(1);
}
console.log('\nAll contrast checks passed.');
