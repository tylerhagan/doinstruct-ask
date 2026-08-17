/**
 * Domain model for the office surface.
 *
 * Separate from `types.ts` because the two surfaces have genuinely different
 * shapes, not because they are different apps. Anything both registers need
 * lives in `types.ts` and is imported here.
 *
 * AGENTS: read `docs/office-surface.md` before adding a field. Several obvious
 * fields are absent on purpose, and the absences are the design. In particular
 * there is no per-person history anywhere in this file, and adding one is not a
 * feature request you may satisfy.
 */

import type { Identifier, Language, Localised, SafetyLevel } from './types';

/**
 * What kind of problem is behind an unanswered question.
 *
 * The unit of triage is whatever a supervisor can actually fix. There are only
 * three fixable things, and each hands them a different next action:
 *
 * - `documentation`: the manual is unclear or absent. Rewrite the section.
 * - `machine`: the same fault keeps recurring. This is engineering's problem,
 *   not a documentation problem, and dressing it up as one wastes both.
 * - `people`: nobody was trained on this. Hand it to Genius, doinstruct's
 *   existing training product, rather than rebuilding it here.
 *
 * Flagged in `docs/office-surface.md` as reasoned rather than observed. It is
 * the first thing I would put in front of a real shift lead.
 */
export type TriageClass = 'documentation' | 'machine' | 'people';

/** Shift is a filter, never a grouping dimension. See the suppression note. */
export type Shift = 'early' | 'late' | 'night';

/**
 * What the assistant already tried before giving up.
 *
 * The queue shows this so the supervisor is not answering blind, and so they can
 * see whether the miss was the documentation's fault or the question's.
 */
export interface Attempt {
	/**
	 * - `no-source`: nothing in the corpus covered it
	 * - `partial`: related material existed but did not answer the question
	 * - `refused-safety`: the assistant had an answer and withheld it, because
	 *   the task requires a qualified person. This is a success, not a failure,
	 *   and the queue must not present it as one.
	 */
	outcome: 'no-source' | 'partial' | 'refused-safety';
	detail: Localised;
	/** Document titles the assistant searched. Identifiers, so never localised. */
	searched: Identifier[];
}

/**
 * One unanswered question, waiting on a human.
 *
 * `askedBy` is present here and it is the one place identity survives, because
 * you cannot deliver an answer to someone you cannot name. It is deliberately
 * not accumulated: nothing in this model records what a person has asked before,
 * and once an item is answered and delivered the link expires. "Ana is waiting
 * on an answer about Filler F2 right now" is a service queue. "Ana has asked 47
 * questions this quarter" is a competence record, and in Germany it is also a
 * works council negotiation under §87(1)(6) BetrVG.
 */
export interface QueueItem {
	id: string;
	/** The question as asked, in the language it was asked in. */
	question: Localised;
	askedIn: Language;
	/** Everything below is an identifier and stays as painted on the machine. */
	line: Identifier;
	machine: Identifier;
	assetId: Identifier;
	faultCode?: Identifier;
	shift: Shift;
	/** ISO timestamp. The queue sorts oldest first: waiting is the whole problem. */
	waitingSince: string;
	askedBy: { name: Identifier; role: Localised };
	/**
	 * How many other people are waiting on the same answer, as a count and never
	 * as names. Three people asking the same thing is a signal about the
	 * documentation, not about the three people.
	 */
	alsoWaiting: number;
	attempt: Attempt;
	triage: TriageClass;
	safety: SafetyLevel;
	/**
	 * What this question is about, as a stable key rather than as prose.
	 *
	 * It is how an answer published here becomes the answer a worker gets on the
	 * floor: the same topic identifies the question on both surfaces. Absent on
	 * fixtures that exist only to populate the queue.
	 */
	topic?: string;
}

/**
 * One row of the coverage analysis: a place the documentation fails.
 *
 * `count` is `null` when the bucket falls below the suppression threshold. That
 * is modelled as an absent value rather than a zero so a component cannot
 * accidentally render it as a number, and so the type system makes anyone
 * handling it think about the empty case.
 */
export interface CoverageBucket {
	id: string;
	triage: TriageClass;
	/** Document and section, asset and fault code, or role and topic. */
	label: Identifier;
	detail: Localised;
	/** `null` means suppressed: fewer than MIN_BUCKET events. */
	count: number | null;
	/** Weekly counts, oldest first. Empty when the bucket is suppressed. */
	trend: number[];
	/** Present for documentation gaps: how stale the source is, in months. */
	sourceAgeMonths?: number;
}

/**
 * Minimum events before a bucket may show a number.
 *
 * Aggregation only protects anonymity above a threshold. Slice by role and shift
 * in a plant with one night-shift electrician and you have named them. Five is
 * standard practice for employee analytics, it costs nothing, and it is the
 * difference between a system that is private by design and one that is private
 * by policy.
 */
export const MIN_BUCKET = 5;

/** Suppression happens here, once, so no component can forget to apply it. */
export function suppress(count: number): number | null {
	return count < MIN_BUCKET ? null : count;
}

/**
 * A captured answer, now part of what the assistant can answer.
 *
 * This is the record that plugs into the compliance business doinstruct already
 * sells, so every field here is one an auditor would ask for.
 */
export interface KnowledgeEntry {
	id: string;
	/** Audit reference, quoted back to the worker at the moment of capture. */
	ref: Identifier;
	question: Localised;
	answer: Localised;
	machine: Identifier;
	assetId: Identifier;
	faultCode?: Identifier;
	safety: SafetyLevel;
	/**
	 * Accountability for a safety instruction has to land on a named human, so
	 * this is the one identity the system keeps permanently. The responder chose
	 * to answer; the asker did not choose to be counted.
	 */
	verifiedBy: Identifier;
	verifiedRole: Localised;
	publishedAt: string;
	/** Languages it has been translated into. Serving is instant in all of them. */
	languages: Language[];
	/** Times served since publication. About the answer, never about who asked. */
	served: number;
	/**
	 * The document and section this entry patches, when there is one. A gap that
	 * gets patched twice is a section that should be rewritten instead.
	 */
	patches?: Identifier;
	review: 'current' | 'due' | 'superseded';
}

/** The four destinations, in order of urgency. */
export type OfficeView = 'queue' | 'coverage' | 'knowledge';
