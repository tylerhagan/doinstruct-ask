/**
 * Domain model for doinstruct Ask.
 *
 * AGENTS: these types are the contract between the data layer and every
 * component. If you are asked to add a field, add it here first. Components
 * must never invent shape.
 */

export type Language = 'de' | 'ro' | 'en';

/** Content that varies by language. Contrast with identifiers, see below. */
export type Localised = Record<Language, string>;

/**
 * IDENTIFIERS ARE NEVER LOCALISED.
 *
 * Machine names, asset IDs, fault codes, document titles and section references
 * stay in the plant's language in every locale, because the worker has to match
 * them against a nameplate, an HMI screen or a manual on a shelf. Translating
 * "Füller F2" into Romanian means the screen and the machine disagree, and the
 * worst case is someone working on the wrong machine.
 *
 * Descriptors are localised. A job title tells a worker whether this person can
 * help them, and it is not printed on anything.
 */
export type Identifier = string;

/** The languages this build's content exists in. The picker takes a list. */
export const LANGUAGES: Language[] = ['de', 'ro', 'en'];

export const LANGUAGE_LABEL: Record<Language, string> = {
	de: 'Deutsch',
	ro: 'Română',
	en: 'English'
};

/**
 * Safety level is deliberately three-valued, not boolean.
 *
 * - `none`   : routine, the worker may act on the answer
 * - `caution`: the worker may act, but PPE / verification is required first
 * - `stop`   : the assistant must NOT give a procedure; a qualified person is
 *               required. This is a refusal, not a low-confidence answer.
 */
export type SafetyLevel = 'none' | 'caution' | 'stop';

/**
 * Provenance is mandatory on every answer. An unsourced answer about a machine
 * is a liability, not a feature. doinstruct sells audit trails.
 */
export interface Source {
	id: string;
	/** Document title, as printed on the physical manual the worker may hold. */
	document: string;
	/** Section reference, e.g. "§4.2 Fehlercode E-212". */
	section: string;
	page: number;
	/** Language of the SOURCE, which routinely differs from the answer language. */
	language: Language;
	/** ISO date. Stale documentation is a real hazard, so this is always shown. */
	updatedAt: string;
}

/**
 * - `sourced`: grounded in documentation, quotable in an audit
 * - `partial`: assembled from related material; verify before acting
 * - `none`   : the miss. Do not paper over it; route to a human.
 */
export type AnswerConfidence = 'sourced' | 'partial' | 'none';

export interface ProcedureStep {
	n: number;
	text: string;
	safety?: SafetyLevel;
}

export interface Answer {
	id: string;
	question: string;
	/** One sentence. Read aloud first, before any steps. */
	summary: string;
	steps: ProcedureStep[];
	sources: Source[];
	confidence: AnswerConfidence;
	safety: SafetyLevel;
	/** Required when safety is 'caution' or 'stop'. */
	safetyNote?: string;
}

/** A named human. Never "a supervisor". Trust requires a name and a face. */
export interface Responder {
	id: string;
	/** A person's name is an identifier. Never transliterated. */
	name: Identifier;
	/** A descriptor, so it is localised. It tells the worker who they are getting. */
	role: Localised;
	/** Matches the signage on the floor, so it stays as painted. */
	line: Identifier;
	/** Observed, not promised. Sets an honest expectation for the wait. */
	typicalResponseMinutes: number;
	languages: Language[];
	onShift: boolean;
}

/**
 * Why the assistant handed this to a person.
 *
 * - `no-source`: nothing in the corpus covered it. The original miss.
 * - `needs-identity`: it could be answered, but only for someone the system can
 *   name, and this product deliberately cannot name anyone. A holiday balance
 *   is not missing knowledge, it is knowledge that belongs to one person.
 *
 * The distinction matters because the two read completely differently to a
 * worker. "Nobody wrote this down" is the documentation's failure. "I will not
 * guess at your pay" is the product working as designed, and saying so is what
 * keeps the refusal from feeling like a shrug.
 */
export type EscalationReason = 'no-source' | 'needs-identity';

export interface Escalation {
	id: string;
	question: string;
	/** Defaults to `no-source` where absent, which is the original behaviour. */
	reason?: EscalationReason;
	responder: Responder;
	askedAt: string;
	status: 'waiting' | 'answered';
	/** Present once answered. This is what becomes new knowledge. */
	reply?: string;
	/** Emitted on capture. Ties the loop back to the compliance product. */
	auditRef?: string;
}

/** Machine context, resolved from the wall mount or a QR/NFC tap, never typed. */
export interface MachineContext {
	line: string;
	machine: string;
	assetId: string;
	faultCode?: string;
}
