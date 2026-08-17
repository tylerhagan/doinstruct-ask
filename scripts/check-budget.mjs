/**
 * Bundle budget.
 *
 * The writeup says the floor route costs about 49 KB of gzipped JavaScript, and
 * every frontline-reality claim in this project rests on that number: a
 * five-year-old Android over plant wifi, first paint that does not wait for the
 * network, no webfont blocking text. Until now the number was measured once, by
 * hand, and written into a document.
 *
 * That is exactly the failure mode this project keeps finding. So it is a check.
 * One convenience dependency, or one careless import that drags the office
 * surface into the floor chunk, moves this and nothing else would say so.
 *
 * Measures what the DEVICE actually fetches: the entry HTML's own module graph,
 * not the whole build directory. The office surface, the design-system gallery
 * and the supervisor's vocabulary are separate chunks a worker never loads, and
 * counting them would make the budget meaningless in the wrong direction.
 *
 * Run: npm run check:budget   (after npm run build)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const build = join(root, 'build');

if (!existsSync(build)) {
	console.error('No build/ directory. Run `npm run build` first.');
	process.exit(1);
}

/**
 * Budgets in bytes, gzipped.
 *
 * Headroom is deliberate but small. A budget with none fails on every honest
 * change and gets raised until it means nothing; a budget with plenty is not a
 * budget. These sit roughly 5% above today's measurement, which is enough for a
 * feature and not enough for a library.
 */
const BUDGETS = {
	js: 52 * 1024,
	css: 9 * 1024
};

const gz = (file) => gzipSync(readFileSync(file)).length;

/** Every asset the entry document tells the browser to fetch, deduplicated. */
function referenced(htmlPath, extension) {
	const html = readFileSync(htmlPath, 'utf8');
	const base = dirname(htmlPath);
	const hits = new Set();

	for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
		const ref = match[1];
		if (!ref.endsWith(extension)) continue;
		const resolved = join(base, ref.replace(/^\.\//, ''));
		if (existsSync(resolved)) hits.add(resolved);
	}
	return [...hits];
}

const entry = join(build, 'index.html');
const js = referenced(entry, '.js');
const css = referenced(entry, '.css');

const total = (files) => files.reduce((sum, f) => sum + gz(f), 0);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

let failed = 0;

for (const [label, files, budget] of [
	['JavaScript', js, BUDGETS.js],
	['CSS', css, BUDGETS.css]
]) {
	const size = total(files);
	const ok = size <= budget;
	if (!ok) failed++;
	console.log(
		`${ok ? 'pass' : 'FAIL'}  ${kb(size).padStart(8)} of ${kb(budget)}  ${label}, ` +
			`${files.length} file(s) the floor route fetches`
	);
}

/**
 * The separation is a claim too, and a cheaper one to break by accident: one
 * import of the office dictionary from a floor component would put the
 * supervisor's vocabulary on the device without changing a single visible
 * thing.
 */
const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
	);

const officeMarker = 'Offene Fragen';
const leaked = js.filter((f) => readFileSync(f, 'utf8').includes(officeMarker));

if (leaked.length) {
	failed++;
	console.error(
		`FAIL  the floor route fetches the office dictionary (${leaked.length} chunk(s)). ` +
			`A worker in a cold store should not download a supervisor's vocabulary.`
	);
} else {
	console.log('pass            office copy stays out of the floor route');
}

if (failed) {
	console.error(`\n${failed} budget check(s) failed.`);
	process.exit(1);
}

const allJs = walk(join(build, '_app')).filter((f) => f.endsWith('.js'));
console.log(
	`\nWhole build is ${kb(total(allJs))} across ${allJs.length} chunks; ` +
		`the floor fetches ${js.length} of them.`
);
