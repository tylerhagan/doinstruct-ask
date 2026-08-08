import type { Answer, Escalation, Language, Responder, Source } from '$lib/domain/types';

/**
 * Three scenarios, chosen because together they cover the only three things this
 * product can do: answer, refuse, or route to a human.
 *
 * Content is localised down to the procedure steps, not just the chrome.
 * Switching language changes the answer itself — that is the claim doinstruct
 * makes with "35+ languages", and demonstrating it with translated buttons and
 * untranslated content would be a lie.
 *
 * Sources deliberately stay German. The documentation on a German line IS
 * German; the point is that the worker never has to read it.
 */

type Localised = Record<Language, string>;

const MAREK: Responder = {
	id: 'r-marek',
	name: 'Marek Kowalski',
	role: 'Schichtleiter',
	line: 'Linie 3',
	typicalResponseMinutes: 4,
	languages: ['de', 'ro'],
	onShift: true
};

const MANUAL: Source = {
	id: 'src-f2-42',
	document: 'Füller F2 — Wartungshandbuch',
	section: '§4.2 Fehlercode E-212',
	page: 87,
	language: 'de',
	updatedAt: '2026-05-02'
};

const LOTO: Source = {
	id: 'src-loto',
	document: 'Betriebsanweisung — Verriegelung & Freischaltung',
	section: '§2 Schutztüren',
	page: 12,
	language: 'de',
	updatedAt: '2026-01-15'
};

export type ScenarioId = 'sourced' | 'refusal' | 'miss';

interface Scenario {
	id: ScenarioId;
	label: string;
	utterance: Localised;
	/** Words the recogniser marks as uncertain — always the fault code, which is
	 *  exactly the token you must not get wrong. */
	uncertain: string[];
	build: (lang: Language) => { answer?: Answer; escalation?: Escalation };
}

/* -------------------------------------------------------------------------- */

const SOURCED = {
	summary: {
		de: 'Druckabfall an Füllventil 7. Dichtung prüfen und tauschen — etwa 10 Minuten.',
		ro: 'Cădere de presiune la supapa de umplere 7. Verifică și schimbă garnitura — circa 10 minute.',
		en: 'Pressure drop at filling valve 7. Check and replace the seal — about 10 minutes.'
	},
	steps: [
		{
			de: 'Anlage am HMI auf Standby stellen. Nicht Not-Aus — das löst einen Formatverlust aus.',
			ro: 'Pune instalația pe standby de la HMI. Nu opriere de urgență — asta provoacă pierderea formatului.',
			en: 'Put the line into standby at the HMI. Not emergency stop — that causes a format loss.'
		},
		{
			de: 'Schutzbrille und Handschuhe anlegen, bevor du die Schutztür öffnest.',
			ro: 'Pune ochelari de protecție și mănuși înainte să deschizi ușa de protecție.',
			en: 'Put on safety glasses and gloves before opening the guard door.'
		},
		{
			de: 'Ventil 7 am Karussell prüfen. Sitzt die Dichtung schief oder ist sie sichtbar verschlissen?',
			ro: 'Verifică supapa 7 de pe carusel. Garnitura este strâmbă sau vizibil uzată?',
			en: 'Inspect valve 7 on the carousel. Is the seal sitting crooked or visibly worn?'
		},
		{
			de: 'Dichtung tauschen. Teile-Nr. 21-4471, liegt im Regal B4.',
			ro: 'Schimbă garnitura. Cod piesă 21-4471, se află pe raftul B4.',
			en: 'Replace the seal. Part no. 21-4471, on shelf B4.'
		},
		{
			de: 'Fehler am HMI quittieren und fünf Flaschen im Probelauf fahren.',
			ro: 'Confirmă eroarea la HMI și fă un test cu cinci sticle.',
			en: 'Acknowledge the fault at the HMI and run five bottles as a test.'
		}
	]
};

const REFUSAL = {
	summary: {
		de: 'Dazu gebe ich keine Anleitung. Die Schutztür bei laufender Anlage zu überbrücken ist verboten.',
		ro: 'Nu îți dau instrucțiuni pentru asta. Este interzis să ocolești ușa de protecție cu instalația pornită.',
		en: "I won't give instructions for that. Bypassing the guard door while the line is running is prohibited."
	},
	note: {
		de: 'Hol Marek Kowalski oder die Elektrofachkraft. Sie dürfen die Anlage freischalten — du nicht.',
		ro: 'Cheamă-l pe Marek Kowalski sau electricianul autorizat. Ei pot izola instalația — tu nu.',
		en: 'Get Marek Kowalski or the qualified electrician. They may isolate the line — you may not.'
	}
};

const MISS_REPLY = {
	de: 'Das Klopfen kommt vom Kurvenrollenlager am Verschließer. Nach jedem Formatwechsel nachfetten, sonst läuft es trocken. Ich habe es eben gemacht.',
	ro: 'Bătaia vine de la rulmentul cu rolă de la închizător. După fiecare schimbare de format trebuie uns, altfel merge uscat. Tocmai am făcut-o.',
	en: 'The knocking is the cam roller bearing on the capper. It needs greasing after every format change or it runs dry. I have just done it.'
};

/* -------------------------------------------------------------------------- */

export const SCENARIOS: Scenario[] = [
	{
		id: 'sourced',
		label: 'Answer from the manual',
		utterance: {
			de: 'Füller F2 zeigt Fehler E 212, was mache ich?',
			ro: 'Füller F2 arată eroarea E 212, ce fac?',
			en: 'Filler F2 shows error E 212, what do I do?'
		},
		uncertain: ['212'],
		build: (lang) => ({
			answer: {
				id: 'a-e212',
				question: 'E-212',
				summary: SOURCED.summary[lang],
				steps: SOURCED.steps.map((s, i) => ({
					n: i + 1,
					text: s[lang],
					safety: i === 1 ? ('caution' as const) : undefined
				})),
				sources: [MANUAL],
				confidence: 'sourced',
				safety: 'none'
			}
		})
	},

	{
		id: 'refusal',
		label: 'Safety refusal',
		utterance: {
			de: 'Wie überbrücke ich die Schutztür, damit ich im Lauf entstören kann?',
			ro: 'Cum ocolesc ușa de protecție ca să pot remedia în timpul funcționării?',
			en: 'How do I bypass the guard door so I can clear it while running?'
		},
		uncertain: [],
		build: (lang) => ({
			answer: {
				id: 'a-refusal',
				question: 'guard bypass',
				summary: REFUSAL.summary[lang],
				steps: [],
				sources: [LOTO],
				confidence: 'none',
				safety: 'stop',
				safetyNote: REFUSAL.note[lang]
			}
		})
	},

	{
		id: 'miss',
		label: 'Not in any manual → escalate',
		utterance: {
			de: 'Der Verschließer klopft seit dem Formatwechsel, kennt das jemand?',
			ro: 'Închizătorul bate de la schimbarea formatului, știe cineva?',
			en: 'The capper has been knocking since the format change, does anyone know this?'
		},
		uncertain: ['Formatwechsel'],
		build: (lang) => ({
			escalation: {
				id: 'esc-1',
				question: 'capper knocking after format change',
				responder: MAREK,
				askedAt: new Date().toISOString(),
				status: 'waiting',
				reply: MISS_REPLY[lang],
				auditRef: 'WE-2026-0412'
			}
		})
	}
];

export function scenarioById(id: ScenarioId): Scenario {
	return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
