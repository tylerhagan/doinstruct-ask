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

export const DICT = {
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
		'esc.needsIdentity':
			'Das kann ich nur für dich persönlich beantworten, und ich weiß nicht, wer du bist. Ich habe deine Frage weitergegeben an',
		'esc.needsIdentityWhy':
			'Kein Login heißt: niemand kann mitlesen, was du fragst. Der Preis ist, dass ich deine persönlichen Daten nicht sehe.',
		'esc.policy': 'Das gilt für alle:',
		'esc.replies': 'Antwortet normalerweise in ~{n} Min.',
		'esc.onShift': 'Ist gerade in der Schicht.',
		'esc.offShift': 'Ist nicht in der Schicht. Ich frage den Nächsten.',
		'esc.speaks': 'Spricht {lang}.',
		'esc.notify': 'Sag mir Bescheid, ich arbeite weiter',
		// Credits the worker before the system. This is the emotional peak of the
		// flow, and the end of an interaction is what gets remembered.
		'esc.saved':
			'Deine Frage hat das Handbuch verbessert. Wer das nächste Mal fragt, bekommt die Antwort sofort, in seiner Sprache.',
		'esc.entry': 'Wissenseintrag {ref} · geprüft von {name}',
		'esc.ok': 'Verstanden',
		'machine.unknown': 'Keine Maschine erkannt',
		'machine.unknownBody':
			'Der Code {id} steht in keinem Register. Frag trotzdem, ich weiß dann nur nicht, an welcher Maschine du stehst.',
		'machine.none': 'Ohne Maschine',
		'status.offline': 'Offline',
		'status.contrast': 'Hoher Kontrast',
		'status.contrastShort': 'Kontrast',
		'status.language': 'Sprache',
		'status.changeLanguage': 'Sprache ändern',
		'handover.cta': 'Für die nächste Schicht notieren',
		'handover.title': 'Das wird an die nächste Schicht übergeben:',
		'handover.confirm': 'Übergeben',
		'flow.newQuestion': 'Neue Frage',
		'flow.back': 'Zurück',
		'standby.fault': 'Fehler',
		'standby.hint': 'Kein Login. Kein Download. Halt die Taste und frag.',
		'a11y.answer': 'Antwort',
		'a11y.sources': 'Quellen',
		'a11y.level': 'Eingangspegel',
		'a11y.heard': 'Erkannte Frage'
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
		'esc.needsIdentity':
			'Asta pot răspunde doar personal pentru tine, și nu știu cine ești. Am trimis întrebarea ta către',
		'esc.needsIdentityWhy':
			'Fără cont înseamnă că nimeni nu vede ce întrebi. Prețul este că nu văd datele tale personale.',
		'esc.policy': 'Asta este valabil pentru toți:',
		'esc.replies': 'Răspunde de obicei în ~{n} min.',
		'esc.onShift': 'Este acum în tură.',
		'esc.offShift': 'Nu este în tură. Întreb pe următorul.',
		'esc.speaks': 'Vorbește {lang}.',
		'esc.notify': 'Anunță-mă, continui lucrul',
		'esc.saved':
			'Întrebarea ta a îmbunătățit manualul. Următorul care întreabă primește răspunsul imediat, în limba lui.',
		'esc.entry': 'Înregistrare {ref} · verificat de {name}',
		'esc.ok': 'Am înțeles',
		'machine.unknown': 'Nicio mașină recunoscută',
		'machine.unknownBody':
			'Codul {id} nu apare în niciun registru. Întreabă oricum, doar că nu știu la ce mașină ești.',
		'machine.none': 'Fără mașină',
		'status.offline': 'Fără conexiune',
		'status.contrast': 'Contrast ridicat',
		'status.contrastShort': 'Contrast',
		'status.language': 'Limbă',
		'status.changeLanguage': 'Schimbă limba',
		'handover.cta': 'Notează pentru tura următoare',
		'handover.title': 'Asta se predă turei următoare:',
		'handover.confirm': 'Predă',
		'flow.newQuestion': 'Întrebare nouă',
		'flow.back': 'Înapoi',
		'standby.fault': 'Eroare',
		'standby.hint': 'Fără cont. Fără instalare. Ține apăsat și întreabă.',
		'a11y.answer': 'Răspuns',
		'a11y.sources': 'Surse',
		'a11y.level': 'Nivel de intrare',
		'a11y.heard': 'Întrebarea recunoscută'
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
		'esc.needsIdentity':
			'I can only answer that for you personally, and I do not know who you are. I have passed your question to',
		'esc.needsIdentityWhy':
			'No login means nobody can see what you ask. The price is that I cannot see your personal data either.',
		'esc.policy': 'This applies to everyone:',
		'esc.replies': 'Usually replies in ~{n} min.',
		'esc.onShift': 'On shift right now.',
		'esc.offShift': 'Not on shift. Asking the next person.',
		'esc.speaks': 'Speaks {lang}.',
		'esc.notify': "Let me know, I'll keep working",
		'esc.saved':
			'Your question just improved the manual. The next person who asks gets it instantly, in their language.',
		'esc.entry': 'Knowledge entry {ref} · verified by {name}',
		'esc.ok': 'Got it',
		'machine.unknown': 'No machine recognised',
		'machine.unknownBody':
			'The code {id} is not in any register. Ask anyway; I just will not know which machine you are standing at.',
		'machine.none': 'No machine',
		'status.offline': 'Offline',
		'status.contrast': 'High contrast',
		'status.contrastShort': 'Contrast',
		'status.language': 'Language',
		'status.changeLanguage': 'Change language',
		'handover.cta': 'Note for the next shift',
		'handover.title': 'This will be handed to the next shift:',
		'handover.confirm': 'Hand over',
		'flow.newQuestion': 'New question',
		'flow.back': 'Back',
		'standby.fault': 'Fault',
		'standby.hint': 'No login. No download. Hold the button and ask.',
		'a11y.answer': 'Answer',
		'a11y.sources': 'Sources',
		'a11y.level': 'Input level',
		'a11y.heard': 'Recognised question'
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
