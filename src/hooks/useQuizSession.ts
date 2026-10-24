import { useEffect, useState } from "react";
import { QUESTIONS } from "../data/questions";
import type { RecordedAnswer } from "../types/quiz";

export type SessionScreen = "roundIntro" | "quiz";

export interface SavedSession {
	version: 5;
	screen: SessionScreen;
	playerName: string;
	currentIndex: number;
	response: string;
	deadlineAt: number | null;
	hasAnswered: boolean;
	hintUsed: boolean;
	answers: Record<number, RecordedAnswer>;
	optionOrders: Record<number, string[]>;
}

interface SessionInput {
	screen: string;
	playerName: string;
	currentIndex: number;
	response: string;
	deadlineAt: number | null;
	hasAnswered: boolean;
	hintUsed: boolean;
	answers: Record<number, RecordedAnswer>;
	optionOrders: Record<number, string[]>;
}

const STORAGE_KEY = "roydavinci-birthday-quiz-session-v5";

function clearStoredSession() {
	try {
		window.localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Storage is optional; the quiz remains playable without it.
	}
}

function readSavedSession(): SavedSession | null {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const saved = JSON.parse(raw) as Partial<SavedSession>;
		const valid =
			saved.version === 5 &&
			(saved.screen === "roundIntro" || saved.screen === "quiz") &&
			typeof saved.playerName === "string" &&
			Boolean(saved.playerName.trim()) &&
			typeof saved.currentIndex === "number" &&
			saved.currentIndex >= 0 &&
			saved.currentIndex < QUESTIONS.length &&
			typeof saved.response === "string" &&
			(saved.deadlineAt === null || typeof saved.deadlineAt === "number") &&
			typeof saved.hasAnswered === "boolean" &&
			typeof saved.hintUsed === "boolean" &&
			typeof saved.answers === "object" &&
			saved.answers !== null &&
			typeof saved.optionOrders === "object" &&
			saved.optionOrders !== null;
		if (!valid) {
			window.localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return saved as SavedSession;
	} catch {
		return null;
	}
}

export function useQuizSession(input: SessionInput) {
	const [savedSession, setSavedSession] = useState<SavedSession | null>(() =>
		readSavedSession(),
	);

	const clearSession = clearStoredSession;

	useEffect(() => {
		if (input.screen === "results") {
			clearStoredSession();
			return;
		}
		if (input.screen !== "roundIntro" && input.screen !== "quiz") return;
		const snapshot: SavedSession = {
			version: 5,
			screen: input.screen,
			playerName: input.playerName,
			currentIndex: input.currentIndex,
			response: input.response,
			deadlineAt: input.deadlineAt,
			hasAnswered: input.hasAnswered,
			hintUsed: input.hintUsed,
			answers: input.answers,
			optionOrders: input.optionOrders,
		};
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Storage can be disabled or full; the current attempt still works.
		}
	}, [
		input.screen,
		input.playerName,
		input.currentIndex,
		input.response,
		input.deadlineAt,
		input.hasAnswered,
		input.hintUsed,
		input.answers,
		input.optionOrders,
	]);

	return { savedSession, setSavedSession, clearSession };
}
