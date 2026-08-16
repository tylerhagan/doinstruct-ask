import type { CoverageBucket, KnowledgeEntry, QueueItem } from '$lib/domain/office';
import { suppress } from '$lib/domain/office';

/**
 * Fixtures for the office surface.
 *
 * Same plant as the floor scenarios, deliberately: Linie 3 and Füller F2 appear
 * on both surfaces, so a reviewer can follow one machine from a worker's
 * question to a supervisor's reply to a knowledge entry. A demo where the two
 * halves describe different factories would prove nothing about the product
 * being one product.
 *
 * AGENTS: this is fixture data, not a schema. Add fields in
 * `src/lib/domain/office.ts` first. Identifiers (machine names, asset IDs, fault
 * codes, document titles) stay German in every locale, because the worker has to
 * match them against a nameplate. Everything a person reads is localised.
 *
 * Nothing here is a real person or a real plant.
 */

const NOW = new Date('2026-08-16T09:12:00Z');

/** Minutes ago, as an ISO string, so the fixtures do not rot into the past. */
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000).toISOString();

/* -------------------------------------------------------------------------- */
/* Queue                                                                      */
/* -------------------------------------------------------------------------- */

export const QUEUE: QueueItem[] = [
	{
		id: 'q-1',
		question: {
			de: 'Die Schutztür an Füller F2 lässt sich nach dem Reinigen nicht wieder verriegeln. Was jetzt?',
			ro: 'Ușa de protecție la Füller F2 nu se mai blochează după curățare. Ce fac acum?',
			en: 'The guard door on Füller F2 will not lock again after cleaning. What now?'
		},
		askedIn: 'ro',
		line: 'Linie 3',
		machine: 'Füller F2',
		assetId: 'AST-3121',
		faultCode: 'E-212',
		shift: 'early',
		waitingSince: ago(41),
		askedBy: {
			name: 'Ana Popescu',
			role: { de: 'Anlagenführerin', ro: 'Operator linie', en: 'Line operator' }
		},
		alsoWaiting: 2,
		attempt: {
			outcome: 'partial',
			detail: {
				de: 'Ich habe die Verriegelung im Handbuch gefunden, aber nichts über das Verhalten nach einer Nassreinigung.',
				ro: 'Am găsit interblocarea în manual, dar nimic despre comportamentul după spălare.',
				en: 'I found the interlock in the manual, but nothing about how it behaves after a washdown.'
			},
			searched: ['Wartungshandbuch Füller F2', 'Betriebsanweisung Verriegelung und Freischaltung']
		},
		triage: 'documentation',
		safety: 'caution'
	},
	{
		id: 'q-2',
		question: {
			de: 'Wie oft muss der Filter am Palettierer gewechselt werden? Im Schichtbuch steht wöchentlich, auf dem Aushang monatlich.',
			ro: 'Cât de des se schimbă filtrul la paletizator? În registrul de tură scrie săptămânal, pe afiș scrie lunar.',
			en: 'How often does the palletiser filter need changing? The shift book says weekly, the notice says monthly.'
		},
		askedIn: 'de',
		line: 'Linie 3',
		machine: 'Palettierer P1',
		assetId: 'AST-2210',
		shift: 'early',
		waitingSince: ago(96),
		askedBy: {
			name: 'Jonas Weber',
			role: { de: 'Instandhalter', ro: 'Tehnician mentenanță', en: 'Maintenance technician' }
		},
		alsoWaiting: 0,
		attempt: {
			outcome: 'partial',
			detail: {
				de: 'Zwei Quellen widersprechen sich. Ich sage lieber nichts, als die falsche zu wählen.',
				ro: 'Două surse se contrazic. Prefer să nu spun nimic decât să aleg greșit.',
				en: 'Two sources contradict each other. I would rather say nothing than pick the wrong one.'
			},
			searched: ['Wartungsplan Palettierer P1', 'Schichtbuch Linie 3']
		},
		triage: 'documentation',
		safety: 'none'
	},
	{
		id: 'q-3',
		question: {
			de: 'E-212 ist heute zum vierten Mal gekommen. Ich habe die Dichtung schon zweimal getauscht.',
			ro: 'E-212 a apărut a patra oară azi. Am schimbat garnitura deja de două ori.',
			en: 'E-212 has come up four times today. I have already replaced the seal twice.'
		},
		askedIn: 'ro',
		line: 'Linie 3',
		machine: 'Füller F2',
		assetId: 'AST-3121',
		faultCode: 'E-212',
		shift: 'early',
		waitingSince: ago(18),
		askedBy: {
			name: 'Ana Popescu',
			role: { de: 'Anlagenführerin', ro: 'Operator linie', en: 'Line operator' }
		},
		alsoWaiting: 1,
		attempt: {
			outcome: 'partial',
			detail: {
				de: 'Die dokumentierte Abhilfe habe ich schon zweimal ausgegeben. Sie wirkt nicht mehr, also ist das kein Dokumentationsproblem.',
				ro: 'Am dat deja de două ori remediul documentat. Nu mai funcționează, deci nu este o problemă de documentație.',
				en: 'I have already served the documented fix twice. It is no longer working, so this is not a documentation problem.'
			},
			searched: ['Wartungshandbuch Füller F2']
		},
		triage: 'machine',
		safety: 'none'
	},
	{
		id: 'q-4',
		question: {
			de: 'Darf ich den Not-Aus zurücksetzen, wenn die Anlage von selbst gestoppt hat?',
			ro: 'Pot să resetez Not-Aus dacă instalația s-a oprit singură?',
			en: 'Can I reset the Not-Aus if the line stopped on its own?'
		},
		askedIn: 'ro',
		line: 'Linie 2',
		machine: 'Etikettierer E4',
		assetId: 'AST-1180',
		shift: 'late',
		waitingSince: ago(150),
		askedBy: {
			name: 'Marius Ilie',
			role: { de: 'Anlagenführer', ro: 'Operator linie', en: 'Line operator' }
		},
		alsoWaiting: 4,
		attempt: {
			outcome: 'refused-safety',
			detail: {
				de: 'Ich habe die Antwort und gebe sie nicht heraus. Ein Not-Aus wird nur von einer Fachkraft zurückgesetzt, und das ist keine Frage der Formulierung.',
				ro: 'Am răspunsul și nu îl dau. Un Not-Aus se resetează doar de o persoană calificată, și asta nu ține de formulare.',
				en: 'I have the answer and I am withholding it. A Not-Aus is reset by a qualified person only, and that is not a wording problem.'
			},
			searched: ['Betriebsanweisung Verriegelung und Freischaltung']
		},
		triage: 'people',
		safety: 'stop'
	},
	{
		id: 'q-5',
		question: {
			de: 'Welche Schutzausrüstung brauche ich für die CIP-Reinigung an Linie 3?',
			ro: 'Ce echipament de protecție îmi trebuie pentru curățarea CIP la linia 3?',
			en: 'What protective equipment do I need for the CIP clean on line 3?'
		},
		askedIn: 'ro',
		line: 'Linie 3',
		machine: 'CIP-Station',
		assetId: 'AST-0030',
		shift: 'night',
		waitingSince: ago(320),
		askedBy: {
			name: 'Elena Dumitru',
			role: { de: 'Reinigungskraft', ro: 'Operator curățenie', en: 'Cleaning operative' }
		},
		alsoWaiting: 3,
		attempt: {
			outcome: 'no-source',
			detail: {
				de: 'Die CIP-Betriebsanweisung ist im System, aber ohne Abschnitt zur Schutzausrüstung.',
				ro: 'Instrucțiunea CIP este în sistem, dar fără secțiune despre echipamentul de protecție.',
				en: 'The CIP instruction is in the system, but it has no protective equipment section.'
			},
			searched: ['Betriebsanweisung CIP Linie 3']
		},
		triage: 'documentation',
		safety: 'caution'
	},
	{
		id: 'q-6',
		question: {
			de: 'Der Sensor an der Übergabe meldet dauernd Störung, obwohl nichts im Weg ist.',
			ro: 'Senzorul de la transfer semnalează mereu eroare, deși nu este nimic în cale.',
			en: 'The transfer sensor keeps reporting a fault even though nothing is in the way.'
		},
		askedIn: 'de',
		line: 'Linie 2',
		machine: 'Übergabe Ü2',
		assetId: 'AST-1204',
		faultCode: 'S-045',
		shift: 'late',
		waitingSince: ago(205),
		askedBy: {
			name: 'Sofia Braun',
			role: { de: 'Instandhalterin', ro: 'Tehnician mentenanță', en: 'Maintenance technician' }
		},
		alsoWaiting: 0,
		attempt: {
			outcome: 'no-source',
			detail: {
				de: 'Zu S-045 steht nichts in der Dokumentation, die wir haben.',
				ro: 'Nu există nimic despre S-045 în documentația pe care o avem.',
				en: 'There is nothing about S-045 in the documentation we hold.'
			},
			searched: ['Wartungshandbuch Übergabe Ü2']
		},
		triage: 'machine',
		safety: 'none'
	}
];

