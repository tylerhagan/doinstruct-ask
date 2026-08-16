/**
 * Register check.
 *
 * The design system has two registers. The floor is a gloved hand under
 * washdown glare on a five-year-old Android. The office is a supervisor at a
 * desk with a mouse. The office register adds density, elevation and a chart
 * palette, and none of those may leak back onto the floor:
 *
 *   - a 36px control is unhittable through a cut-resistant glove
 *   - a shadow is invisible under direct washdown lighting, and disappears
 *     entirely when a customer prints a screen to a laminated card for the line
 *   - chart colours are 3:1 marks, and the floor holds everything to 7:1
 *
 * Every previous version of this rule in this project was prose, and every
 * prose rule in this project has eventually been broken. This makes it a build
 * failure instead.
 *
 * The check runs one direction only. The office may use anything the floor
 * uses, because the floor's constraints are stricter and a stricter component
 * still works at a desk. The reverse is not true, and that asymmetry is the
 * whole rule.
 *
 * Run: npm run check:register
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* fileURLToPath, not `new URL(...).pathname`: the latter keeps the percent
   encoding, and this repository's own directory name contains spaces. */
const root = fileURLToPath(new URL('..', import.meta.url));

/** Paths that render on the device. Anything here is held to the floor. */
const FLOOR = ['src/lib/components', 'src/routes/+page.svelte'];

/** Paths exempt because they are review surfaces, not the product. */
const EXEMPT = ['src/routes/system'];

/**
 * [pattern, what it is, why the floor cannot have it]
 *
 * Both the utility form and the raw custom property are matched, because
 * `style="box-shadow: var(--shadow-overlay)"` breaks the rule just as squarely
 * as `class="shadow-overlay"` and is easier to write by accident.
 */
const FORBIDDEN = [
	[
		/\bshadow-(raised|overlay)\b|--shadow-(raised|overlay)/,
		'elevation',
		'invisible under washdown lighting, and gone when the screen is printed to a laminated card'
	],
	[
		/\b(?:min-h|max-h|h|w|min-w|size)-control\b|--spacing-control/,
		'desk control height',
		'36px is below the 64px gloved-hand floor'
	],
	[
		/\b(?:min-h|max-h|h)-row\b|--spacing-row/,
		'desk row height',
		'56px is below the 64px gloved-hand floor'
	],
	[
		/\b[a-z-]+-(?:series|scale)-[1-5]\b|--color-(?:series|scale)-/,
		'chart palette',
		'chart marks are 3:1; every colour on the floor clears 7:1'
	]
];

function walk(path) {
	const out = [];
	const full = join(root, path);
	if (!existsSync(full)) return out;
	if (statSync(full).isFile()) return [path];
	for (const entry of readdirSync(full)) {
		out.push(...walk(join(path, entry).replaceAll('\\', '/')));
	}
	return out;
}

const files = FLOOR.flatMap(walk)
	.filter((f) => /\.(svelte|ts|css)$/.test(f))
	.filter((f) => !EXEMPT.some((e) => f.startsWith(e)));

let failed = 0;

console.log(`Floor register: ${files.length} file(s)`);

for (const file of files) {
	const lines = readFileSync(join(root, file), 'utf8').split('\n');
	lines.forEach((line, i) => {
		// A rule quoted in a header comment is documentation, not usage.
		if (/^\s*(\*|\/\/|<!--)/.test(line)) return;
		for (const [pattern, what, why] of FORBIDDEN) {
			const hit = line.match(pattern);
			if (!hit) continue;
			failed++;
			console.error(`FAIL  ${file}:${i + 1}  ${what} on a floor surface`);
			console.error(`      found "${hit[0].trim()}": ${why}`);
		}
	});
}

if (failed) {
	console.error(
		`\n${failed} register violation(s). Move the component to the office register, or use a floor token.`
	);
	process.exit(1);
}
console.log('No office tokens on the floor.');
