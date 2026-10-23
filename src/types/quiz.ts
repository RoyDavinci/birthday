export interface QuestionBase {
	id: number;
	round: number;
	roundTitle: string;
	prompt: string;
	points: number;
	/** Shown when the player spends a hint (costs half the points). */
	hint?: string;
	funFact?: string;
}

export interface ChoiceQuestion extends QuestionBase {
	type: "choice";
	options: string[];
	correctAnswer: string;
	acceptedAnswers?: never;
	answerGroups?: never;
	correctValue?: never;
	range?: never;
}

export interface TextQuestion extends QuestionBase {
	type: "text";
	acceptedAnswers: string[];
	answerGroups?: string[][];
	/** Pool of acceptable answers (each entry is a list of synonyms). */
	answerPool?: string[][];
	/** How many distinct pool entries earn full points (defaults to 1). */
	poolRequired?: number;
	options?: never;
	correctAnswer?: never;
	correctValue?: never;
	range?: never;
}

export interface NumberQuestion extends QuestionBase {
	type: "number";
	correctValue?: number;
	range?: {
		min: number;
		max: number;
	};
	options?: never;
	correctAnswer?: never;
	acceptedAnswers?: never;
	answerGroups?: never;
}

export type QuizQuestion = ChoiceQuestion | TextQuestion | NumberQuestion;

export interface RecordedAnswer {
	response: string;
	earned: number;
	timedOut: boolean;
	/** True when the answer earned full marks before any hint penalty. */
	correct?: boolean;
	hintUsed?: boolean;
}