/* -------------------------------------------------------------------------- */
/* Coverage                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Buckets pass through `suppress()` rather than carrying a pre-computed null,
 * so the threshold is applied by the same function everywhere and the fixture
 * cannot quietly disagree with the rule.
 *
 * `CIP Linie 3 · Schutzausrüstung` is here at 4 events specifically so the
 * suppressed state is visible in the demo. A privacy rule you cannot see working
 * is a privacy rule nobody believes.
 */
export const COVERAGE: CoverageBucket[] = [
	{
		id: 'c-1',
		triage: 'documentation',
		label: 'Wartungshandbuch Füller F2 · §4.2',
		detail: {
			de: 'Verriegelung nach Nassreinigung ist nicht beschrieben.',
			ro: 'Interblocarea după spălare nu este descrisă.',
			en: 'Interlock behaviour after washdown is not described.'
		},
		count: suppress(34),
		trend: [3, 5, 4, 7, 6, 9],
		sourceAgeMonths: 3
	},
	{
		id: 'c-2',
		triage: 'documentation',
		label: 'Wartungsplan Palettierer P1 · §1',
		detail: {
			de: 'Widerspricht dem Aushang an der Anlage.',
			ro: 'Contrazice afișul de la instalație.',
			en: 'Contradicts the notice posted on the machine.'
		},
		count: suppress(21),
		trend: [2, 3, 3, 4, 4, 5],
		sourceAgeMonths: 19
	},
	{
		id: 'c-3',
		triage: 'documentation',
		label: 'Betriebsanweisung CIP Linie 3',
		detail: {
			de: 'Kein Abschnitt zur Schutzausrüstung.',
			ro: 'Fără secțiune despre echipamentul de protecție.',
			en: 'No protective equipment section.'
		},
		count: suppress(4),
		trend: [],
		sourceAgeMonths: 27
	},
	{
		id: 'c-4',
		triage: 'machine',
		label: 'Füller F2 · E-212',
		detail: {
			de: 'Dokumentierte Abhilfe wirkt nicht mehr. Wiederholt nach Reparatur.',
			ro: 'Remediul documentat nu mai funcționează. Reapare după reparație.',
			en: 'The documented fix no longer works. Recurring after repair.'
		},
		count: suppress(27),
		trend: [1, 2, 4, 5, 7, 8]
	},
	{
		id: 'c-5',
		triage: 'machine',
		label: 'Übergabe Ü2 · S-045',
		detail: {
			de: 'Kein Eintrag in der Dokumentation, häufige Fehlauslösung.',
			ro: 'Fără intrare în documentație, declanșare falsă frecventă.',
			en: 'No documentation entry, frequent false trips.'
		},
		count: suppress(11),
		trend: [0, 1, 2, 2, 3, 3]
	},
	{
		id: 'c-6',
		triage: 'people',
		label: 'Not-Aus · Zurücksetzen',
		detail: {
			de: 'Wiederholt gefragt von Rollen ohne Freigabe. Schulung, keine Dokumentation.',
			ro: 'Întrebare repetată de roluri fără autorizare. Instruire, nu documentație.',
			en: 'Repeatedly asked by roles without authorisation. Training, not documentation.'
		},
		count: suppress(19),
		trend: [2, 2, 3, 4, 4, 4]
	},
	{
		id: 'c-7',
		triage: 'people',
		label: 'Verriegelung und Freischaltung · Grundlagen',
		detail: {
			de: 'Grundlagenfragen deuten auf eine Lücke in der Einweisung.',
			ro: 'Întrebările de bază indică o lipsă în instruire.',
			en: 'Basic questions point to a gap in induction, not in the manual.'
		},
		count: suppress(9),
		trend: [1, 1, 2, 2, 2, 1]
	}
];

