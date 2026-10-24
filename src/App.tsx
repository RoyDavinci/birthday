import {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
	type FormEvent,
	type SetStateAction,
} from "react";
import { Volume2, VolumeX } from "lucide-react";
import { toPng } from "html-to-image";
import { MAX_SCORE, QUESTIONS } from "./data/questions";
import type { QuizQuestion, RecordedAnswer } from "./types/quiz";
import { useQuizTimer } from "./hooks/useQuizTimer";
import { useQuizSession } from "./hooks/useQuizSession";
import {
	initialQuizState,
	quizReducer,
	updateRecord,
} from "./hooks/quizReducer";
import type { Screen } from "./components/QuizAppContext";
import { QuizAppProvider } from "./components/QuizAppProvider";
import { RoundRecapScreen } from "./components/RoundRecapScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { RoundIntroScreen } from "./components/RoundIntroScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { QuizScreen } from "./components/QuizScreen";
import { getCorrectAnswer, resolveAnswer } from "./utils/scoring";
import { playSound } from "./utils/sounds";
import { fireConfetti } from "./utils/confetti";
import { Bunting, PartyBackground } from "./components/PartyDecor";
import { getRoundTheme } from "./data/roundThemes";
import { STREAK_MILESTONES, computeStreaks } from "./utils/streak";

const QUESTION_SECONDS = 30;
const WHATSAPP_NUMBER = "2349159403602";

function shuffleOptions(options: string[]): string[] {
	const shuffled = [...options];
	for (let index = shuffled.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swapIndex]] = [
			shuffled[swapIndex],
			shuffled[index],
		];
	}
	return shuffled;
}

function createOptionOrders(): Record<number, string[]> {
	return Object.fromEntries(
		QUESTIONS.filter((question) => question.type === "choice").map(
			(question) => [question.id, shuffleOptions(question.options)],
		),
	);
}

const ROUND_INTROS: Record<number, { subtitle: string; description: string }> =
	{
		1: {
			subtitle: "Every story starts somewhere.",
			description:
				"Let’s see how well you know RoyDavinci’s roots, upbringing, and signature expressions.",
		},
		2: {
			subtitle: "Naija is a language of its own.",
			description: "Pidgin and street slang. If you know, you know.",
		},
		3: {
			subtitle: "Food, drinks, and football.",
			description:
				"From jollof rice to Manchester United, test your knowledge of the favourites.",
		},
		4: {
			subtitle: "Time to look beyond Roy.",
			description:
				"Capitals, planets, chemistry, and football history. Let’s see what is in your head.",
		},
		5: {
			subtitle: "You know the shows, right?",
			description:
				"TV dramas, anime, and classic Nigerian television. No spoilers needed.",
		},
		6: {
			subtitle: "What’s been happening?",
			description:
				"Football, awards, and Nigerian headlines from this year. Let’s see if you’ve been paying attention to the news.",
		},
		7: {
			subtitle: "You think you know the personality?",
			description:
				"The habits, reactions, and little things that make RoyDavinci RoyDavinci.",
		},
		8: {
			subtitle: "Calculators are not invited.",
			description:
				"Simple sums, percentages, and naira maths. Work it out before the clock does.",
		},
		9: {
			subtitle: "Developer mode: ON.",
			description:
				"Programming history, favourite technologies, and the career goal. Let’s get technical.",
		},
		10: {
			subtitle: "Big dreams, bigger plans.",
			description:
				"Money guesses, future plans, and the destinations RoyDavinci wants to see.",
		},
		11: {
			subtitle: "Naija no dey carry last.",
			description:
				"History, books, music, and geography. How Naija are you, really?",
		},
		12: {
			subtitle: "It’s about the people.",
			description:
				"Find out whether you know what RoyDavinci values in friendship and relationships.",
		},
		13: {
			subtitle: "This is how I actually move.",
			description:
				"Real reactions to real situations. If you know me, you’ll know what I do.",
		},
		14: {
			subtitle: "Read carefully. Think twice.",
			description: "Riddles and logic puzzles built to trip up fast thinkers.",
		},
		15: {
			subtitle: "Only the real ones know.",
			description: "The final round has the deep cuts. Finish strong!",
		},
	};

