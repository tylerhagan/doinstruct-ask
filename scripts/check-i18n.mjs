/**
 * Literal-text check.
 *
 * `AGENTS.md` rule 6 says no user-facing string literals in components; all copy
 * goes through `t()`. That was prose, and prose did not hold: an agent broke it
 * within one prompt, and an audit then found three pre-existing violations of my
 * own. See docs/handover-proof.md.
 *
 * So this is the second rule to become a build failure, following
 * check-contrast.mjs. It is deliberately a blunt instrument. A German-only
 * string compiles perfectly, passes type checking, is invisible in review, and
 * is a dead end for the half of a German production line that does not read
 * German comfortably. Catching it at commit time is worth some false positives.
 *
 * Run: npm run check:i18n
 */

import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * Dev surfaces, deliberately English and deliberately not shipped.
 * DemoPanel is reviewer chrome and /system is the component gallery.
 */
const ALLOWED = ['src/lib/components/DemoPanel.svelte', 'src/routes/system/+page.svelte'];

/** Attributes that reach a user, whether visually or through a screen reader. */
const TEXT_ATTRS = ['aria-label', 'aria-description', 'placeholder', 'title', 'alt'];

/** Blank out a region while preserving line numbers, so offsets stay truthful. */
const blank = (src, re) => src.replace(re, (m) => m.replace(/[^\n]/g, ' '));

const lineOf = (src, index) => src.slice(0, index).split('\n').length;

const files = globSync('src/**/*.svelte').filter(
	(f) => !ALLOWED.includes(f.replace(/\\/g, '/'))
);

const findings = [];

for (const file of files) {
	const src = readFileSync(file, 'utf8');

	let masked = src;
	masked = blank(masked, /<!--[\s\S]*?-->/g);
	masked = blank(masked, /<script[\s\S]*?<\/script>/g);
	masked = blank(masked, /<style[\s\S]*?<\/style>/g);
	// <svelte:head> carries the document title, which is not on the worker's
	// critical path and is checked separately by eye.
	masked = blank(masked, /<svelte:head>[\s\S]*?<\/svelte:head>/g);

	// Svelte expressions are code, not copy. Repeat to unwrap nesting.
	for (let i = 0; i < 6; i++) masked = blank(masked, /\{[^{}]*\}/g);

	// Attributes first, while the tags are still intact.
	for (const attr of TEXT_ATTRS) {
		const re = new RegExp(`${attr}="([^"]*)"`, 'g');
		for (const m of masked.matchAll(re)) {
			if (/\p{L}{2,}/u.test(m[1])) {
				findings.push({ file, line: lineOf(src, m.index), text: `${attr}="${m[1]}"` });
			}
		}
	}

	// Then blank the tags themselves; what survives is a text node.
	masked = blank(masked, /<[^>]*>/g);

	for (const m of masked.matchAll(/[^\s][^\n]*/g)) {
		const text = m[0].trim();
		if (!/\p{L}{2,}/u.test(text)) continue;
		findings.push({ file, line: lineOf(src, m.index), text });
	}
}

if (findings.length) {
	console.error('Literal user-facing text found. Move it to src/lib/i18n/strings.ts:\n');
	for (const f of findings) {
		console.error(`  ${f.file}:${f.line}  ${f.text.slice(0, 72)}`);
	}
	console.error(`\n${findings.length} literal string(s).`);
	process.exit(1);
}

console.log(`No literal user-facing text in ${files.length} components.`);
