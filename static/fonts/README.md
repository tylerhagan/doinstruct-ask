# Manrope

Two subsets of the Manrope variable font, weight axis 400 to 800.

| File | Subset | Size | Loaded when |
| --- | --- | --- | --- |
| `manrope-latin.woff2` | Latin | 24.8 KB | Always |
| `manrope-latin-ext.woff2` | Latin Extended | 15.1 KB | Romanian, Polish, Turkish, Hungarian |

Self-hosted rather than linked from Google Fonts. A third-party font request is
a third-party DNS lookup, a second TLS handshake and a privacy question in a
German B2B sale, and none of that is worth it for two files we can serve from
the same origin as everything else.

**Licence:** SIL Open Font License 1.1. Manrope is by Mikhail Sharanda.
Source: <https://github.com/sharanda/manrope>. The OFL permits redistribution
and embedding; the licence travels with the font and is reproduced in full at
that URL.

**Regenerating:** the files came from Google Fonts' `css2` endpoint, which
serves the same subsets Google's own CDN does. Ask for
`family=Manrope:wght@400..800` and take the `latin` and `latin-ext` `@font-face`
sources.