function eliminatedOptionsFor(
	question: QuizQuestion,
	shownOptions: string[],
): string[] {
	return question.type === "choice"
		? shownOptions
				.filter((option) => option !== question.correctAnswer)
				.slice(0, 2)
		: [];
}

function announceResult(correct: boolean, streak: number, muted: boolean) {
	if (!correct) {
		playSound("wrong", muted);
		return;
	}
	if (STREAK_MILESTONES.includes(streak)) {
		playSound("streak", muted);
		fireConfetti({ count: 100, spread: 110, power: 16 });
		return;
	}
	playSound("correct", muted);
	fireConfetti({ count: 50, spread: 80 });
}

function formatPoints(points: number) {
	return points.toLocaleString("en-NG");
}

function getResultTitle(percentage: number) {
	if (percentage >= 90) return "THE ROYDAVINCI ENCYCLOPEDIA";
	if (percentage >= 75) return "YOU ACTUALLY PAY ATTENTION";
	if (percentage >= 60) return "NOT BAD, MY GUY";
	if (percentage >= 40) return "WHO SENT YOU HERE?";
	return "WE ARE STRANGERS 😂";
}

function getResultMessage(percentage: number) {
	if (percentage >= 90) {
		return "You know me almost too well. Who gave you the inside information? 🌚";
	}
	if (percentage >= 75) {
		return "You’ve clearly been paying attention. You’re one of the real ones.";
	}
	if (percentage >= 60) {
		return "You know a fair amount, but there are still a few things about me you need to learn.";
	}
	if (percentage >= 40) {
		return "You know some things, but we need to sit down for a proper Q&A session.";
	}
	return "Omo! Spend more time getting to know me, abeg. 🌚";
}

function SoundToggle({
	muted,
	onToggle,
}: {
	muted: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onToggle}
			aria-label={muted ? "Turn sounds on" : "Mute sounds"}
			aria-pressed={muted}
			className='fixed right-3 top-10 z-30 inline-flex items-center gap-2 rounded-full border border-white/15 bg-party-panel/80 px-3 py-2 text-sm text-white/85 backdrop-blur transition hover:bg-white/10 sm:right-4'
		>
			{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
			<span className='hidden sm:inline'>{muted ? "Muted" : "Sound on"}</span>
		</button>
	);
}

