import type { Answer, Escalation, Language, Localised, Responder, Source } from '$lib/domain/types';

/**
 * Three scenarios, chosen because together they cover the only three things this
 * product can do: answer, refuse, or route to a human.
 *
 * Content is localised down to the procedure steps, not just the chrome.
 * Switching language changes the answer itself, which is the claim doinstruct
 * makes with "35+ languages", and demonstrating it with translated buttons and
 * untranslated content would be a lie.
 *
 * Sources deliberately stay German. The documentation on a German line IS
 * German; the point is that the worker never has to read it.
 */

const MAREK: Responder = {
	id: 'r-marek',
	name: 'Marek Kowalski',
	role: { de: 'Schichtleiter', ro: 'Șef de tură', en: 'Shift lead' },
	line: 'Linie 3',
	typicalResponseMinutes: 4,
	languages: ['de', 'ro'],
	onShift: true
};

const MANUAL: Source = {
	id: 'src-f2-42',
	document: 'Wartungshandbuch Füller F2',
	section: '§4.2 Fehlercode E-212',
	page: 87,
	language: 'de',
	updatedAt: '2026-05-02'
};

/**
 * An HR source, and the date on it is the point.
 *
 * A works agreement is renegotiated, and in Germany much of what a frontline
 * worker asks about is governed by a Betriebsvereinbarung or a Tarifvertrag
 * that varies by site and expires. A stale collective agreement quoted
 * confidently is a worse failure than a stale torque value, because the worker
 * has no way to notice and the consequences are legal. This is exactly why
 * provenance stopped being a nice feature the moment HR arrived.
 */
const WORKS_AGREEMENT: Source = {
	id: 'src-bv-krank',
	document: 'Betriebsvereinbarung Arbeitszeit und Fehlzeiten',
	section: '§5 Krankmeldung',
	page: 9,
	language: 'de',
	updatedAt: '2026-02-10'
};

/** HR is a named person too. The whole product refuses to route to a mailbox. */
const SABINE: Responder = {
	id: 'r-sabine',
	name: 'Sabine Vogt',
	role: { de: 'Personalabteilung', ro: 'Resurse umane', en: 'HR' },
	line: 'Werk Nord',
	typicalResponseMinutes: 90,
	languages: ['de', 'en'],
	onShift: true
};

const LOTO: Source = {
	id: 'src-loto',
	document: 'Betriebsanweisung Verriegelung und Freischaltung',
	section: '§2 Schutztüren',
	page: 12,
	language: 'de',
	updatedAt: '2026-01-15'
};

export type ScenarioId = 'sourced' | 'refusal' | 'miss' | 'hr-policy' | 'hr-personal';

interface Scenario {
	id: ScenarioId;
	label: string;
	/**
	 * Links this question to the supervisor's queue and back again. When an
	 * answer for this topic has been published, the assistant serves it instead
	 * of escalating, which is the entire product argument happening rather than
	 * being described. See src/lib/state/exchange.svelte.ts.
	 */
	topic?: string;
	utterance: Localised;
	/** Words the recogniser marks as uncertain, always the fault code, which is
	 *  exactly the token you must not get wrong. */
	uncertain: string[];
	build: (lang: Language) => { answer?: Answer; escalation?: Escalation };
}

/* -------------------------------------------------------------------------- */

