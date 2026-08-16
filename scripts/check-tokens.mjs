/**
 * Token agreement check.
 *
 * tokens.json describes the system's INTENT. tokens.css declares the values
 * Tailwind actually compiles. Neither generates the other, and at v0.1.0 they
 * had drifted so far apart that eleven of the eighteen colours in tokens.json
 * were stale: a first-draft palette that had since been corrected twice, once
 * for brand accuracy and once to clear the 7:1 floor.
 *
 * Nobody noticed, because "source of truth" was a sentence in a file rather
 * than a condition anything tested. An agent reading tokens.json for intent
 * would have been handed a set of colours the product had not used for weeks.
 *
 * So: every colour in one file must appear in the other, both directions.
 * Adding a token without documenting why it exists now fails the build, and so
 * does changing a value in one place only.
 *
 * Run: npm run check:tokens
 */

import { readFileSync } from 'node:fs';

const json = readFileSync(new URL('../src/lib/design/tokens.json', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/lib/design/tokens.css', import.meta.url), 'utf8');

const hexes = (source) =>
	new Set([...source.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase()));

/**
 * Documented in tokens.json precisely because they are NOT used. Recording a
 * deliberate omission is worth more than the small cost of listing it here,
 * and an exemption with a reason beside it is not the same thing as a check
 * quietly narrowed to pass.
 */
const UNUSED_BRAND_SWATCHES = {
	'#153327': '--swatch--green, documented as deliberately unused',
	'#162010': '--swatch--medium-green, documented as deliberately unused'
};

const inJson = hexes(json);
const inCss = hexes(css);

let failed = 0;

console.log(`tokens.json: ${inJson.size} colours · tokens.css: ${inCss.size} colours`);

for (const hex of inJson) {
	if (inCss.has(hex)) continue;
	if (hex in UNUSED_BRAND_SWATCHES) {
		console.log(`skip  ${hex}  ${UNUSED_BRAND_SWATCHES[hex]}`);
		continue;
	}
	failed++;
	console.error(`FAIL  ${hex}  documented in tokens.json but not declared in tokens.css`);
}

for (const hex of inCss) {
	if (inJson.has(hex)) continue;
	failed++;
	console.error(`FAIL  ${hex}  declared in tokens.css but undocumented in tokens.json`);
}

if (failed) {
	console.error(
		`\n${failed} token disagreement(s). The two files are one system; fix both or neither.`
	);
	process.exit(1);
}
console.log('tokens.json and tokens.css agree.');
