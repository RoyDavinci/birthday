import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { QUESTIONS } from "../data/questions";
import { getRoundTheme } from "../data/roundThemes";
import { useQuizApp } from "./QuizAppContext";

export function RoundIntroScreen() {
	const {
		screen,
		question,
		roundScores,
		roundIntros,
		formatPoints,
		handleStartRound,
		playerName,
		totalScore,
	} = useQuizApp();
	const reduceMotion = useReducedMotion();
	const theme = getRoundTheme(question.round);

	return (
		<>
			{screen === "roundIntro" && (
				<main className='roy-glow flex min-h-screen items-center justify-center px-4 pb-8 pt-14 sm:px-6'>
					<AnimatePresence mode='wait'>
						<motion.section
							key={question.round}
							initial={{ opacity: 0, y: 24, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -12 }}
							transition={{ duration: 0.35 }}
							className='panel w-full max-w-xl rounded-3xl p-7 text-center sm:p-10'
						>
							<motion.div
								className='mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl'
								style={{
									background: `${theme.color}26`,
									border: `2px solid ${theme.color}66`,
									boxShadow: `0 0 48px ${theme.color}40`,
								}}
								initial={{ scale: 0.4, rotate: -20 }}
								animate={
									reduceMotion
										? { scale: 1, rotate: 0 }
										: { scale: [0.4, 1.2, 1], rotate: [-20, 10, 0] }
								}
								transition={{ duration: 0.6, ease: "easeOut" }}
							>
								<span aria-hidden='true'>{theme.emoji}</span>
							</motion.div>

							<div
								className='mt-6 flex items-center justify-center gap-1.5'
								role='img'
								aria-label={`Round ${question.round} of ${roundScores.length}`}
							>
								{roundScores.map((round) => {
									const reached = round.round <= question.round;
									return (
										<span
											key={round.round}
											className='h-2 rounded-full transition-all'
											style={{
												width: round.round === question.round ? 28 : 8,
												background: reached
													? getRoundTheme(round.round).color
													: "rgb(255 255 255 / 15%)",
											}}
										/>
									);
								})}
							</div>
							<p className='mt-3 text-xs font-extrabold uppercase tracking-[0.25em] text-white/60'>
								Round {question.round} of {roundScores.length}
							</p>
							<h1 className='party-text mt-3 text-3xl font-bold sm:text-5xl'>
								{question.roundTitle}
							</h1>
							<p className='mt-4 text-lg font-bold text-white/90'>
								{roundIntros[question.round]?.subtitle}
							</p>
							<p className='mx-auto mt-3 max-w-md text-sm leading-7 text-white/65 sm:text-base'>
								{roundIntros[question.round]?.description}
							</p>
							<div className='mx-auto mt-7 grid max-w-sm grid-cols-2 gap-3'>
								<div
									className='rounded-xl p-4'
									style={{
										border: `1px solid ${theme.color}44`,
										background: `${theme.color}14`,
									}}
								>
									<p className='font-display text-2xl font-bold'>
										{
											QUESTIONS.filter((item) => item.round === question.round)
												.length
										}
									</p>
									<p className='mt-1 text-xs text-white/60'>Questions</p>
								</div>
								<div
									className='rounded-xl p-4'
									style={{
										border: `1px solid ${theme.color}44`,
										background: `${theme.color}14`,
									}}
								>
									<p className='font-display text-2xl font-bold'>30 sec</p>
									<p className='mt-1 text-xs text-white/60'>Per question</p>
								</div>
							</div>
							<button
								type='button'
								onClick={handleStartRound}
								className='btn-party mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold'
							>
								Start round
								<ArrowRight size={18} />
							</button>
							<p className='mt-4 text-xs text-white/50'>
								Player: {playerName} · Current score: {formatPoints(totalScore)}
							</p>
						</motion.section>
					</AnimatePresence>
				</main>
			)}
		</>
	);
}