/** Week labels for the trend series. Identifiers, so the same in every locale. */
export const COVERAGE_WEEKS = ['KW 27', 'KW 28', 'KW 29', 'KW 30', 'KW 31', 'KW 32'];

/* -------------------------------------------------------------------------- */
/* Knowledge                                                                  */
/* -------------------------------------------------------------------------- */

export const KNOWLEDGE: KnowledgeEntry[] = [
	{
		id: 'k-1',
		ref: 'WE-2026-0841',
		question: {
			de: 'Was tun, wenn E-212 nach dem Dichtungswechsel wiederkommt?',
			ro: 'Ce fac dacă E-212 revine după schimbarea garniturii?',
			en: 'What to do if E-212 returns after a seal change?'
		},
		answer: {
			de: 'Zweimal dieselbe Störung nach Dichtungswechsel heißt: nicht noch einmal tauschen. Anlage abmelden, im Schichtbuch eintragen und an die Instandhaltung übergeben.',
			ro: 'Aceeași eroare de două ori după schimbarea garniturii înseamnă: nu mai schimba. Scoate instalația din serviciu, notează în registrul de tură și predă mentenanței.',
			en: 'The same fault twice after a seal change means: do not replace it again. Take the machine out of service, log it in the shift book, and hand it to maintenance.'
		},
		machine: 'Füller F2',
		assetId: 'AST-3121',
		faultCode: 'E-212',
		safety: 'none',
		verifiedBy: 'Marek Kowalski',
		verifiedRole: { de: 'Schichtleiter', ro: 'Șef de tură', en: 'Shift lead' },
		publishedAt: '2026-08-14',
		languages: ['de', 'ro', 'en'],
		served: 12,
		patches: 'Wartungshandbuch Füller F2 · §4.2',
		review: 'current'
	},
	{
		id: 'k-2',
		ref: 'WE-2026-0838',
		question: {
			de: 'Schutztür verriegelt nach der Reinigung nicht.',
			ro: 'Ușa de protecție nu se blochează după curățare.',
			en: 'Guard door does not lock after cleaning.'
		},
		answer: {
			de: 'Restwasser im Verriegelungsschalter verhindert das Schließen. Bereich trocknen, fünf Minuten warten, erneut versuchen. Verriegelt sie dann immer noch nicht, ist das ein Fall für die Fachkraft und nicht für einen zweiten Versuch.',
			ro: 'Apa rămasă în comutatorul de interblocare împiedică închiderea. Usucă zona, așteaptă cinci minute, încearcă din nou. Dacă tot nu se blochează, este un caz pentru personal calificat, nu pentru a doua încercare.',
			en: 'Residual water in the interlock switch prevents closing. Dry the area, wait five minutes, try again. If it still will not lock, that is a job for a qualified person and not for a second attempt.'
		},
		machine: 'Füller F2',
		assetId: 'AST-3121',
		safety: 'caution',
		verifiedBy: 'Marek Kowalski',
		verifiedRole: { de: 'Schichtleiter', ro: 'Șef de tură', en: 'Shift lead' },
		publishedAt: '2026-08-11',
		languages: ['de', 'ro', 'en'],
		served: 31,
		patches: 'Betriebsanweisung Verriegelung und Freischaltung · §2',
		review: 'current'
	},
	{
		id: 'k-3',
		ref: 'WE-2026-0812',
		question: {
			de: 'Wie oft wird der Filter am Palettierer gewechselt?',
			ro: 'Cât de des se schimbă filtrul la paletizator?',
			en: 'How often is the palletiser filter changed?'
		},
		answer: {
			de: 'Wöchentlich. Der Aushang an der Anlage ist veraltet und wird ersetzt.',
			ro: 'Săptămânal. Afișul de la instalație este depășit și va fi înlocuit.',
			en: 'Weekly. The notice on the machine is out of date and is being replaced.'
		},
		machine: 'Palettierer P1',
		assetId: 'AST-2210',
		safety: 'none',
		verifiedBy: 'Katrin Lehmann',
		verifiedRole: {
			de: 'Instandhaltungsleiterin',
			ro: 'Șefă mentenanță',
			en: 'Maintenance manager'
		},
		publishedAt: '2026-06-02',
		languages: ['de', 'ro', 'en'],
		served: 44,
		patches: 'Wartungsplan Palettierer P1 · §1',
		review: 'due'
	},
	{
		id: 'k-4',
		ref: 'WE-2026-0790',
		question: {
			de: 'Darf ich den Not-Aus selbst zurücksetzen?',
			ro: 'Pot să resetez singur Not-Aus?',
			en: 'Can I reset the Not-Aus myself?'
		},
		answer: {
			de: 'Nein. Der Not-Aus wird ausschließlich von einer benannten Fachkraft zurückgesetzt, nach Prüfung der Ursache. Melde dich bei der Schichtleitung und arbeite nicht weiter an der Anlage.',
			ro: 'Nu. Not-Aus se resetează exclusiv de o persoană calificată desemnată, după verificarea cauzei. Anunță șeful de tură și nu continua lucrul la instalație.',
			en: 'No. The Not-Aus is reset only by a named qualified person, after the cause has been checked. Tell the shift lead and do not carry on working on the machine.'
		},
		machine: 'Etikettierer E4',
		assetId: 'AST-1180',
		safety: 'stop',
		verifiedBy: 'Katrin Lehmann',
		verifiedRole: {
			de: 'Instandhaltungsleiterin',
			ro: 'Șefă mentenanță',
			en: 'Maintenance manager'
		},
		publishedAt: '2026-05-20',
		languages: ['de', 'ro', 'en'],
		served: 58,
		review: 'current'
	},
	{
		id: 'k-5',
		ref: 'WE-2025-0611',
		question: {
			de: 'Welche Schutzausrüstung bei der CIP-Reinigung?',
			ro: 'Ce echipament de protecție la curățarea CIP?',
			en: 'What protective equipment for the CIP clean?'
		},
		answer: {
			de: 'Ersetzt durch WE-2026-0803 nach Änderung des Reinigungsmittels.',
			ro: 'Înlocuit de WE-2026-0803 după schimbarea agentului de curățare.',
			en: 'Superseded by WE-2026-0803 after the cleaning agent changed.'
		},
		machine: 'CIP-Station',
		assetId: 'AST-0030',
		safety: 'caution',
		verifiedBy: 'Katrin Lehmann',
		verifiedRole: {
			de: 'Instandhaltungsleiterin',
			ro: 'Șefă mentenanță',
			en: 'Maintenance manager'
		},
		publishedAt: '2025-11-04',
		languages: ['de', 'ro'],
		served: 9,
		review: 'superseded'
	}
];
