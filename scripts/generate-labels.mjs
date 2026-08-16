/**
 * Generate the QR codes for the machine labels.
 *
 * These are REAL, scannable codes, not a decorative pattern. A fake QR in a
 * project whose whole argument is about not faking things would be a poor joke,
 * and the codes are the one part of this product a reviewer can test with the
 * device already in their hand.
 *
 * Build time, not run time. `qrcode` is a devDependency and never reaches the
 * bundle: the output is committed SVG, so the floor pays nothing for it. That is
 * the narrowed dependency rule working exactly as intended, and it is why the
 * rule was narrowed. See docs/rules/behaviour.md.
 *
 * Run: npm run labels
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import QRCode from 'qrcode';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = join(root, 'static', 'labels');

/** Kept in step with src/lib/data/assets.ts by scripts/check-labels.mjs. */
const ASSETS = ['AST-3121', 'AST-2210', 'AST-0030', 'AST-1180', 'AST-1204'];

/**
 * The deployed origin, because a QR code has to work when the phone is offline
 * from the plant network and resolving a relative path is not a thing a camera
 * app can do. Overridable so a fork can point at its own deployment.
 */
const ORIGIN = process.env.ASK_ORIGIN ?? 'https://doinstruct-ask.vercel.app';

/**
 * Error correction level M, about 15% recoverable.
 *
 * Not the default L. This label lives on a machine that gets hosed down and
 * wiped with a cloth every shift, so part of it will be scratched, greasy or
 * covered in product before it is replaced. H (30%) was tempting, but it makes
 * the code denser for the same physical size, and a denser code needs a steadier
 * hand in bad light. M is the compromise the print size is chosen around.
 */
const OPTIONS = {
	errorCorrectionLevel: 'M',
	type: 'svg',
	margin: 2, // Quiet zone. Cameras fail without it and it is the most common mistake.
	color: { dark: '#000000', light: '#ffffff' }
};

mkdirSync(outDir, { recursive: true });

let written = 0;
for (const asset of ASSETS) {
	const url = `${ORIGIN}/?asset=${asset}`;
	const svg = await QRCode.toString(url, OPTIONS);
	writeFileSync(join(outDir, `${asset}.svg`), svg);
	console.log(`${asset}  ${url}`);
	written++;
}

console.log(`\n${written} label(s) written to static/labels/`);