const SOURCED = {
	summary: {
		de: 'Druckabfall an Füllventil 7. Dichtung prüfen und tauschen, etwa 10 Minuten.',
		ro: 'Cădere de presiune la supapa de umplere 7. Verifică și schimbă garnitura, circa 10 minute.',
		en: 'Pressure drop at filling valve 7. Check and replace the seal, about 10 minutes.'
	},
	steps: [
		{
			de: 'Anlage am HMI auf Standby stellen. Nicht Not-Aus, das löst einen Formatverlust aus.',
			ro: 'Pune instalația pe standby de la HMI. Nu opriere de urgență, asta provoacă pierderea formatului.',
			en: 'Put the line into standby at the HMI. Not emergency stop, that causes a format loss.'
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
		},
		{
			de: 'Den Dichtungstausch im Schichtbuch eintragen, mit Teile-Nr. und Uhrzeit.',
			ro: 'Notează schimbarea garniturii în registrul de tură, cu cod piesă și ora.',
			en: 'Log the seal replacement in the shift book, with part number and time.'
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
		de: 'Hol Marek Kowalski oder die Elektrofachkraft. Sie dürfen die Anlage freischalten, du nicht.',
		ro: 'Cheamă-l pe Marek Kowalski sau electricianul autorizat. Ei pot izola instalația, tu nu.',
		en: 'Get Marek Kowalski or the qualified electrician. They may isolate the line, you may not.'
	}
};

const MISS_REPLY = {
	de: 'Das Klopfen kommt vom Kurvenrollenlager am Verschließer. Nach jedem Formatwechsel nachfetten, sonst läuft es trocken. Ich habe es eben gemacht.',
	ro: 'Bătaia vine de la rulmentul cu rolă de la închizător. După fiecare schimbare de format trebuie uns, altfel merge uscat. Tocmai am făcut-o.',
	en: 'The knocking is the cam roller bearing on the capper. It needs greasing after every format change or it runs dry. I have just done it.'
};

/* -------------------------------------------------------------------------- */

const HR_POLICY = {
	de: {
		summary:
			'Melde dich vor Schichtbeginn bei der Schichtleitung, telefonisch oder über die App. Ab dem vierten Tag brauchst du eine Bescheinigung vom Arzt.',
		steps: [
			'Schichtleitung anrufen, bevor deine Schicht beginnt.',
			'Wenn du niemanden erreichst, sprich auf die Mailbox und schreib zusätzlich.',
			'Ab dem vierten Krankheitstag die Bescheinigung an die Personalabteilung.'
		]
	},
	ro: {
		summary:
			'Anunță șeful de tură înainte de începerea turei, telefonic sau prin aplicație. Din a patra zi ai nevoie de adeverință de la medic.',
		steps: [
			'Sună șeful de tură înainte să înceapă tura.',
			'Dacă nu răspunde nimeni, lasă mesaj și scrie și un mesaj text.',
			'Din a patra zi de boală, trimite adeverința la resurse umane.'
		]
	},
	en: {
		summary:
			'Tell the shift lead before your shift starts, by phone or through the app. From the fourth day you need a doctor’s certificate.',
		steps: [
			'Call the shift lead before your shift starts.',
			'If nobody answers, leave a message and text as well.',
			'From the fourth day of illness, send the certificate to HR.'
		]
	}
};

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
		topic: 'capper-knock',
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
	},
	{
		id: 'hr-policy',
		label: 'HR policy → answered like any other document',
		utterance: {
			de: 'Wie melde ich mich krank?',
			ro: 'Cum anunț că sunt bolnav?',
			en: 'How do I report sick?'
		},
		uncertain: [],
		build: (lang) => ({
			answer: {
				id: 'a-krank',
				question: 'Krankmeldung',
				summary: HR_POLICY[lang].summary,
				steps: HR_POLICY[lang].steps.map((text, i) => ({ n: i + 1, text })),
				sources: [WORKS_AGREEMENT],
				confidence: 'sourced',
				safety: 'none'
			}
		})
	},
	{
		id: 'hr-personal',
		label: 'HR personal → refused, because it needs to know who you are',
		utterance: {
			de: 'Wie viele Urlaubstage habe ich noch?',
			ro: 'Câte zile de concediu mai am?',
			en: 'How many holiday days do I have left?'
		},
		uncertain: [],
		build: () => ({
			escalation: {
				id: 'esc-hr',
				question: 'remaining holiday',
				reason: 'needs-identity' as const,
				responder: SABINE,
				askedAt: new Date().toISOString(),
				status: 'waiting' as const
			}
		})
	}
];


export function scenarioById(id: ScenarioId): Scenario {
	return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
