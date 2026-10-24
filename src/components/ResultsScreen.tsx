import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Cake,
	Download,
	PartyPopper,
	RotateCcw,
	Send,
	Share2,
	Sparkles,
} from "lucide-react";
import royPhoto from "../assets/roy.jpg";
import { MAX_SCORE, QUESTIONS } from "../data/questions";
import { getRoundTheme } from "../data/roundThemes";
import { BADGE_MEDALS, getBadgeTier } from "../utils/badges";
import { getCorrectAnswer } from "../utils/scoring";
import { fireConfetti, fireCannons } from "../utils/confetti";
import { Balloon, PartyHat } from "./PartyDecor";
import { useQuizApp } from "./QuizAppContext";

const MESSAGE_LIMIT = 600;

export function ResultsScreen() {
	const {
		screen,
		playerName,
		totalScore,
		percentage,
		royPercentage,
		generalPercentage,
		bestStreak,
		answers,
		roundScores,
		formatPoints,
		getResultTitle,
		getResultMessage,
		resultsCardRef,
		handleDownloadCard,
		handleShareResults,
		handleSendMessage,
		showReview,
		setShowReview,
		handleRestart,
	} = useQuizApp();
	const reduceMotion = useReducedMotion();
	const [message, setMessage] = useState("");
	const [includeScore, setIncludeScore] = useState(true);

	// Celebrate on arrival: the better the score, the bigger the party.
	useEffect(() => {
		if (screen !== "results") return;
		const intensity = percentage >= 75 ? 1.4 : percentage >= 40 ? 1 : 0.6;
		fireCannons(intensity);
		const timer = window.setTimeout(() => {
			fireConfetti({
				x: 0.5,
				y: 0.3,
				count: Math.round(70 * intensity),
				angle: 270,
				spread: 160,
				power: 11,
			});
		}, 600);
		return () => window.clearTimeout(timer);
	}, [screen, percentage]);

	const rounds = roundScores.map((round) => {
		const theme = getRoundTheme(round.round);
		const roundPercentage = round.possible
			? (round.earned / round.possible) * 100
			: 0;
		return { ...round, theme, tier: getBadgeTier(roundPercentage) };
	});
	const earnedBadges = rounds.filter((round) => round.tier);

	return (
		<>
			{screen === "results" && (
				<main className='roy-glow flex min-h-screen items-center justify-center px-4 pb-10 pt-16 sm:px-6'>
					<div className='relative w-full max-w-2xl'>
						<Balloon
							color='#ff5fa2'
							size={70}
							className='absolute -left-28 top-16 hidden xl:block'
						/>
						<Balloon
							color='#4cc9f0'
							size={52}
							delay={1}
							className='absolute -left-24 top-72 hidden xl:block'
						/>
						<Balloon
							color='#ffd23f'
							size={74}
							delay={0.5}
							className='absolute -right-28 top-24 hidden xl:block'
						/>
						<Balloon
							color='#2ee6c5'
							size={52}
							delay={1.5}
							className='absolute -right-24 top-80 hidden xl:block'
						/>

						<motion.div
							aria-hidden='true'
							initial={{ opacity: 0, y: -16, scale: 0.7, rotate: -10 }}
							animate={
								reduceMotion
									? { opacity: 1, y: 0, scale: 1, rotate: 0 }
									: {
											opacity: [0, 1, 0.9],
											y: [-16, 8, 0],
											scale: [0.7, 1.1, 1],
											rotate: [-10, 8, 0],
										}
							}
							transition={{ duration: 1.1, ease: "easeOut" }}
							className='pointer-events-none absolute -top-5 right-4 z-20 text-party-yellow sm:right-8'
						>
							<PartyPopper size={38} />
						</motion.div>
						<motion.section
							initial={{ opacity: 0, y: 18 }}
							animate={{ opacity: 1, y: 0 }}
							className='panel relative z-10 rounded-3xl p-6 sm:p-10'
						>
							<div
								ref={resultsCardRef}
								className='rounded-2xl bg-[#1d1033] p-2 sm:p-4'
							>
								<div className='text-center'>
									<div className='relative mx-auto mt-6 w-fit'>
										<PartyHat className='absolute -top-9 left-1/2 z-10 h-12 w-10 -translate-x-1/2 rotate-12' />
										<div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#e11d74] to-[#ff9f45] shadow-[0_0_48px_rgba(255,95,162,0.35)]'>
											<Cake className='text-white' size={32} />
										</div>
									</div>
									<p className='mt-5 text-xs font-extrabold uppercase tracking-[0.25em] text-party-pink'>
										🎉 Challenge complete
									</p>
									<h1 className='mt-3 text-3xl font-bold sm:text-5xl'>
										Well played, <span className='party-text'>{playerName}</span>
										!
									</h1>

									<div className='mt-7 rounded-3xl border border-party-yellow/25 bg-party-yellow/[0.06] p-6'>
										<p className='text-sm text-white/65'>Your final score</p>
										<p className='mt-2 font-display text-5xl font-bold tabular-nums sm:text-6xl'>
											{formatPoints(totalScore)}
											<span className='text-2xl text-white/40'>
												{" "}
												/ {formatPoints(MAX_SCORE)}
											</span>
										</p>
										<div className='mx-auto mt-5 h-3 max-w-sm overflow-hidden rounded-full bg-white/10'>
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: `${percentage}%` }}
												transition={{ duration: 0.9 }}
												className='h-full rounded-full bg-linear-to-r from-party-pink via-party-yellow to-party-teal'
											/>
										</div>
										<p className='mt-3 text-lg font-bold text-party-yellow'>
											{percentage}% score
										</p>

										<div className='mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3 text-left'>
											<div className='rounded-xl border border-party-pink/30 bg-party-pink/10 p-3'>
												<p className='text-xs text-white/60'>About RoyDavinci</p>
												<p className='mt-1 font-display text-2xl font-bold tabular-nums'>
													{royPercentage}%
												</p>
											</div>
											<div className='rounded-xl border border-party-sky/30 bg-party-sky/10 p-3'>
												<p className='text-xs text-white/60'>General knowledge</p>
												<p className='mt-1 font-display text-2xl font-bold tabular-nums'>
													{generalPercentage}%
												</p>
											</div>
										</div>

										<div className='mx-auto mt-3 grid max-w-sm grid-cols-3 gap-3'>
											<div className='rounded-xl border border-party-teal/30 bg-party-teal/10 p-3'>
												<p className='font-display text-xl font-bold tabular-nums'>
													{
														Object.values(answers).filter(
															(answer) => answer.earned > 0,
														).length
													}
												</p>
												<p className='mt-1 text-[11px] leading-4 text-white/60'>
													Earned points
												</p>
											</div>
											<div className='rounded-xl border border-orange-400/35 bg-orange-500/10 px-2 py-3'>
												<p className='whitespace-nowrap font-display text-xl font-bold tabular-nums'>
													🔥 {bestStreak}
												</p>
												<p className='mt-1 text-[11px] leading-4 text-white/60'>
													Best streak
												</p>
											</div>
											<div className='rounded-xl border border-white/15 bg-white/5 p-3'>
												<p className='font-display text-xl font-bold tabular-nums'>
													{
														Object.values(answers).filter(
															(answer) => answer.timedOut,
														).length
													}
												</p>
												<p className='mt-1 text-[11px] leading-4 text-white/60'>
													Timed out
												</p>
											</div>
										</div>
									</div>

									<h2 className='mt-7 text-xl font-bold sm:text-2xl'>
										{getResultTitle(royPercentage)}
									</h2>
									<p className='mx-auto mt-3 max-w-lg leading-7 text-white/70'>
										{getResultMessage(royPercentage)}
									</p>
								</div>

								<div className='mt-8'>
									<h3 className='mb-3 font-bold'>
										Badges earned{" "}
										<span className='text-white/45'>
											({earnedBadges.length}/{rounds.length})
										</span>
									</h3>
									{earnedBadges.length ? (
										<ul className='flex flex-wrap gap-2'>
											{earnedBadges.map((round) => (
												<li
													key={round.round}
													title={`${round.theme.emoji} ${round.title}`}
													className='inline-flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-xs font-bold sm:text-sm'
													style={{
														border: `1px solid ${round.theme.color}77`,
														background: `${round.theme.color}1f`,
													}}
												>
													<span aria-hidden='true'>{BADGE_MEDALS[round.tier!]}</span>
													{round.theme.badge}
												</li>
											))}
										</ul>
									) : (
										<p className='rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60'>
											No badges this time. Score 40% or more in a round to earn
											one. Play again and collect them all!
										</p>
									)}
								</div>

								<div className='mt-8'>
									<h3 className='mb-3 font-bold'>Round breakdown</h3>
									<div className='space-y-3'>
										{rounds.map((round) => (
											<div
												key={round.round}
												className='rounded-xl border border-white/10 bg-white/[0.03] p-3'
											>
												<div className='flex items-center justify-between gap-3 text-sm'>
													<span className='min-w-0 text-white/85'>
														<span className='mr-2' aria-hidden='true'>
															{round.theme.emoji}
														</span>
														{round.title}
														{round.tier && (
															<span className='ml-2' aria-hidden='true'>
																{BADGE_MEDALS[round.tier]}
															</span>
														)}
													</span>
													<span className='shrink-0 font-bold tabular-nums'>
														{formatPoints(round.earned)} /{" "}
														{formatPoints(round.possible)}
													</span>
												</div>
												<div className='mt-2 h-2 overflow-hidden rounded-full bg-white/10'>
													<div
														className='h-full rounded-full'
														style={{
															background: round.theme.color,
															width: `${round.possible ? (round.earned / round.possible) * 100 : 0}%`,
														}}
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								<p className='mt-8 rounded-2xl border-2 border-dashed border-party-yellow/45 bg-party-yellow/[0.06] p-4 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-party-yellow/90'>
									🎂 How well do you know RoyDavinci?
								</p>
							</div>

							<section
								aria-labelledby='tell-roy-heading'
								className='mt-6 rounded-2xl border-2 border-dashed border-party-pink/45 bg-party-pink/[0.06] p-5'
							>
								<div className='flex items-center gap-3'>
									<img
										src={royPhoto}
										alt='RoyDavinci'
										className='h-14 w-14 shrink-0 rounded-full border-2 border-party-yellow object-cover object-[50%_18%]'
									/>
									<div className='min-w-0'>
										<h2
											id='tell-roy-heading'
											className='font-display text-lg font-bold leading-tight'
										>
											Anything you want to tell Roy?
										</h2>
										<p className='mt-1 text-sm leading-5 text-white/65'>
											Optional: a (belated) birthday wish, a memory, a roast, a question.
										</p>
									</div>
								</div>
								<label htmlFor='roy-message' className='sr-only'>
									Your message to Roy
								</label>
								<textarea
									id='roy-message'
									value={message}
									onChange={(event) =>
										setMessage(event.target.value.slice(0, MESSAGE_LIMIT))
									}
									rows={4}
									maxLength={MESSAGE_LIMIT}
									placeholder='Type your message here…'
									className='mt-4 w-full resize-y rounded-xl border-2 border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-party-yellow/80'
								/>
								<div className='mt-1.5 flex items-start justify-between gap-3 text-xs text-white/50'>
									<span>
										Tap send and WhatsApp opens with your message ready. You
										press send there.
									</span>
									<span className='shrink-0 tabular-nums'>
										{message.length}/{MESSAGE_LIMIT}
									</span>
								</div>
								<label className='mt-3 flex items-center gap-2.5 text-sm text-white/80'>
									<input
										type='checkbox'
										checked={includeScore}
										onChange={(event) => setIncludeScore(event.target.checked)}
										className='h-4 w-4 accent-[#ff5fa2]'
									/>
									Include my score in the message
								</label>
								<button
									type='button'
									disabled={!message.trim()}
									onClick={() => handleSendMessage(message, includeScore)}
									className='btn-party mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-40'
								>
									<Send size={18} />
									Send to Roy on WhatsApp
								</button>
							</section>

							<div className='mt-6 grid gap-3 sm:grid-cols-2'>
								<button
									type='button'
									onClick={handleDownloadCard}
									className='inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/15 px-5 py-3 font-bold transition hover:bg-white/5'
								>
									<Download size={18} />
									Download results
								</button>
								<button
									type='button'
									onClick={handleShareResults}
									className='inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/15 px-5 py-3 font-bold transition hover:bg-white/5'
								>
									<Share2 size={18} />
									Share my score
								</button>
							</div>

							<a
								href={`https://wa.me/?text=${encodeURIComponent(`${playerName} scored ${formatPoints(totalScore)} / ${formatPoints(MAX_SCORE)} (${percentage}%) in How Well Do You Know RoyDavinci? ${window.location.href}`)}`}
								target='_blank'
								rel='noreferrer'
								className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-400/35 bg-emerald-500/12 px-5 py-3 font-bold text-emerald-100 transition hover:bg-emerald-500/20'
							>
								<Share2 size={18} />
								Share my score on WhatsApp
							</a>
							<button
								type='button'
								onClick={() => setShowReview((visible) => !visible)}
								className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-party-yellow transition hover:bg-white/5'
								aria-expanded={showReview}
							>
								<Sparkles size={18} />
								{showReview
									? "Hide question review"
									: "Review answers and fun facts"}
							</button>
							{showReview && (
								<section
									className='mt-4 space-y-3'
									aria-label='Question review'
								>
									{QUESTIONS.map((item, index) => (
										<article
											key={item.id}
											className='rounded-xl border border-white/10 bg-white/[0.03] p-4'
										>
											<p className='text-xs font-extrabold uppercase tracking-wider text-white/50'>
												Question {index + 1} · {item.points} points
											</p>
											<h3 className='mt-2 font-semibold text-white/95'>
												{item.prompt}
											</h3>
											<p className='mt-2 text-sm text-white/65'>
												Your answer:{" "}
												<span className='text-white/90'>
													{answers[item.id]?.response || "No answer"}
												</span>
											</p>
											<p className='mt-1 text-sm text-emerald-200'>
												Answer: {getCorrectAnswer(item)}
											</p>
											{item.funFact && (
												<p className='mt-2 text-sm leading-6 text-party-yellow/85'>
													<span className='font-extrabold'>
															{getRoundTheme(item.round).kind === "roy"
																? "🌚 Roy says: "
																: "🎈 Fun fact: "}
														</span>
													{item.funFact}
												</p>
											)}
										</article>
									))}
								</section>
							)}
							<button
								type='button'
								onClick={handleRestart}
								className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white/70 transition hover:bg-white/5 hover:text-white'
							>
								<RotateCcw size={17} />
								Play again
							</button>
						</motion.section>
					</div>
				</main>
			)}
		</>
	);
}
