import { session } from '$lib/state/session.svelte';
import { t, type StringKey } from './floor';
import type { Language } from '$lib/domain/types';

/**
 * Office copy, three languages.
 *
 * A separate module from `strings.ts` for one measurable reason: the floor
 * bundle must not carry the supervisor's vocabulary. The floor is a five-year-old
 * Android on plant wifi, and a worker holding down a button in a cold store
 * should not be paying for words only a shift lead will ever read. Nothing here
 * is imported by any floor route, so Rollup keeps it in the office chunk.
 *
 * `tOffice` falls back to the floor dictionary, so office components call one
 * function for everything and shared chrome such as the contrast toggle is not
 * duplicated and cannot drift.
 *
 * AGENTS: same rule as `strings.ts`. Never write a user-facing string literal
 * into a component, including `aria-label`. Enforced by scripts/check-i18n.mjs,
 * which globs all of `src/` and therefore covers both registers.
 *
 * Tone: the supervisor is a colleague, not a customer, so German stays in "du"
 * and Romanian in "tu", matching the floor. A dashboard that switches to "Sie"
 * is a dashboard written by a different company.
 */

export const OFFICE = {
	de: {
		'office.title': 'Schichtleitung',
		'office.plant': 'Werk Nord',
		'nav.queue': 'Offen',
		'nav.coverage': 'Lücken',
		'nav.knowledge': 'Wissen',
		'nav.label': 'Bereiche',
		'nav.toFloor': 'Zur Geräteansicht',
		'nav.waitingCount': '{n} warten auf Antwort',

		'queue.title': 'Offene Fragen',
		'queue.lede':
			'Älteste zuerst. Jede Zeile ist jemand, der gerade wartet, nicht eine Kennzahl über eine Person.',
		'queue.empty.title': 'Nichts offen.',
		'queue.empty.body': 'Alles beantwortet. Die nächste Frage landet hier.',
		'queue.waitingFor': 'wartet seit',
		'queue.alsoWaiting': '{n} weitere warten auf dieselbe Antwort',
		'queue.alsoWaitingOne': '1 weitere Person wartet auf dieselbe Antwort',
		'queue.tried': 'Das habe ich schon versucht',
		'queue.searched': 'Durchsucht',
		'queue.askedIn': 'Gefragt auf {lang}',
		'queue.answer': 'Antworten',
		'queue.selected': 'Ausgewählt',
		'queue.outcome.no-source': 'Keine Quelle gefunden',
		'queue.outcome.partial': 'Quellen widersprechen sich',
		'queue.outcome.refused-safety': 'Aus Sicherheitsgründen zurückgehalten',
		'queue.shift.early': 'Frühschicht',
		'queue.shift.late': 'Spätschicht',
		'queue.shift.night': 'Nachtschicht',
		'queue.filterShift': 'Schicht',
		'queue.filterLine': 'Linie',
		'queue.filterAll': 'Alle',
		'queue.noMatch': 'Keine Frage passt zu diesem Filter.',

		'triage.documentation': 'Dokumentation',
		'triage.machine': 'Technik',
		'triage.people': 'Schulung',
		'triage.documentation.action': 'Abschnitt überarbeiten',
		'triage.machine.action': 'An die Instandhaltung',
		'triage.people.action': 'An Genius übergeben',
		'triage.documentation.why': 'Die Anleitung erklärt es nicht. Das kannst du beheben.',
		'triage.machine.why': 'Die Maschine macht denselben Fehler wieder. Kein Dokumentationsproblem.',
		'triage.people.why': 'Die Anleitung ist da. Die Einweisung fehlt.',

		'composer.title': 'Antwort schreiben',
		'composer.forQuestion': 'Antwort auf',
		'composer.reply': 'Deine Antwort',
		'composer.replyHint':
			'Kurze Sätze. Das wird in jede Sprache übersetzt, die auf der Linie gebraucht wird.',
		'composer.safety': 'Sicherheitsstufe',
		'composer.safety.none': 'Normal',
		'composer.safety.caution': 'Vorsicht, Schutzausrüstung oder Prüfung nötig',
		'composer.safety.stop': 'Nur durch Fachkraft',
		'composer.attached': 'Angehängt',
		'composer.patches': 'Ersetzt Abschnitt',
		'composer.patchesNone': 'Kein Abschnitt ausgewählt',
		'composer.publish': 'Veröffentlichen',
		'composer.cancel': 'Abbrechen',
		'composer.reach': 'Erreicht {n} Personen, die gerade warten.',
		'composer.reachOne': 'Erreicht 1 Person, die gerade wartet.',
		'composer.becomesKnowledge':
			'Danach beantwortet der Assistent diese Frage selbst, sofort und in der Sprache der fragenden Person.',
		'composer.published': 'Veröffentlicht',
		'composer.publishedBody':
			'{name} bekommt die Antwort jetzt. Als Wissenseintrag {ref} gespeichert und geprüft von dir.',
		'composer.next': 'Nächste Frage',
		'composer.empty': 'Wähle links eine Frage aus.',
		'composer.emptyBody': 'Die Antwort, die du schreibst, wird einmal geschrieben und danach geteilt.',
		'composer.handoff.machine':
			'Das ist ein Technikproblem. Eine Antwort hilft der fragenden Person heute, behebt aber die Ursache nicht.',
		'composer.handoff.people':
			'Das ist eine Schulungslücke. Eine Antwort hilft heute, die Einweisung gehört zu Genius.',

		'coverage.title': 'Wo die Dokumentation nicht reicht',
		'coverage.lede':
			'Sortiert danach, was du beheben kannst. Diese Ansicht löst sich nie zu einer einzelnen Person auf, und das ist eine Entscheidung, keine fehlende Funktion.',
		'coverage.period': 'Letzte 6 Wochen',
		'coverage.byTriage': 'Nach Ursache',
		'coverage.unanswered': 'Unbeantwortete Fragen',
		'coverage.suppressed': 'Zu wenige, um sie zu zeigen',
		'coverage.suppressedWhy':
			'Unter {n} Ereignissen zeigt diese Ansicht keine Zahl. Bei kleinen Zahlen wird aus einer Gruppe schnell eine Person.',
		'coverage.trend': 'Verlauf',
		'coverage.trendTooFew': 'Zu wenige Daten für einen Verlauf.',
		'coverage.sourceAge': 'Quelle {n} Monate alt',
		'coverage.sourceAgeOne': 'Quelle 1 Monat alt',
		'coverage.tableView': 'Als Tabelle',
		'coverage.chartView': 'Als Diagramm',
		'coverage.colDocument': 'Stelle',
		'coverage.colCount': 'Fragen',
		'coverage.colTriage': 'Ursache',
		'coverage.noPeople': 'Keine Auswertung nach Person, Rolle oder Team.',
		'coverage.noPeopleWhy':
			'Wer wie oft fragt, ist eine Leistungsaufzeichnung. Dieses Produkt braucht sie nicht, also erhebt es sie nicht.',

		'knowledge.title': 'Was der Assistent jetzt kann',
		'knowledge.lede':
			'Jede Antwort, die eine Schichtleitung geschrieben hat, mit Herkunft und Prüfstand. Genau das, was ein Audit sehen will.',
		'knowledge.served': '{n} mal ausgeliefert',
		'knowledge.servedOne': '1 mal ausgeliefert',
		'knowledge.verifiedBy': 'Geprüft von',
		'knowledge.published': 'Veröffentlicht',
		'knowledge.patches': 'Ersetzt',
		'knowledge.languages': 'Verfügbar auf',
		'knowledge.review.current': 'Aktuell',
		'knowledge.review.due': 'Prüfung fällig',
		'knowledge.review.superseded': 'Ersetzt',
		'knowledge.export': 'Export für Audit',
		'knowledge.exportNote':
			'Gefiltert, mit Zeitstempel, herunterladbar. Im Prototyp nicht angeschlossen.',
		'knowledge.filterReview': 'Stand',

		'time.minutes': '{n} Min',
		'time.hours': '{n} Std',
		'time.hoursMinutes': '{h} Std {m} Min',
		'time.days': '{n} Tage'
	},

	ro: {
		'office.title': 'Șef de tură',
		'office.plant': 'Werk Nord',
		'nav.queue': 'Deschise',
		'nav.coverage': 'Lipsuri',
		'nav.knowledge': 'Cunoștințe',
		'nav.label': 'Secțiuni',
		'nav.toFloor': 'Către vederea de pe aparat',
		'nav.waitingCount': '{n} așteaptă răspuns',

		'queue.title': 'Întrebări deschise',
		'queue.lede':
			'Cele mai vechi primele. Fiecare rând este cineva care așteaptă acum, nu o cifră despre o persoană.',
		'queue.empty.title': 'Nimic deschis.',
		'queue.empty.body': 'Totul are răspuns. Următoarea întrebare apare aici.',
		'queue.waitingFor': 'așteaptă de',
		'queue.alsoWaiting': 'Încă {n} persoane așteaptă același răspuns',
		'queue.alsoWaitingOne': 'Încă 1 persoană așteaptă același răspuns',
		'queue.tried': 'Asta am încercat deja',
		'queue.searched': 'Căutat în',
		'queue.askedIn': 'Întrebat în {lang}',
		'queue.answer': 'Răspunde',
		'queue.selected': 'Selectat',
		'queue.outcome.no-source': 'Nicio sursă găsită',
		'queue.outcome.partial': 'Sursele se contrazic',
		'queue.outcome.refused-safety': 'Reținut din motive de siguranță',
		'queue.shift.early': 'Tura de dimineață',
		'queue.shift.late': 'Tura de după-amiază',
		'queue.shift.night': 'Tura de noapte',
		'queue.filterShift': 'Tură',
		'queue.filterLine': 'Linie',
		'queue.filterAll': 'Toate',
		'queue.noMatch': 'Nicio întrebare nu se potrivește cu acest filtru.',

		'triage.documentation': 'Documentație',
		'triage.machine': 'Tehnic',
		'triage.people': 'Instruire',
		'triage.documentation.action': 'Rescrie secțiunea',
		'triage.machine.action': 'Către mentenanță',
		'triage.people.action': 'Predă către Genius',
		'triage.documentation.why': 'Manualul nu explică. Asta poți repara.',
		'triage.machine.why': 'Mașina face aceeași eroare din nou. Nu e o problemă de documentație.',
		'triage.people.why': 'Manualul există. Instruirea lipsește.',

		'composer.title': 'Scrie răspunsul',
		'composer.forQuestion': 'Răspuns la',
		'composer.reply': 'Răspunsul tău',
		'composer.replyHint':
			'Propoziții scurte. Se traduce în fiecare limbă de care e nevoie pe linie.',
		'composer.safety': 'Nivel de siguranță',
		'composer.safety.none': 'Normal',
		'composer.safety.caution': 'Atenție, echipament de protecție sau verificare',
		'composer.safety.stop': 'Doar de către un specialist',
		'composer.attached': 'Atașat',
		'composer.patches': 'Înlocuiește secțiunea',
		'composer.patchesNone': 'Nicio secțiune selectată',
		'composer.publish': 'Publică',
		'composer.cancel': 'Anulează',
		'composer.reach': 'Ajunge la {n} persoane care așteaptă acum.',
		'composer.reachOne': 'Ajunge la 1 persoană care așteaptă acum.',
		'composer.becomesKnowledge':
			'După asta, asistentul răspunde singur la această întrebare, imediat și în limba celui care întreabă.',
		'composer.published': 'Publicat',
		'composer.publishedBody':
			'{name} primește răspunsul acum. Salvat ca înregistrare {ref} și verificat de tine.',
		'composer.next': 'Următoarea întrebare',
		'composer.empty': 'Alege o întrebare din stânga.',
		'composer.emptyBody': 'Răspunsul pe care îl scrii se scrie o dată și apoi se împarte.',
		'composer.handoff.machine':
			'Asta e o problemă tehnică. Un răspuns ajută azi persoana care întreabă, dar nu rezolvă cauza.',
		'composer.handoff.people':
			'Asta e o lipsă de instruire. Un răspuns ajută azi, instruirea ține de Genius.',

		'coverage.title': 'Unde documentația nu ajunge',
		'coverage.lede':
			'Ordonat după ce poți repara. Această vedere nu ajunge niciodată la o persoană anume, și asta e o decizie, nu o funcție lipsă.',
		'coverage.period': 'Ultimele 6 săptămâni',
		'coverage.byTriage': 'După cauză',
		'coverage.unanswered': 'Întrebări fără răspuns',
		'coverage.suppressed': 'Prea puține pentru a fi arătate',
		'coverage.suppressedWhy':
			'Sub {n} evenimente, această vedere nu arată o cifră. La numere mici, un grup devine repede o persoană.',
		'coverage.trend': 'Evoluție',
		'coverage.trendTooFew': 'Prea puține date pentru o evoluție.',
		'coverage.sourceAge': 'Sursă veche de {n} luni',
		'coverage.sourceAgeOne': 'Sursă veche de 1 lună',
		'coverage.tableView': 'Ca tabel',
		'coverage.chartView': 'Ca grafic',
		'coverage.colDocument': 'Loc',
		'coverage.colCount': 'Întrebări',
		'coverage.colTriage': 'Cauză',
		'coverage.noPeople': 'Fără analiză pe persoană, rol sau echipă.',
		'coverage.noPeopleWhy':
			'Cine întreabă și cât de des este o evidență de performanță. Produsul nu are nevoie de ea, deci nu o colectează.',

		'knowledge.title': 'Ce poate acum asistentul',
		'knowledge.lede':
			'Fiecare răspuns scris de un șef de tură, cu proveniență și stare de verificare. Exact ce cere un audit.',
		'knowledge.served': 'Livrat de {n} ori',
		'knowledge.servedOne': 'Livrat o dată',
		'knowledge.verifiedBy': 'Verificat de',
		'knowledge.published': 'Publicat',
		'knowledge.patches': 'Înlocuiește',
		'knowledge.languages': 'Disponibil în',
		'knowledge.review.current': 'Actual',
		'knowledge.review.due': 'Verificare necesară',
		'knowledge.review.superseded': 'Înlocuit',
		'knowledge.export': 'Export pentru audit',
		'knowledge.exportNote': 'Filtrat, cu marcaj de timp, descărcabil. Neconectat în prototip.',
		'knowledge.filterReview': 'Stare',

		'time.minutes': '{n} min',
		'time.hours': '{n} h',
		'time.hoursMinutes': '{h} h {m} min',
		'time.days': '{n} zile'
	},

	en: {
		'office.title': 'Shift lead',
		'office.plant': 'Werk Nord',
		'nav.queue': 'Open',
		'nav.coverage': 'Gaps',
		'nav.knowledge': 'Knowledge',
		'nav.label': 'Sections',
		'nav.toFloor': 'To the device view',
		'nav.waitingCount': '{n} waiting on an answer',

		'queue.title': 'Open questions',
		'queue.lede':
			'Oldest first. Every row is someone waiting right now, not a statistic about a person.',
		'queue.empty.title': 'Nothing open.',
		'queue.empty.body': 'All answered. The next question lands here.',
		'queue.waitingFor': 'waiting',
		'queue.alsoWaiting': '{n} more people waiting on the same answer',
		'queue.alsoWaitingOne': '1 more person waiting on the same answer',
		'queue.tried': "What I already tried",
		'queue.searched': 'Searched',
		'queue.askedIn': 'Asked in {lang}',
		'queue.answer': 'Answer',
		'queue.selected': 'Selected',
		'queue.outcome.no-source': 'No source found',
		'queue.outcome.partial': 'Sources contradict each other',
		'queue.outcome.refused-safety': 'Withheld for safety',
		'queue.shift.early': 'Early shift',
		'queue.shift.late': 'Late shift',
		'queue.shift.night': 'Night shift',
		'queue.filterShift': 'Shift',
		'queue.filterLine': 'Line',
		'queue.filterAll': 'All',
		'queue.noMatch': 'No question matches this filter.',

		'triage.documentation': 'Documentation',
		'triage.machine': 'Engineering',
		'triage.people': 'Training',
		'triage.documentation.action': 'Rewrite the section',
		'triage.machine.action': 'Hand to maintenance',
		'triage.people.action': 'Hand to Genius',
		'triage.documentation.why': 'The manual does not explain it. This one you can fix.',
		'triage.machine.why': 'The machine keeps making the same fault. Not a documentation problem.',
		'triage.people.why': 'The manual is there. The induction is not.',

		'composer.title': 'Write the answer',
		'composer.forQuestion': 'Answering',
		'composer.reply': 'Your answer',
		'composer.replyHint':
			'Short sentences. This gets translated into every language the line needs.',
		'composer.safety': 'Safety level',
		'composer.safety.none': 'Normal',
		'composer.safety.caution': 'Caution, protective equipment or a check first',
		'composer.safety.stop': 'Qualified person only',
		'composer.attached': 'Attached',
		'composer.patches': 'Replaces section',
		'composer.patchesNone': 'No section selected',
		'composer.publish': 'Publish',
		'composer.cancel': 'Cancel',
		'composer.reach': 'Reaches {n} people who are waiting right now.',
		'composer.reachOne': 'Reaches 1 person who is waiting right now.',
		'composer.becomesKnowledge':
			"After this the assistant answers this one itself, instantly, in the asker's language.",
		'composer.published': 'Published',
		'composer.publishedBody':
			'{name} gets the answer now. Saved as knowledge entry {ref} and verified by you.',
		'composer.next': 'Next question',
		'composer.empty': 'Pick a question on the left.',
		'composer.emptyBody': 'The answer you write gets written once and shared after that.',
		'composer.handoff.machine':
			'This is an engineering problem. An answer helps the person asking today, but it does not fix the cause.',
		'composer.handoff.people':
			'This is a training gap. An answer helps today; the induction belongs in Genius.',

		'coverage.title': 'Where the documentation runs out',
		'coverage.lede':
			'Sorted by what you can fix. This view never resolves to an individual, and that is a decision rather than a missing feature.',
		'coverage.period': 'Last 6 weeks',
		'coverage.byTriage': 'By cause',
		'coverage.unanswered': 'Unanswered questions',
		'coverage.suppressed': 'Too few to show',
		'coverage.suppressedWhy':
			'Below {n} events this view shows no number. At small counts a group turns into a person.',
		'coverage.trend': 'Trend',
		'coverage.trendTooFew': 'Too little data for a trend.',
		'coverage.sourceAge': 'Source {n} months old',
		'coverage.sourceAgeOne': 'Source 1 month old',
		'coverage.tableView': 'As a table',
		'coverage.chartView': 'As a chart',
		'coverage.colDocument': 'Place',
		'coverage.colCount': 'Questions',
		'coverage.colTriage': 'Cause',
		'coverage.noPeople': 'No breakdown by person, role or team.',
		'coverage.noPeopleWhy':
			'Who asks and how often is a performance record. This product does not need one, so it does not collect one.',

		'knowledge.title': 'What the assistant can answer now',
		'knowledge.lede':
			'Every answer a shift lead has written, with its provenance and review state. Which is exactly what an audit asks for.',
		'knowledge.served': 'Served {n} times',
		'knowledge.servedOne': 'Served once',
		'knowledge.verifiedBy': 'Verified by',
		'knowledge.published': 'Published',
		'knowledge.patches': 'Replaces',
		'knowledge.languages': 'Available in',
		'knowledge.review.current': 'Current',
		'knowledge.review.due': 'Review due',
		'knowledge.review.superseded': 'Superseded',
		'knowledge.export': 'Export for audit',
		'knowledge.exportNote': 'Filtered, timestamped, downloadable. Not wired up in the prototype.',
		'knowledge.filterReview': 'State',

		'time.minutes': '{n} min',
		'time.hours': '{n} h',
		'time.hoursMinutes': '{h} h {m} min',
		'time.days': '{n} days'
	}
} as const satisfies Record<Language, Record<string, string>>;

