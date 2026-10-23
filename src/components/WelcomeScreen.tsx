import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Clock3,
	Gamepad2,
	Heart,
	RotateCcw,
	Trophy,
	Users,
} from "lucide-react";
import royPhoto from "../assets/roy.jpg";
import { MAX_SCORE, QUESTIONS } from "../data/questions";
import { Balloon, PartyHat } from "./PartyDecor";
import { useQuizApp } from "./QuizAppContext";

export function WelcomeScreen() {
	const {
		screen,
		playerName,
		setPlayerName,
		nameError,
		setNameError,
		handleStart,
		savedSession,
		handleResumeSavedSession,
		formatPoints,
	} = useQuizApp();
	return (
		<>
			{screen === "welcome" && (
				<main className='roy-glow relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-8 pt-14 sm:px-6 sm:pb-12'>
					<Balloon
						color='#ff5fa2'
						size={74}
						className='absolute left-[6%] top-[22%] hidden lg:block'
					/>
					<Balloon
						color='#4cc9f0'
						size={56}
						delay={1}
						className='absolute left-[13%] top-[52%] hidden lg:block'
					/>
					<Balloon
						color='#ffd23f'
						size={78}
						delay={0.5}
						className='absolute right-[6%] top-[26%] hidden lg:block'
					/>
					<Balloon
						color='#2ee6c5'
						size={54}
						delay={1.5}
						className='absolute right-[13%] top-[56%] hidden lg:block'
					/>

					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className='relative w-full max-w-2xl'
					>
						<header className='mb-8 flex items-center justify-center gap-2 pr-12 sm:pr-0'>
							<span aria-hidden='true'>🎉</span>
							<span className='text-center text-xs font-extrabold uppercase tracking-[0.2em] text-white/75 sm:text-sm'>
								A RoyDavinci Birthday Special
							</span>
							<span aria-hidden='true' className='hidden sm:inline'>
								🎉
							</span>
						</header>

						<section className='panel rounded-4xl p-6 sm:p-10 md:p-12'>
							<div className='relative mb-8 flex items-center justify-center'>
								<Balloon
									color='#ff5fa2'
									size={34}
									className='absolute left-[14%] top-0 sm:left-[22%] lg:hidden'
								/>
								<Balloon
									color='#ffd23f'
									size={30}
									delay={1}
									className='absolute right-[14%] top-1 sm:right-[22%] lg:hidden'
								/>
								<div className='relative'>
									<PartyHat className='absolute -top-9 left-1/2 z-10 h-12 w-10 -translate-x-1/2 rotate-12 sm:-top-10 sm:h-14 sm:w-11' />
									<div className='rounded-full bg-linear-to-br from-party-pink via-party-yellow to-party-teal p-1 shadow-[0_0_60px_rgba(255,95,162,0.4)]'>
										<img
											src={royPhoto}
											alt='RoyDavinci, the birthday star'
											className='h-24 w-24 rounded-full border-4 border-[#1d1033] object-cover object-[50%_18%] sm:h-28 sm:w-28'
										/>
									</div>
								</div>
							</div>

							<div className='text-center'>
								<p className='inline-block -rotate-2 rounded-full bg-party-yellow px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#2b1055] shadow-lg sm:px-4 sm:text-sm sm:tracking-[0.18em]'>
									🎂 The ultimate birthday challenge
								</p>
								<h1 className='mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl'>
									HOW WELL DO
									<br />
									YOU KNOW
									<br />
									<span className='party-text'>ROYDAVINCI?</span>
								</h1>
								<p className='mx-auto mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base'>
									The stories, the vibes, the Naija life, the tech, and the
									things only the real ones know. Plus general knowledge, quick maths and brain teasers to keep you sharp.
								</p>
							</div>

							<div className='mt-8 grid grid-cols-3 gap-2 sm:gap-3'>
								<div className='rounded-2xl border border-party-pink/30 bg-party-pink/10 p-3 text-center sm:p-4'>
									<Gamepad2 className='mx-auto mb-2 text-party-pink' size={21} />
									<p className='font-display text-xl font-bold'>
										{QUESTIONS.length}
									</p>
									<p className='mt-1 text-[11px] text-white/60 sm:text-xs'>
										Questions
									</p>
								</div>
								<div className='rounded-2xl border border-party-yellow/30 bg-party-yellow/10 p-3 text-center sm:p-4'>
									<Clock3 className='mx-auto mb-2 text-party-yellow' size={21} />
									<p className='font-display text-xl font-bold'>30 sec</p>
									<p className='mt-1 text-[11px] text-white/60 sm:text-xs'>
										Per question
									</p>
								</div>
								<div className='rounded-2xl border border-party-teal/30 bg-party-teal/10 p-3 text-center sm:p-4'>
									<Trophy className='mx-auto mb-2 text-party-teal' size={21} />
									<p className='font-display text-xl font-bold'>
										{formatPoints(MAX_SCORE)}
									</p>
									<p className='mt-1 text-[11px] text-white/60 sm:text-xs'>
										Max points
									</p>
								</div>
							</div>

							<form onSubmit={handleStart} className='mt-8'>
								<label
									htmlFor='playerName'
									className='mb-2 block text-sm font-bold text-white/85'
								>
									What should we call you?
								</label>
								<div className='flex flex-col gap-3 sm:flex-row'>
									<input
										id='playerName'
										name='playerName'
										value={playerName}
										onChange={(event: ChangeEvent<HTMLInputElement>) => {
											setPlayerName(event.target.value);
											if (nameError) setNameError("");
										}}
										placeholder='Your name or nickname'
										maxLength={30}
										autoComplete='nickname'
										className='min-w-0 flex-1 rounded-xl border-2 border-white/10 bg-black/25 px-4 py-3.5 text-white outline-none transition placeholder:text-white/35 focus:border-party-yellow/80'
									/>
									<button
										type='submit'
										className='btn-party inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold'
									>
										Start the quiz
										<ArrowRight size={18} />
									</button>
								</div>
								{nameError && (
									<p role='alert' className='mt-2 text-sm text-rose-300'>
										{nameError}
									</p>
								)}
							</form>

							{savedSession && (
								<div className='mt-4 rounded-2xl border border-party-yellow/30 bg-party-yellow/[0.07] p-4'>
									<div className='flex items-start gap-3'>
										<RotateCcw
											className='mt-0.5 shrink-0 text-party-yellow'
											size={18}
										/>
										<div className='min-w-0 flex-1'>
											<p className='font-bold text-white/90'>
												You have a quiz in progress
											</p>
											<p className='mt-1 text-sm leading-5 text-white/60'>
												Continue as {savedSession.playerName}, or start a new
												attempt using the form above.
											</p>
											<button
												type='button'
												onClick={handleResumeSavedSession}
												className='mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-party-yellow/40 px-4 py-2 text-sm font-bold text-party-yellow transition hover:bg-party-yellow/10'
											>
												Resume quiz
												<ArrowRight size={16} />
											</button>
										</div>
									</div>
								</div>
							)}

							<div className='mt-6 flex items-start justify-center gap-2 text-center text-xs leading-5 text-white/50'>
								<Users size={15} className='mt-0.5 shrink-0' />
								<p>
									No registration. No backend. Just {QUESTIONS.length} questions
									to prove how well you know the birthday star.
								</p>
							</div>
						</section>

						<footer className='mt-6 flex items-center justify-center gap-2 text-xs text-white/45'>
							Made for the birthday star
							<Heart size={13} className='fill-rose-400 text-rose-400' />
							<span className='font-bold text-white/70'>RoyDavinci</span>
						</footer>
					</motion.div>
				</main>
			)}
		</>
	);
}
