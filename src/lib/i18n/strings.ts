import { session } from '$lib/state/session.svelte';
import type { Language } from '$lib/domain/types';

/**
 * UI copy, three languages.
 *
 * AGENTS: never write a user-facing string literal into a component. Add a key
 * here with all three translations and call `t('key')`. A German-only string is
 * a defect in this product, not a placeholder. 35+ languages is doinstruct's
 * core identity and roughly half of a German food-production line does not read
 * German comfortably.
 *
 * Note on tone: German copy is deliberately in the informal "du". These are
 * colleagues on a line, not customers, and "Sie" reads as management talking at
 * them. Romanian follows with the informal "tu".
 */

const DICT = {
	de: {
		'ptt.idle': 'Halt gedrückt und frag',
		'ptt.listening': 'Ich höre …',
		'ptt.thinking': 'Einen Moment …',
		'ptt.noisy': 'Sehr laut hier. Halte das Gerät näher, oder tippe deine Frage.',
		'confirm.heard': 'Ich habe verstanden:',
		'confirm.unsure': 'Bei den markierten Wörtern bin ich unsicher.',
		'confirm.yes': 'Ja, genau das',
		'confirm.again': 'Nochmal sagen',
		'confirm.type': 'Tippen',
		'answer.sourced': 'Aus dem Handbuch',
		'answer.partial': 'Zusammengestellt, bitte prüfen',
		'answer.source': 'Quelle',
		'answer.read': 'Vorlesen',
		'answer.readStop': 'Vorlesen stoppen',
		'answer.noHelp': 'Hat nicht geholfen',
		'steps.ppe': 'Schutzausrüstung erforderlich',
		'steps.expert': 'Nur durch Fachkraft',
		'source.page': 'S.',
		'source.from': 'aus',
		'source.daysOld': 'Tage alt',
		'source.monthsOld': 'Monate alt',
		'esc.notFound': 'Das steht in keiner Anleitung. Ich habe deine Frage weitergegeben an',
		'esc.replies': 'Antwortet normalerweise in ~{n} Min.',
		'esc.onShift': 'Ist gerade in der Schicht.',
		'esc.offShift': 'Ist nicht in der Schicht. Ich frage den Nächsten.',
		'esc.speaks': 'Spricht {lang}.',
		'esc.notify': 'Sag mir Bescheid, ich arbeite weiter',
		'esc.saved':
			'Gespeichert. Wer das nächste Mal fragt, bekommt die Antwort sofort, in seiner Sprache.',
		'esc.entry': 'Wissenseintrag {ref} · geprüft von {name}',
		'esc.ok': 'Verstanden',
		'status.offline': 'Offline',
		'status.contrast': 'Hoher Kontrast',
		'status.language': 'Sprache',
		'handover.cta': 'Für die nächste Schicht notieren',
		'handover.title': 'Das wird an die nächste Schicht übergeben:',
		'handover.confirm': 'Übergeben',
		'flow.newQuestion': 'Neue Frage',
		'flow.back': 'Zurück',
		'standby.fault': 'Fehler',
		'standby.hint': 'Kein Login. Kein Download. Halt die Taste und frag.'
	},

	ro: {
		'ptt.idle': 'Ține apăsat și întreabă',
		'ptt.listening': 'Te ascult …',
		'ptt.thinking': 'O clipă …',
		'ptt.noisy': 'E foarte zgomotos. Ține aparatul mai aproape, sau scrie întrebarea.',
		'confirm.heard': 'Am înțeles:',
		'confirm.unsure': 'Nu sunt sigur de cuvintele marcate.',
		'confirm.yes': 'Da, exact',
		'confirm.again': 'Spune din nou',
		'confirm.type': 'Scrie',
		'answer.sourced': 'Din manual',
		'answer.partial': 'Compilat, te rog verifică',
		'answer.source': 'Sursa',
		'answer.read': 'Citește cu voce tare',
		'answer.readStop': 'Oprește citirea',
		'answer.noHelp': 'Nu m-a ajutat',
		'steps.ppe': 'Echipament de protecție necesar',
		'steps.expert': 'Doar de către un specialist',
		'source.page': 'p.',
		'source.from': 'din',
		'source.daysOld': 'zile vechime',
		'source.monthsOld': 'luni vechime',
		'esc.notFound': 'Asta nu apare în niciun manual. Am trimis întrebarea ta către',
		'esc.replies': 'Răspunde de obicei în ~{n} min.',
		'esc.onShift': 'Este acum în tură.',
		'esc.offShift': 'Nu este în tură. Întreb pe următorul.',
		'esc.speaks': 'Vorbește {lang}.',
		'esc.notify': 'Anunță-mă, continui lucrul',
		'esc.saved': 'Salvat. Următorul care întreabă primește răspunsul imediat, în limba lui.',
		'esc.entry': 'Înregistrare {ref} · verificat de {name}',
		'esc.ok': 'Am înțeles',
		'status.offline': 'Fără conexiune',
		'status.contrast': 'Contrast ridicat',
		'status.language': 'Limbă',
		'handover.cta': 'Notează pentru tura următoare',
		'handover.title': 'Asta se predă turei următoare:',
		'handover.confirm': 'Predă',
		'flow.newQuestion': 'Întrebare nouă',
		'flow.back': 'Înapoi',
		'standby.fault': 'Eroare',
		'standby.hint': 'Fără cont. Fără instalare. Ține apăsat și întreabă.'
	},

	en: {
		'ptt.idle': 'Hold and ask',
		'ptt.listening': 'Listening …',
		'ptt.thinking': 'One moment …',
		'ptt.noisy': "It's very loud here. Hold the device closer, or type your question.",
		'confirm.heard': 'I heard:',
		'confirm.unsure': "I'm unsure about the marked words.",
		'confirm.yes': "Yes, that's it",
		'confirm.again': 'Say it again',
		'confirm.type': 'Type',
		'answer.sourced': 'From the manual',
		'answer.partial': 'Assembled, please verify',
		'answer.source': 'Source',
		'answer.read': 'Read aloud',
		'answer.readStop': 'Stop reading',
		'answer.noHelp': "This didn't help",
		'steps.ppe': 'Protective equipment required',
		'steps.expert': 'Qualified person only',
		'source.page': 'p.',
		'source.from': 'from',
		'source.daysOld': 'days old',
		'source.monthsOld': 'months old',
		'esc.notFound': "That isn't in any manual. I've passed your question to",
		'esc.replies': 'Usually replies in ~{n} min.',
		'esc.onShift': 'On shift right now.',
		'esc.offShift': 'Not on shift. Asking the next person.',
		'esc.speaks': 'Speaks {lang}.',
		'esc.notify': "Let me know, I'll keep working",
		'esc.saved': 'Saved. The next person who asks gets it instantly, in their language.',
		'esc.entry': 'Knowledge entry {ref} · verified by {name}',
		'esc.ok': 'Got it',
		'status.offline': 'Offline',
		'status.contrast': 'High contrast',
		'status.language': 'Language',
		'handover.cta': 'Note for the next shift',
		'handover.title': 'This will be handed to the next shift:',
		'handover.confirm': 'Hand over',
		'flow.newQuestion': 'New question',
		'flow.back': 'Back',
		'standby.fault': 'Fault',
		'standby.hint': 'No login. No download. Hold the button and ask.'
	}
} as const satisfies Record<Language, Record<string, string>>;

export type StringKey = keyof (typeof DICT)['de'];

/**
 * Reads `session.language`, so any template expression calling `t()` re-runs
 * when the worker switches language. No store subscription required.
 */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
	let value: string = DICT[session.language][key];
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			value = value.replace(`{${k}}`, String(v));
		}
	}
	return value;
}