export default function App() {
	const [screen, setScreen] = useState<Screen>("welcome");
	const [quizState, dispatch] = useReducer(quizReducer, initialQuizState);
	const {
		playerName,
		currentIndex,
		response,
		deadlineAt,
		hasAnswered,
		hintUsed,
		answers,
		optionOrders,
	} = quizState;
	const setPlayerName = (value: string) =>
		dispatch({ type: "patch", value: { playerName: value } });
	const setCurrentIndex = (value: number) =>
		dispatch({ type: "patch", value: { currentIndex: value } });
	const setResponse = (value: string) =>
		dispatch({ type: "patch", value: { response: value } });
	const setDeadlineAt = (value: number | null) =>
		dispatch({ type: "patch", value: { deadlineAt: value } });
	const setHasAnswered = (value: boolean) =>
		dispatch({ type: "patch", value: { hasAnswered: value } });
	const setHintUsed = (value: boolean) =>
		dispatch({ type: "patch", value: { hintUsed: value } });
	const setAnswers = useCallback(
		(value: SetStateAction<Record<number, RecordedAnswer>>) =>
			updateRecord(dispatch, "answers", answers, value),
		[answers],
	);
	const setOptionOrders = (value: SetStateAction<Record<number, string[]>>) =>
		updateRecord(dispatch, "optionOrders", optionOrders, value);
	const [nameError, setNameError] = useState("");
	const [toast, setToast] = useState<string | null>(null);
	const [showReview, setShowReview] = useState(false);
	const [muted, setMuted] = useState(false);
	const resultsCardRef = useRef<HTMLDivElement>(null);
	const savedSessionState = useQuizSession({
		screen,
		playerName,
		currentIndex,
		response,
		deadlineAt,
		hasAnswered,
		hintUsed,
		answers,
		optionOrders,
	});
	const { savedSession, setSavedSession, clearSession } = savedSessionState;
	const timeLeft = useQuizTimer(deadlineAt, screen === "quiz" && !hasAnswered);
	const showToast = useCallback((message: string) => setToast(message), []);

	const question = QUESTIONS[currentIndex];
	const isLastQuestion = currentIndex === QUESTIONS.length - 1;
	const isRoundEnd =
		isLastQuestion || QUESTIONS[currentIndex + 1]?.round !== question.round;
	const recordedAnswer = answers[question.id];

	const totalScore = useMemo(
		() =>
			Object.values(answers).reduce(
				(total, answer) => total + answer.earned,
				0,
			),
		[answers],
	);

	const percentage = Math.round((totalScore / MAX_SCORE) * 100);

	const streaks = useMemo(() => computeStreaks(answers), [answers]);
	const currentStreak = streaks.current;

	// Roy rounds and general rounds are scored separately as well as together.
	const kindTotals = useMemo(() => {
		const totals = {
			roy: { earned: 0, possible: 0 },
			general: { earned: 0, possible: 0 },
		};
		for (const item of QUESTIONS) {
			const bucket = totals[getRoundTheme(item.round).kind];
			bucket.possible += item.points;
			bucket.earned += answers[item.id]?.earned ?? 0;
		}
		return totals;
	}, [answers]);
	const toPercent = (earned: number, possible: number) =>
		possible ? Math.round((earned / possible) * 100) : 0;
	const royPercentage = toPercent(
		kindTotals.roy.earned,
		kindTotals.roy.possible,
	);
	const generalPercentage = toPercent(
		kindTotals.general.earned,
		kindTotals.general.possible,
	);
	const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

	const currentRoundQuestions = QUESTIONS.filter(
		(item) => item.round === question.round,
	);
	const roundQuestionIndex =
		currentRoundQuestions.findIndex((item) => item.id === question.id) + 1;
	const roundProgress =
		(roundQuestionIndex / currentRoundQuestions.length) * 100;
	const correctAnswer = getCorrectAnswer(question);
	const isCorrect =
		recordedAnswer?.correct ?? recordedAnswer?.earned === question.points;

	// Hints: choice questions lose two wrong options; others show a clue.
	const shownOptions =
		question.type === "choice"
			? (optionOrders[question.id] ?? question.options)
			: [];
	const eliminatedOptions = hintUsed
		? eliminatedOptionsFor(question, shownOptions)
		: [];
	const hintText =
		question.type === "choice"
			? "Two wrong answers removed."
			: (question.hint ?? null);
	const canUseHint = screen === "quiz" && !hasAnswered && !hintUsed;

	// When the deadline expires, submit the current selection/text instead of
	// discarding it. An empty response is still recorded as a timeout.
	useEffect(() => {
		if (screen !== "quiz" || hasAnswered || timeLeft > 0) return;
		const submittedResponse = response.trim();
		const { earned, correct } = resolveAnswer(
			question,
			submittedResponse,
			hintUsed,
		);
		announceResult(correct, correct ? currentStreak + 1 : 0, muted);
		setAnswers((previous) => {
			if (previous[question.id]) return previous;
			return {
				...previous,
				[question.id]: {
					response: submittedResponse,
					earned,
					timedOut: true,
					correct,
					hintUsed,
				},
			};
		});
		setHasAnswered(true);
	}, [
		screen,
		hasAnswered,
		timeLeft,
		response,
		question,
		hintUsed,
		currentStreak,
		muted,
		setAnswers,
	]);

	useEffect(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(null), 3200);
		return () => window.clearTimeout(timer);
	}, [toast]);

	function handleStart(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const name = playerName.trim();

		if (!name) {
			setNameError("Enter your name or nickname to continue.");
			return;
		}

		setPlayerName(name);
		setShowReview(false);
		setNameError("");
		setCurrentIndex(0);
		setResponse("");
		setDeadlineAt(null);
		setHasAnswered(false);
		setHintUsed(false);
		setAnswers({});
		setOptionOrders(createOptionOrders());
		clearSession();
		setSavedSession(null);
		setScreen("roundIntro");
	}

	function handleResumeSavedSession() {
		if (!savedSession) return;

		setPlayerName(savedSession.playerName);
		setCurrentIndex(savedSession.currentIndex);
		setResponse(savedSession.response);
		setDeadlineAt(
			savedSession.screen === "quiz"
				? (savedSession.deadlineAt ?? Date.now() + QUESTION_SECONDS * 1000)
				: null,
		);
		setHasAnswered(savedSession.hasAnswered);
		setHintUsed(savedSession.hintUsed);
		setAnswers(savedSession.answers);
		setOptionOrders(savedSession.optionOrders);
		setNameError("");
		setScreen(savedSession.screen);
	}

	function handleSubmitAnswer() {
		if (hasAnswered || !response.trim()) return;

		const submitted = response.trim();
		const { earned, correct } = resolveAnswer(question, submitted, hintUsed);
		announceResult(correct, correct ? streaks.current + 1 : 0, muted);

		setAnswers((previous) => ({
			...previous,
			[question.id]: {
				response: submitted,
				earned,
				timedOut: false,
				correct,
				hintUsed,
			},
		}));

		setHasAnswered(true);
	}

	function handleUseHint() {
		if (!canUseHint) return;
		setHintUsed(true);
		playSound("select", muted);
		if (eliminatedOptionsFor(question, shownOptions).includes(response)) {
			setResponse("");
		}
	}

	function handleNextQuestion() {
		if (!hasAnswered) return;

		// The last question of every round shows a recap (and the badge) first.
		if (isRoundEnd) {
			setScreen("roundRecap");
			return;
		}

		setCurrentIndex(currentIndex + 1);
		setResponse("");
		setHasAnswered(false);
		setHintUsed(false);
		setDeadlineAt(Date.now() + QUESTION_SECONDS * 1000);
	}

	function handleContinueFromRecap() {
		if (isLastQuestion) {
			playSound("birthday", muted);
			clearSession();
			setSavedSession(null);
			setScreen("results");
			return;
		}

		setCurrentIndex(currentIndex + 1);
		setResponse("");
		setHasAnswered(false);
		setHintUsed(false);
		setDeadlineAt(null);
		setScreen("roundIntro");
	}

	function handleStartRound() {
		setHintUsed(false);
		setResponse("");
		setDeadlineAt(Date.now() + QUESTION_SECONDS * 1000);
		setHasAnswered(false);
		setScreen("quiz");
	}

	function handleRestart() {
		setShowReview(false);
		setCurrentIndex(0);
		setResponse("");
		setDeadlineAt(null);
		setHasAnswered(false);
		setHintUsed(false);
		setAnswers({});
		setOptionOrders({});
		setNameError("");
		clearSession();
		setSavedSession(null);
		setScreen("welcome");
	}

	async function handleDownloadCard() {
		if (!resultsCardRef.current) return;
		try {
			const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
			// iOS Safari can need a warm-up render before exporting a complex card.
			if (isIOS) {
				await toPng(resultsCardRef.current, {
					pixelRatio: 1,
					cacheBust: true,
					backgroundColor: "#1d1033",
				});
			}
			const dataUrl = await toPng(resultsCardRef.current, {
				pixelRatio: 2,
				cacheBust: true,
				backgroundColor: "#1d1033",
			});
			const blob = await (await fetch(dataUrl)).blob();
			const file = new File([blob], "roydavinci-quiz-results.png", {
				type: "image/png",
			});

			if (navigator.share && navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: "My RoyDavinci Quiz Results",
					text: `${playerName} scored ${formatPoints(totalScore)} / ${formatPoints(MAX_SCORE)} (${percentage}%). ${window.location.href}`,
					files: [file],
				});
				return;
			}

			const link = document.createElement("a");
			link.download = "roydavinci-quiz-results.png";
			link.href = dataUrl;
			link.click();
			showToast("Your results card is ready.");
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") return;
			console.error("Could not export results card:", error);
			showToast(
				"Could not create the results image. Try sharing your score instead.",
			);
		}
	}

	async function handleShareResults() {
		const shareText =
			`${playerName} scored ${formatPoints(totalScore)} out of ` +
			`${formatPoints(MAX_SCORE)} (${percentage}%) in ` +
			"How Well Do You Know RoyDavinci? Try it here: " +
			window.location.href;

		try {
			if (navigator.share) {
				await navigator.share({
					title: "My RoyDavinci Quiz Results",
					text: shareText,
					url: window.location.href,
				});
				return;
			}

			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(shareText);
				showToast("Your result and quiz link have been copied.");
				return;
			}
			showToast("Use the WhatsApp button to share your score.");
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") return;
			console.error("Could not share results:", error);
			showToast("Sharing failed. Try WhatsApp or download your results card.");
		}
	}

	function handleExitQuiz() {
		setSavedSession({
			version: 5,
			screen: "quiz",
			playerName,
			currentIndex,
			response,
			deadlineAt,
			hasAnswered,
			hintUsed,
			answers,
			optionOrders,
		});
		setScreen("welcome");
	}

	function handleSendMessage(message: string, includeScore: boolean) {
		const text = message.trim();
		if (!text) return;
		const lines = [`Hi Roy, it’s ${playerName}! 👋`, "", text];
		if (includeScore) {
			lines.push(
				"",
				`(I scored ${formatPoints(totalScore)}/${formatPoints(MAX_SCORE)} on your birthday quiz.)`,
			);
		}
		window.open(
			`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
			"_blank",
			"noopener,noreferrer",
		);
	}

	const roundScores = useMemo(
		() =>
			Array.from(new Set(QUESTIONS.map((item) => item.round))).map((round) => {
				const roundQuestions = QUESTIONS.filter((item) => item.round === round);
				const earned = roundQuestions.reduce(
					(total, item) => total + (answers[item.id]?.earned ?? 0),
					0,
				);
				const possible = roundQuestions.reduce(
					(total, item) => total + item.points,
					0,
				);

				return {
					round,
					title: roundQuestions[0].roundTitle,
					earned,
					possible,
				};
			}),
		[answers],
	);

	const viewModel = {
		screen,
		playerName,
		setPlayerName,
		nameError,
		setNameError,
		handleStart,
		savedSession,
		handleResumeSavedSession,
		question,
		roundScores,
		handleStartRound,
		roundIntros: ROUND_INTROS,
		formatPoints,
		totalScore,
		currentIndex,
		progress,
		roundQuestionIndex,
		currentRoundQuestions,
		roundProgress,
		timeLeft,
		hasAnswered,
		response,
		setResponse,
		muted,
		optionOrders,
		handleSubmitAnswer,
		recordedAnswer,
		isCorrect,
		correctAnswer,
		handleNextQuestion,
		handleExitQuiz,
		isLastQuestion,
		isRoundEnd,
		handleContinueFromRecap,
		percentage,
		royPercentage,
		generalPercentage,
		kindTotals,
		streak: streaks.current,
		bestStreak: streaks.best,
		hintUsed,
		hintText,
		canUseHint,
		eliminatedOptions,
		handleUseHint,
		resultsCardRef,
		getResultTitle,
		getResultMessage,
		answers,
		handleDownloadCard,
		handleShareResults,
		handleSendMessage,
		showReview,
		setShowReview,
		handleRestart,
		maxScore: MAX_SCORE,
	};

	return (
		<QuizAppProvider value={viewModel}>
			<>
				<PartyBackground />
				<Bunting />
				<SoundToggle
					muted={muted}
					onToggle={() => setMuted((previous) => !previous)}
				/>
				{toast && (
					<div
						role='status'
						aria-live='polite'
						className='fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border-2 border-party-yellow/40 bg-[#2a1450] px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl'
					>
						{toast}
					</div>
				)}

				<WelcomeScreen />
				<RoundIntroScreen />
				<ResultsScreen />
				<QuizScreen />
				<RoundRecapScreen />
			</>
		</QuizAppProvider>
	);
}
