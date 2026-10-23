export type SoundName =
	| "select"
	| "correct"
	| "wrong"
	| "complete"
	| "streak"
	| "birthday";

// Opening phrase of "Happy Birthday": [frequency in Hz, length in seconds].
const BIRTHDAY_TUNE: Array<[number, number]> = [
	[392, 0.22],
	[392, 0.14],
	[440, 0.34],
	[392, 0.34],
	[523.25, 0.34],
	[493.88, 0.7],
];

let audioContext: AudioContext | null = null;

export function playSound(name: SoundName, muted: boolean) {
	if (muted || typeof window === "undefined") return;

	try {
		const AudioContextClass =
			window.AudioContext ??
			(
				window as typeof window & {
					webkitAudioContext?: typeof AudioContext;
				}
			).webkitAudioContext;

		if (!AudioContextClass) return;

		audioContext ??= new AudioContextClass();

		if (audioContext.state === "suspended") {
			void audioContext.resume();
		}

		const notes: Record<SoundName, number[]> = {
			select: [440],
			correct: [523.25, 659.25, 783.99],
			wrong: [330, 246.94],
			complete: [523.25, 659.25, 783.99, 1046.5],
			streak: [659.25, 783.99, 987.77, 1318.51],
			birthday: [],
		};

		const context = audioContext;
		const start = context.currentTime;

		if (name === "birthday") {
			let cursor = start;
			for (const [frequency, length] of BIRTHDAY_TUNE) {
				const oscillator = context.createOscillator();
				const gain = context.createGain();
				oscillator.type = "triangle";
				oscillator.frequency.setValueAtTime(frequency, cursor);
				gain.gain.setValueAtTime(0.0001, cursor);
				gain.gain.exponentialRampToValueAtTime(0.1, cursor + 0.02);
				gain.gain.exponentialRampToValueAtTime(0.0001, cursor + length);
				oscillator.connect(gain);
				gain.connect(context.destination);
				oscillator.start(cursor);
				oscillator.stop(cursor + length);
				cursor += length;
			}
			return;
		}

		notes[name].forEach((frequency, index) => {
			const oscillator = context.createOscillator();
			const gain = context.createGain();
			const noteStart = start + index * 0.11;
			const duration = name === "select" ? 0.08 : 0.16;

			oscillator.type = "sine";
			oscillator.frequency.setValueAtTime(frequency, noteStart);

			gain.gain.setValueAtTime(0.0001, noteStart);
			gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.015);
			gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

			oscillator.connect(gain);
			gain.connect(context.destination);
			oscillator.start(noteStart);
			oscillator.stop(noteStart + duration);
		});
	} catch {
		// Sound is optional; it should never interrupt the quiz.
	}
}
