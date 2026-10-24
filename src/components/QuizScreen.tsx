import type { ChangeEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Cake,
	CheckCircle2,
	Clock3,
	Lightbulb,
	Sparkles,
	Star,
	XCircle,
} from "lucide-react";
import { MAX_SCORE, QUESTIONS } from "../data/questions";
import { getRoundTheme } from "../data/roundThemes";
import { playSound } from "../utils/sounds";
import { formatAmountInput } from "../utils/formatting";
import { useQuizApp } from "./QuizAppContext";

// Each answer letter gets its own candy colour.
const OPTION_COLORS = [
	{
		badge: "border-party-pink/50 bg-party-pink/15 text-party-pink",
		hover: "hover:border-party-pink/60 hover:bg-party-pink/[0.07]",
	},
	{
		badge: "border-party-yellow/50 bg-party-yellow/15 text-party-yellow",
		hover: "hover:border-party-yellow/60 hover:bg-party-yellow/[0.07]",
	},
	{
		badge: "border-party-teal/50 bg-party-teal/15 text-party-teal",
		hover: "hover:border-party-teal/60 hover:bg-party-teal/[0.07]",
	},
	{
		badge: "border-party-violet/50 bg-party-violet/15 text-party-violet",
		hover: "hover:border-party-violet/60 hover:bg-party-violet/[0.07]",
	},
];

