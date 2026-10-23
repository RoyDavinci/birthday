import { createContext, useContext, type Dispatch, type FormEvent, type RefObject, type SetStateAction } from "react";
import type { QuizQuestion, RecordedAnswer } from "../types/quiz";
import type { SavedSession } from "../hooks/useQuizSession";

export type Screen = "welcome" | "roundIntro" | "quiz" | "results";
export interface RoundScore {
	round: number;
	title: string;
	earned: number;
	possible: number;
}
export interface RoundIntroCopy {
	subtitle: string;
	description: string;
}
export interface QuizAppContextValue {
	screen: Screen;
	playerName: string;
	setPlayerName: (value: string) => void;
	nameError: string;
	setNameError: Dispatch<SetStateAction<string>>;
	handleStart: (event: FormEvent<HTMLFormElement>) => void;
	savedSession: SavedSession | null;
	handleResumeSavedSession: () => void;
	question: QuizQuestion;
	roundScores: RoundScore[];
	handleStartRound: () => void;
	roundIntros: Record<number, RoundIntroCopy>;
	formatPoints: (points: number) => string;
	totalScore: number;
	currentIndex: number;
	progress: number;
	roundQuestionIndex: number;
	currentRoundQuestions: QuizQuestion[];
	roundProgress: number;
	timeLeft: number;
	hasAnswered: boolean;
	response: string;
	setResponse: (value: string) => void;
	muted: boolean;
	optionOrders: Record<number, string[]>;
	handleSubmitAnswer: () => void;
	recordedAnswer: RecordedAnswer | undefined;
	isCorrect: boolean;
	correctAnswer: string;
	handleNextQuestion: () => void;
	handleExitQuiz: () => void;
	isLastQuestion: boolean;
	percentage: number;
	royPercentage: number;
	generalPercentage: number;
	kindTotals: {
		roy: { earned: number; possible: number };
		general: { earned: number; possible: number };
	};
	streak: number;
	bestStreak: number;
	hintUsed: boolean;
	hintText: string | null;
	canUseHint: boolean;
	eliminatedOptions: string[];
	handleUseHint: () => void;
	resultsCardRef: RefObject<HTMLDivElement | null>;
	getResultTitle: (percentage: number) => string;
	getResultMessage: (percentage: number) => string;
	answers: Record<number, RecordedAnswer>;
	handleDownloadCard: () => Promise<void>;
	handleShareResults: () => Promise<void>;
	handleSendMessage: (message: string, includeScore: boolean) => void;
	showReview: boolean;
	setShowReview: Dispatch<SetStateAction<boolean>>;
	handleRestart: () => void;
	maxScore: number;
}
export const QuizAppContext = createContext<QuizAppContextValue | null>(null);
export function useQuizApp(): QuizAppContextValue {
	const value = useContext(QuizAppContext);
	if (!value) throw new Error("Quiz screen components must be rendered inside QuizAppProvider.");
	return value;
}
