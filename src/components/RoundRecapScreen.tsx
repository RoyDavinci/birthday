import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MAX_SCORE, QUESTIONS } from "../data/questions";
import { getRoundTheme } from "../data/roundThemes";
import { BADGE_LABELS, BADGE_MEDALS, getBadgeTier } from "../utils/badges";
import { fireConfetti } from "../utils/confetti";
import { playSound } from "../utils/sounds";
import { useQuizApp } from "./QuizAppContext";

function getRoundVerdict(percentage: number) {
	if (percentage >= 80) return "Omo, you killed this round! 🌚";
	if (percentage >= 60) return "Nice one. You sabi small.";
	if (percentage >= 40) return "Not bad, not bad. Small small.";
	if (percentage > 0) return "Omo… that round humbled you.";
	return "Zero? Omo. 🌚";
}

export function RoundRecapScreen() {
	const {
		screen,
		question,
		currentIndex,
		roundScores,
		totalScore,
		formatPoints,
		isLastQuestion,
		handleContinueFromRecap,
		muted,
	} = useQuizApp();
	const reduceMotion = useReducedMotion();
	const theme = getRoundTheme(question.round);
	const round = roundScores.find((item) => item.round === question.round);
	const earned = round?.earned ?? 0;
	const possible = round?.possible ?? 0;
	const percentage = possible ? Math.round((earned / possible) * 100) : 0;
	const tier = getBadgeTier(percentage);
	const bronzeTarget = Math.ceil(possible * 0.4);
	const nextRoundTitle = QUESTIONS[currentIndex + 1]?.roundTitle;

	// The badge lands a beat after the screen does.
	useEffect(() => {
		if (screen !== "roundRecap" || !tier) return;
		const timer = window.setTimeout(() => {
			playSound(tier === "gold" ? "streak" : "correct", muted);
			fireConfetti({
				y: 0.45,
				count: tier === "gold" ? 110 : 70,
				spread: 100,
				power: 15,
			});
		}, 750);
		return () => window.clearTimeout(timer);
		// Replaying the sound when the mute toggle changes would be annoying.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [screen, tier, question.round]);

	return (
		<>
			{screen === "roundRecap" && (
				<main className='roy-glow flex min-h-screen items-center justify-center px-4 pb-8 pt-14 sm:px-6'>
					<motion.section
						key={question.round}
						initial={{ opacity: 0, y: 24, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.35 }}
						className='panel w-full max-w-xl rounded-3xl p-7 text-center sm:p-10'
					>
						<div
							className='mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl'
							style={{
								background: `${theme.color}26`,
								border: `2px solid ${theme.color}66`,
							}}
						>
							<span aria-hidden='true'>{theme.emoji}</span>
						</div>
						<p className='mt-5 text-xs font-extrabold uppercase tracking-[0.25em] text-white/60'>
							Round {question.round} complete
						</p>
						<h1 className='mt-2 text-2xl font-bold sm:text-4xl'>
							{question.roundTitle}
						</h1>

						<p className='mt-6 font-display text-5xl font-bold tabular-nums sm:text-6xl'>
							{formatPoints(earned)}
							<span className='text-2xl text-white/40'>
								{" "}
								/ {formatPoints(possible)}
							</span>
						</p>
						<div className='mx-auto mt-4 h-3 max-w-xs overflow-hidden rounded-full bg-white/10'>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{ duration: 0.8 }}
								className='h-full rounded-full'
								style={{ background: theme.color }}
							/>
						</div>
						<p className='mt-4 text-lg font-bold text-white/90'>
							{getRoundVerdict(percentage)}
						</p>

						<div
							role='status'
							className='mx-auto mt-7 max-w-sm rounded-2xl p-5'
							style={{
								border: `2px dashed ${tier ? theme.color : "rgb(255 255 255 / 20%)"}`,
								background: tier ? `${theme.color}1a` : "rgb(255 255 255 / 4%)",
							}}
						>
							{tier ? (
								<>
									<motion.div
										initial={{ scale: 0, rotate: -40 }}
										animate={
											reduceMotion
												? { scale: 1, rotate: 0 }
												: { scale: [0, 1.4, 1], rotate: [-40, 12, 0] }
										}
										transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
										className='text-5xl'
										aria-hidden='true'
									>
										{BADGE_MEDALS[tier]}
									</motion.div>
									<p className='mt-3 text-xs font-extrabold uppercase tracking-[0.2em] text-white/60'>
										{BADGE_LABELS[tier]} badge unlocked
									</p>
									<p className='mt-1 font-display text-xl font-bold'>
										{theme.badge}
									</p>
								</>
							) : (
								<>
									<p className='font-display text-lg font-bold text-white/80'>
										No badge this round
									</p>
									<p className='mt-1 text-sm text-white/55'>
										Bronze needs {formatPoints(bronzeTarget)} points.{" "}
										{earned < bronzeTarget
											? `You were ${formatPoints(bronzeTarget - earned)} short.`
											: ""}
									</p>
								</>
							)}
						</div>

						<button
							type='button'
							onClick={handleContinueFromRecap}
							className='btn-party mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold'
						>
							{isLastQuestion
								? "See my results 🎂"
								: `Next round: ${nextRoundTitle}`}
							<ArrowRight size={18} />
						</button>
						<p className='mt-4 text-xs text-white/50'>
							Total so far: {formatPoints(totalScore)} /{" "}
							{formatPoints(MAX_SCORE)}
						</p>
					</motion.section>
				</main>
			)}
		</>
	);
}
