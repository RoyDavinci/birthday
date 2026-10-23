import type { Dispatch, SetStateAction } from "react";
import type { RecordedAnswer } from "../types/quiz";

export interface QuizState {
	playerName: string;
	currentIndex: number;
	response: string;
	deadlineAt: number | null;
	hasAnswered: boolean;
	hintUsed: boolean;
	answers: Record<number, RecordedAnswer>;
	optionOrders: Record<number, string[]>;
}

export type QuizAction = {
	type: "patch";
	value: Partial<QuizState>;
};

export const initialQuizState: QuizState = {
	playerName: "",
	currentIndex: 0,
	response: "",
	deadlineAt: null,
	hasAnswered: false,
	hintUsed: false,
	answers: {},
	optionOrders: {},
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
	switch (action.type) {
		case "patch":
			return { ...state, ...action.value };
		default:
			return state;
	}
}

export function updateRecord<T>(
	dispatch: Dispatch<QuizAction>,
	field: "answers" | "optionOrders",
	currentValue: T,
	next: SetStateAction<T>,
) {
	const value = typeof next === "function"
		? (next as (previous: T) => T)(currentValue)
		: next;
	dispatch({ type: "patch", value: { [field]: value } as Partial<QuizState> });
}
