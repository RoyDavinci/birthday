import { QUESTIONS } from "../data/questions";
import type { RecordedAnswer } from "../types/quiz";

export interface Streaks {
	current: number;
	best: number;
}

/** Streak of consecutive full-marks answers, in quiz order. */
export function computeStreaks(
	answers: Record<number, RecordedAnswer>,
): Streaks {
	let current = 0;
	let best = 0;

	for (const question of QUESTIONS) {
		const answer = answers[question.id];
		if (!answer) break;
		const correct = answer.correct ?? answer.earned === question.points;
		current = correct ? current + 1 : 0;
		best = Math.max(best, current);
	}

	return { current, best };
}

/** Streak counts that deserve a little fanfare. */
export const STREAK_MILESTONES = [3, 5, 7, 10, 15, 20];
