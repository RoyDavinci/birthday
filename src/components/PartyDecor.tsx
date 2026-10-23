import { useId, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CONFETTI_COLORS } from "../utils/confetti";

/* ---------- Falling confetti backdrop ---------- */

// Generated from the index so the layout is stable between renders.
const CONFETTI_PIECES = Array.from({ length: 26 }, (_, index) => ({
	left: (index * 37 + 11) % 100,
	width: 6 + ((index * 7) % 8),
	height: index % 3 === 0 ? 8 : 14,
	delay: -((index * 1.9) % 16),
	duration: 13 + ((index * 5) % 10),
	drift: ((index % 5) - 2) * 22,
	color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
	round: index % 4 === 0,
}));

export function PartyBackground() {
	return (
		<div
			aria-hidden='true'
			className='pointer-events-none fixed inset-0 z-0 overflow-hidden'
		>
			{CONFETTI_PIECES.map((piece, index) => (
				<span
					key={index}
					className='confetti-piece'
					style={
						{
							left: `${piece.left}%`,
							width: piece.width,
							height: piece.round ? piece.width : piece.height,
							borderRadius: piece.round ? "9999px" : 2,
							background: piece.color,
							animationDuration: `${piece.duration}s`,
							animationDelay: `${piece.delay}s`,
							"--drift": `${piece.drift}px`,
						} as CSSProperties
					}
				/>
			))}
		</div>
	);
}

/* ---------- Bunting ---------- */

const FLAG_COLORS = [
	"#ff5fa2",
	"#ffd23f",
	"#2ee6c5",
	"#a78bfa",
	"#ff9f45",
	"#4cc9f0",
];

const FLAG_COUNT = 64;

export function Bunting() {
	return (
		<div
			aria-hidden='true'
			className='pointer-events-none fixed inset-x-0 top-0 z-20 h-9 overflow-hidden'
		>
			<div className='absolute inset-x-0 top-0 h-0.5 bg-white/25' />
			<div className='absolute left-1/2 top-0 flex -translate-x-1/2 gap-2.5'>
				{Array.from({ length: FLAG_COUNT }, (_, index) => (
					<span
						key={index}
						className='flag'
						style={{
							background: FLAG_COLORS[index % FLAG_COLORS.length],
							animationDelay: `${-(index % 7) * 0.45}s`,
						}}
					/>
				))}
			</div>
		</div>
	);
}

/* ---------- Balloon ---------- */

interface BalloonProps {
	color: string;
	size?: number;
	delay?: number;
	className?: string;
}

export function Balloon({
	color,
	size = 64,
	delay = 0,
	className = "",
}: BalloonProps) {
	const gradientId = useId();
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			aria-hidden='true'
			className={`pointer-events-none ${className}`}
			style={{ width: size, height: size * (110 / 60) }}
			animate={reduceMotion ? undefined : { y: [0, -14, 0], rotate: [-3, 3, -3] }}
			transition={{
				duration: 5 + delay,
				delay,
				repeat: Infinity,
				ease: "easeInOut",
			}}
		>
			<svg viewBox='0 0 60 110' width='100%' height='100%'>
				<defs>
					<radialGradient id={gradientId} cx='35%' cy='28%' r='80%'>
						<stop offset='0%' stopColor='#ffffff' stopOpacity='0.75' />
						<stop offset='35%' stopColor={color} />
						<stop offset='100%' stopColor={color} stopOpacity='0.7' />
					</radialGradient>
				</defs>
				<path
					d='M30 2 C48 2 58 18 58 36 C58 56 42 72 30 76 C18 72 2 56 2 36 C2 18 12 2 30 2 Z'
					fill={`url(#${gradientId})`}
				/>
				<path d='M30 76 L25 84 L35 84 Z' fill={color} />
				<path
					d='M30 84 C23 92 37 99 30 109'
					fill='none'
					stroke='#ffffff'
					strokeOpacity='0.45'
					strokeWidth='1.4'
					strokeLinecap='round'
				/>
			</svg>
		</motion.div>
	);
}

/* ---------- Party hat ---------- */

export function PartyHat({ className = "" }: { className?: string }) {
	const gradientId = useId();

	return (
		<svg
			aria-hidden='true'
			viewBox='0 0 44 54'
			className={className}
			fill='none'
		>
			<defs>
				<linearGradient id={gradientId} x1='0' y1='0' x2='1' y2='1'>
					<stop offset='0%' stopColor='#ffd23f' />
					<stop offset='100%' stopColor='#ff5fa2' />
				</linearGradient>
			</defs>
			<path d='M22 6 L40 48 H4 Z' fill={`url(#${gradientId})`} />
			<path d='M13 28 L31 24' stroke='#fff' strokeOpacity='0.55' strokeWidth='3' strokeLinecap='round' />
			<path d='M9 39 L35 35' stroke='#fff' strokeOpacity='0.55' strokeWidth='3' strokeLinecap='round' />
			<circle cx='22' cy='6' r='5' fill='#2ee6c5' />
			<rect x='3' y='46' width='38' height='6' rx='3' fill='#a78bfa' />
		</svg>
	);
}
