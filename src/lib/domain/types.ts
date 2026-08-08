/**
 * Domain model for doinstruct Ask.
 *
 * AGENTS: these types are the contract between the data layer and every
 * component. If you are asked to add a field, add it here first. Components
 * must never invent shape.
 */

export type Language = 'de' | 'ro' | 'en';

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
	name: string;
	role: string;
	line: string;
	/** Observed, not promised. Sets an honest expectation for the wait. */
	typicalResponseMinutes: number;
	languages: Language[];
	onShift: boolean;
}

export interface Escalation {
	id: string;
	question: string;
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
