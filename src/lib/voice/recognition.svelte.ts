import type { Language } from '$lib/domain/types';

/**
 * Voice input with a deliberate fallback.
 *
 * `live`:     real microphone. Web Speech API for words, an AnalyserNode for
 *             level and ambient-noise measurement.
 * `scripted`: replays a known utterance at realistic speed with synthesised
 *             level data.
 * `auto`:     live if the browser supports it and the mic is granted, scripted
 *             otherwise.
 *
 * WHY SCRIPTED MODE EXISTS, and why it is not cheating: the recogniser is the one
 * part of this prototype whose real-world behaviour I cannot honestly simulate.
 * It degrades badly with accents and background noise, which is precisely the
 * condition this product ships into. Scripted mode lets the *interaction design*
 * be evaluated without a demo hanging on whether a laptop mic can parse a
 * Romanian-accented German fault code in a meeting room. Live mode is the default
 * wherever it works.
 */

const RECOGNITION_LANG: Record<Language, string> = {
	de: 'de-DE',
	ro: 'ro-RO',
	en: 'en-GB'
};

/** Above this RMS the room is loud enough to threaten recognition. */
const NOISE_THRESHOLD = 0.14;

export class Recognition {
	supported = $state(false);
	mode = $state<'live' | 'scripted'>('scripted');
	listening = $state(false);
	transcript = $state('');
	/** Words the recogniser was unsure of. Drives the confirm step. */
	uncertain = $state<string[]>([]);
	level = $state(0);
	noisy = $state(false);
	error = $state<string | null>(null);

	#recognition: SpeechRecognition | null = null;
	#stream: MediaStream | null = null;
	#audio: AudioContext | null = null;
	#analyser: AnalyserNode | null = null;
	#raf = 0;
	#timers: ReturnType<typeof setTimeout>[] = [];

	/** Call once on mount. */
	detect() {
		if (typeof window === 'undefined') return;
		const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
		this.supported = Boolean(Ctor);
		if (this.supported) this.mode = 'live';
	}

	async start(language: Language, script: { text: string; uncertain?: string[] }) {
		this.transcript = '';
		this.uncertain = [];
		this.error = null;
		this.listening = true;

		if (this.mode === 'live' && this.supported) {
			const ok = await this.#startLive(language);
			if (ok) return;
			// Falling back rather than failing: a denied mic must not dead-end the
			// worker, which is the same reason the UI always offers "type instead".
			this.mode = 'scripted';
		}

		this.#startScripted(script);
	}

	stop() {
		this.listening = false;
		this.#recognition?.stop();
		this.#teardownAudio();
		this.#clearTimers();
		this.level = 0;
	}

	async #startLive(language: Language): Promise<boolean> {
		try {
			this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			this.error = 'mic-denied';
			return false;
		}

		this.#audio = new AudioContext();
		this.#analyser = this.#audio.createAnalyser();
		this.#analyser.fftSize = 512;
		this.#audio.createMediaStreamSource(this.#stream).connect(this.#analyser);
		this.#meter();

		const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
		if (!Ctor) return false;

		const rec = new Ctor();
		rec.lang = RECOGNITION_LANG[language];
		rec.interimResults = true;
		rec.continuous = true;
		rec.maxAlternatives = 1;

		rec.onresult = (event) => {
			let text = '';
			const unsure: string[] = [];
			for (let i = 0; i < event.results.length; i++) {
				const result = event.results[i];
				const alt = result[0];
				text += alt.transcript;
				// Low-confidence finals are surfaced for confirmation rather than
				// silently accepted.
				if (result.isFinal && alt.confidence > 0 && alt.confidence < 0.75) {
					unsure.push(...alt.transcript.trim().split(/\s+/));
				}
			}
			this.transcript = text.trim();
			this.uncertain = unsure;
		};

		rec.onerror = (event) => {
			this.error = event.error;
		};

		rec.onend = () => {
			if (this.listening) this.listening = false;
		};

		this.#recognition = rec;
		rec.start();
		return true;
	}

	#meter() {
		if (!this.#analyser) return;
		const buffer = new Uint8Array(this.#analyser.frequencyBinCount);
		let baselineSamples: number[] = [];

		const tick = () => {
			if (!this.#analyser) return;
			this.#analyser.getByteTimeDomainData(buffer);

			let sum = 0;
			for (const v of buffer) {
				const centred = (v - 128) / 128;
				sum += centred * centred;
			}
			const rms = Math.sqrt(sum / buffer.length);
			this.level = Math.min(1, rms * 4);

			// The first ~30 frames establish the room's noise floor. A loud floor is
			// reported to the UI so it can offer the text path before recognition
			// fails, rather than after.
			if (baselineSamples.length < 30) {
				baselineSamples.push(rms);
				if (baselineSamples.length === 30) {
					const floor = baselineSamples.reduce((a, b) => a + b, 0) / 30;
					this.noisy = floor > NOISE_THRESHOLD;
				}
			}

			this.#raf = requestAnimationFrame(tick);
		};
		tick();
	}

	/** Reveals a known utterance word by word, with plausible level movement. */
	#startScripted(script: { text: string; uncertain?: string[] }) {
		const words = script.text.split(' ');
		const perWord = 260;

		words.forEach((_, i) => {
			this.#timers.push(
				setTimeout(() => {
					this.transcript = words.slice(0, i + 1).join(' ');
					this.level = 0.35 + Math.random() * 0.5;
				}, i * perWord)
			);
		});

		this.#timers.push(
			setTimeout(
				() => {
					this.uncertain = script.uncertain ?? [];
					this.level = 0;
					this.listening = false;
				},
				words.length * perWord + 200
			)
		);
	}

	#teardownAudio() {
		cancelAnimationFrame(this.#raf);
		this.#stream?.getTracks().forEach((t) => t.stop());
		void this.#audio?.close();
		this.#stream = null;
		this.#audio = null;
		this.#analyser = null;
	}

	#clearTimers() {
		this.#timers.forEach(clearTimeout);
		this.#timers = [];
	}
}

export const recognition = new Recognition();

/**
 * Read-aloud. Uses the platform voice, no network round trip, so it still works
 * when the plant's wifi drops in the cold store.
 */
export function speak(text: string, language: Language, onend?: () => void) {
	if (typeof speechSynthesis === 'undefined') return;
	speechSynthesis.cancel();
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = RECOGNITION_LANG[language];
	utterance.rate = 0.95;
	if (onend) utterance.onend = onend;
	speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
	if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