export function QuizScreen() {
	const {
		screen,
		playerName,
		question,
		currentIndex,
		progress,
		totalScore,
		formatPoints,
		roundQuestionIndex,
		currentRoundQuestions,
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
		handleExitQuiz,
		isRoundEnd,
		handleNextQuestion,
		streak,
		hintUsed,
		hintText,
		canUseHint,
		eliminatedOptions,
		handleUseHint,
	} = useQuizApp();
	const theme = getRoundTheme(question.round);

	return (
		<>
			{screen === "quiz" && (
				<main className='roy-glow min-h-screen px-4 pb-8 pt-14 sm:px-6 sm:pb-10'>
					<div className='mx-auto max-w-3xl'>
						<header className='mb-6 flex items-center justify-between gap-4 pr-14 sm:pr-32 xl:pr-0'>
							<div className='flex min-w-0 items-center gap-2'>
								<Cake className='shrink-0 text-party-pink' size={21} />
								<span className='truncate text-xs font-extrabold uppercase tracking-[0.15em] text-white/75 sm:text-sm'>
									<span className='sm:hidden'>RoyDavinci Quiz</span>
									<span className='hidden sm:inline'>
										RoyDavinci Birthday Quiz
									</span>
								</span>
							</div>
							<div className='shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/70'>
								Player:{" "}
								<span className='font-bold text-white'>{playerName}</span>
							</div>
						</header>

						<div className='mb-5'>
							<div className='mb-2 flex items-center justify-between gap-3 text-xs text-white/60 sm:text-sm'>
								<span>
									Question {currentIndex + 1} of {QUESTIONS.length}{" "}
									<span className='text-white/35'>
										({Math.round(progress)}%)
									</span>
								</span>
								<span className='font-bold text-party-yellow'>
									{formatPoints(totalScore)} / {formatPoints(MAX_SCORE)} points
								</span>
							</div>
							<div className='h-2.5 rounded-full bg-white/10'>
								<motion.div
									className='relative h-full rounded-full bg-linear-to-r from-party-pink via-party-yellow to-party-teal'
									animate={{ width: `${progress}%` }}
									transition={{ duration: 0.25 }}
								>
									<span className='absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-party-pink shadow-[0_0_12px_rgba(255,95,162,0.9)]' />
								</motion.div>
							</div>
							<div className='mt-4 flex items-center justify-between gap-3 text-[11px] text-white/50 sm:text-xs'>
								<span>
									{theme.emoji} {question.roundTitle} · {roundQuestionIndex}/
									{currentRoundQuestions.length}
								</span>
								<div
									className='flex items-center gap-1.5'
									role='img'
									aria-label={`Question ${roundQuestionIndex} of ${currentRoundQuestions.length} in this round`}
								>
									{currentRoundQuestions.map((item, index) => (
										<span
											key={item.id}
											className='h-2 rounded-full transition-all'
											style={{
												width: index + 1 === roundQuestionIndex ? 20 : 8,
												background:
													index + 1 <= roundQuestionIndex
														? theme.color
														: "rgb(255 255 255 / 15%)",
											}}
										/>
									))}
								</div>
							</div>
						</div>

						<AnimatePresence mode='wait'>
							<motion.section
								key={question.id}
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className='panel rounded-3xl p-5 sm:p-9'
							>
								<div className='flex items-center justify-between gap-3'>
									<span
										className='rounded-full px-3 py-1.5 text-xs font-extrabold'
										style={{
											color: theme.color,
											border: `1px solid ${theme.color}55`,
											background: `${theme.color}1f`,
										}}
									>
										<span aria-hidden='true'>{theme.emoji}</span> ROUND{" "}
										{question.round} · {question.roundTitle}
									</span>
									<div
										className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums ${
											timeLeft <= 10 && !hasAnswered
												? "border-rose-400/50 bg-rose-500/15 text-rose-200 motion-safe:animate-pulse"
												: "border-white/15 bg-white/5 text-white/75"
										}`}
									>
										<Clock3 size={15} />
										00:{String(timeLeft).padStart(2, "0")}
									</div>
								</div>

								<div className='mt-7 flex items-center justify-between gap-3'>
									<div className='flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-party-yellow'>
										<Star size={14} className='fill-party-yellow' />
										{question.points} points
									</div>
									{streak >= 2 && (
										<motion.div
											key={streak}
											initial={{ scale: 0.7 }}
											animate={{ scale: [0.7, 1.25, 1] }}
											transition={{ duration: 0.4 }}
											aria-label={`${streak} correct in a row`}
											className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${
												streak >= 5
													? "border-orange-400/60 bg-orange-500/20 text-orange-100 shadow-[0_0_18px_rgba(251,146,60,0.5)]"
													: "border-orange-400/40 bg-orange-500/10 text-orange-200"
											}`}
										>
											<span aria-hidden='true'>🔥</span>
											{streak} in a row{streak >= 5 ? " · on fire!" : ""}
										</motion.div>
									)}
								</div>

								<h1 className='mt-4 text-2xl font-bold leading-tight sm:text-4xl'>
									{question.prompt}
								</h1>

								<div className='mt-3 flex items-start justify-between gap-3'>
									<p className='text-sm text-white/55'>
										{question.type === "choice"
											? "Choose one answer."
											: question.type === "text"
												? "Type your answer below."
												: question.id >= 31 && question.id <= 33
													? "Enter an amount in naira; commas and shorthand are accepted."
													: "Enter a whole number. You can earn partial points for a close guess."}
									</p>
									{!hasAnswered && (
										<button
											type='button'
											onClick={handleUseHint}
											disabled={!canUseHint}
											aria-label='Use a hint. It costs half the points.'
											className='inline-flex shrink-0 items-center gap-1.5 rounded-full border border-party-yellow/40 bg-party-yellow/10 px-3 py-1.5 text-xs font-bold text-party-yellow transition enabled:hover:bg-party-yellow/20 disabled:cursor-default disabled:opacity-60'
										>
											<Lightbulb size={14} />
											{hintUsed ? "Hint used" : "Hint · ½ points"}
										</button>
									)}
								</div>

								{hintUsed && hintText && !hasAnswered && (
									<p
										role='status'
										className='mt-4 flex items-start gap-2 rounded-xl border border-party-yellow/30 bg-party-yellow/8 px-3 py-2.5 text-sm leading-6 text-party-yellow'
									>
										<Lightbulb size={16} className='mt-1 shrink-0' />
										<span>{hintText}</span>
									</p>
								)}

								<div className='mt-7'>
									{question.type === "choice" ? (
										<div className='grid gap-3 sm:grid-cols-2'>
											{(optionOrders[question.id] ?? question.options).map(
												(option, index) => {
													const selected = response === option;
													const correct = option === question.correctAnswer;
													const eliminated =
														!hasAnswered && eliminatedOptions.includes(option);
													const color =
														OPTION_COLORS[index % OPTION_COLORS.length];
													let optionStyle = `border-white/12 bg-white/[0.03] ${color.hover} enabled:hover:-translate-y-0.5`;

													if (eliminated) {
														optionStyle =
															"border-white/8 bg-transparent opacity-35 line-through";
													} else if (!hasAnswered && selected) {
														optionStyle =
															"border-party-yellow bg-party-yellow/10 ring-2 ring-party-yellow/30";
													} else if (hasAnswered && correct) {
														optionStyle =
															"border-emerald-400/60 bg-emerald-400/12 text-emerald-100";
													} else if (hasAnswered && selected && !correct) {
														optionStyle =
															"border-rose-400/60 bg-rose-500/12 text-rose-100";
													}

													return (
														<button
															key={option}
															type='button'
															disabled={hasAnswered || eliminated}
															onClick={() => {
																setResponse(option);
																playSound("select", muted);
															}}
															className={`flex min-h-14 items-center gap-3 rounded-xl border-2 p-4 text-left text-sm transition disabled:cursor-default sm:text-base ${optionStyle}`}
														>
															<span
																className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${color.badge}`}
															>
																{String.fromCharCode(65 + index)}
															</span>
															<span className='flex-1'>{option}</span>
															{hasAnswered && correct && (
																<CheckCircle2
																	className='shrink-0 text-emerald-300'
																	size={18}
																/>
															)}
															{hasAnswered && selected && !correct && (
																<XCircle
																	className='shrink-0 text-rose-300'
																	size={18}
																/>
															)}
														</button>
													);
												},
											)}
										</div>
									) : (
										<input
											type='text'
											inputMode={
												question.type !== "number"
													? "text"
													: question.id >= 31 && question.id <= 33
														? "text"
														: "numeric"
											}
											autoComplete='off'
											value={response}
											onChange={(event: ChangeEvent<HTMLInputElement>) =>
												setResponse(
													question.type === "number" &&
														question.id >= 31 &&
														question.id <= 33
														? formatAmountInput(event.target.value)
														: event.target.value,
												)
											}
											onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
												if (event.key === "Enter" && !hasAnswered) {
													event.preventDefault();
													handleSubmitAnswer();
												}
											}}
											disabled={hasAnswered}
											placeholder={
												question.type === "number"
													? question.id >= 31 && question.id <= 33
														? "Enter a naira amount"
														: "Enter a whole-number guess"
													: "Type your answer here"
											}
											className='w-full rounded-xl border-2 border-white/12 bg-black/25 px-4 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-party-yellow/80 disabled:opacity-70'
										/>
									)}
								</div>

								{hasAnswered && (
									<motion.div
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										className={`mt-6 rounded-xl border p-4 ${
											recordedAnswer?.earned === 0
												? "border-rose-400/30 bg-rose-500/8"
												: isCorrect
													? "border-emerald-400/30 bg-emerald-400/8"
													: "border-party-yellow/30 bg-party-yellow/8"
										}`}
									>
										<div className='flex items-start gap-3'>
											{isCorrect ? (
												<CheckCircle2
													className='mt-0.5 shrink-0 text-emerald-300'
													size={20}
												/>
											) : recordedAnswer?.earned ? (
												<Sparkles
													className='mt-0.5 shrink-0 text-party-yellow'
													size={20}
												/>
											) : (
												<XCircle
													className='mt-0.5 shrink-0 text-rose-300'
													size={20}
												/>
											)}
											<div>
												<p className='font-bold'>
													{recordedAnswer?.timedOut
														? "Time's up!"
														: isCorrect
															? recordedAnswer?.hintUsed
																? "🎉 Correct! (Hint used, so half points.)"
																: "🎉 Correct! You sabi!"
															: recordedAnswer?.earned
																? "Close one! Partial points earned."
																: "Not quite! 🌚"}
												</p>
												<p className='mt-1 text-sm leading-6 text-white/70'>
													{recordedAnswer?.timedOut
														? recordedAnswer?.response
															? "Time ran out, so your current answer was submitted. "
															: "No answer was entered before time ran out. "
														: `You earned ${recordedAnswer?.earned ?? 0} out of ${question.points} points. `}
													Correct answer:{" "}
													<strong className='text-white'>
														{correctAnswer}
													</strong>
												</p>
												{question.funFact && (
													<p className='mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-party-yellow/90'>
														<span className='font-extrabold'>
															{theme.kind === "roy"
																? "🌚 Roy says: "
																: "🎈 Fun fact: "}
														</span>
														{question.funFact}
													</p>
												)}
											</div>
										</div>
									</motion.div>
								)}

								<div className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
									<button
										type='button'
										onClick={handleExitQuiz}
										className='inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-white/55 transition hover:text-white/90'
									>
										<ArrowLeft size={16} />
										Exit quiz
									</button>

									{!hasAnswered ? (
										<button
											type='button'
											disabled={!response.trim()}
											onClick={handleSubmitAnswer}
											className='btn-party inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-40'
										>
											Submit answer
											<ArrowRight size={17} />
										</button>
									) : (
										<button
											type='button'
											onClick={handleNextQuestion}
											className='btn-party inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold'
										>
											{isRoundEnd ? "Finish round" : "Next question"}
											<ArrowRight size={17} />
										</button>
									)}
								</div>
							</motion.section>
						</AnimatePresence>

						<p className='mt-5 text-center text-xs text-white/45'>
							Trust your memory. The clock is not your friend.
						</p>
					</div>
				</main>
			)}
		</>
	);
}