export type OfficeKey = keyof (typeof OFFICE)['de'];

/**
 * Office copy, falling back to the floor dictionary.
 *
 * Reads `session.language`, so any template expression calling it re-runs when
 * the language changes. Same contract as `t()`, no store subscription.
 */
export function tOffice(key: OfficeKey | StringKey, vars?: Record<string, string | number>): string {
	const dict: Record<string, string> = OFFICE[session.language];
	if (!(key in dict)) return t(key as StringKey, vars);

	let value = dict[key];
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			value = value.replace(`{${k}}`, String(v));
		}
	}
	return value;
}

/**
 * How long someone has been waiting, in words.
 *
 * Built from whole `t()` keys rather than by gluing a number to a unit string,
 * because word order is not universal and concatenation is how a translation
 * layer starts producing sentences nobody wrote. See docs/rules/content.md.
 */
export function waitLabel(iso: string, now: Date = new Date('2026-08-16T09:12:00Z')): string {
	const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
	if (minutes < 60) return tOffice('time.minutes', { n: minutes });

	const hours = Math.floor(minutes / 60);
	if (hours >= 24) return tOffice('time.days', { n: Math.floor(hours / 24) });

	const rest = minutes % 60;
	return rest === 0
		? tOffice('time.hours', { n: hours })
		: tOffice('time.hoursMinutes', { h: hours, m: rest });
}

/**
 * Dates are ISO everywhere, in every locale.
 *
 * Not a shortcut. A German reader writes 16.08.2026 and a Romanian reader writes
 * 16.08.2026 too, but an audit export read by both plus a Dutch auditor needs one
 * unambiguous form, and 2026-08-16 is the only one that cannot be misread as a
 * day-month swap. Locale formatting applies to numbers, not to this.
 */
export function isoDate(value: string): string {
	return value.slice(0, 10);
}
