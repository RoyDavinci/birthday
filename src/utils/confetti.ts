export const CONFETTI_COLORS = [
	"#ff5fa2",
	"#ffd23f",
	"#2ee6c5",
	"#a78bfa",
	"#ff9f45",
	"#4cc9f0",
	"#ffffff",
];

export interface ConfettiOptions {
	/** Origin as a fraction of the viewport width (0 = left, 1 = right). */
	x?: number;
	/** Origin as a fraction of the viewport height (0 = top, 1 = bottom). */
	y?: number;
	/** Number of pieces. */
	count?: number;
	/** Direction of the burst in degrees (270 = straight up). */
	angle?: number;
	/** Total width of the burst cone in degrees. */
	spread?: number;
	/** Launch speed in pixels per frame. */
	power?: number;
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	rotation: number;
	spin: number;
	color: string;
	round: boolean;
	life: number;
}

const GRAVITY = 0.28;
const DRAG = 0.985;
const MAX_FRAMES = 190;

function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
	);
}

/**
 * Fires a one-off burst of confetti on a temporary full-screen canvas.
 * The canvas ignores pointer events and removes itself when the burst ends.
 */
export function fireConfetti(options: ConfettiOptions = {}) {
	if (typeof document === "undefined" || prefersReducedMotion()) return;

	const {
		x = 0.5,
		y = 0.6,
		count = 70,
		angle = 270,
		spread = 70,
		power = 13,
	} = options;

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	if (!context) return;

	const ratio = Math.min(window.devicePixelRatio || 1, 2);
	const width = window.innerWidth;
	const height = window.innerHeight;
	canvas.width = width * ratio;
	canvas.height = height * ratio;
	canvas.setAttribute("aria-hidden", "true");
	canvas.style.cssText =
		"position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
	context.scale(ratio, ratio);
	document.body.appendChild(canvas);

	const originX = x * width;
	const originY = y * height;

	const particles: Particle[] = Array.from({ length: count }, () => {
		const direction =
			((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
		const speed = power * (0.45 + Math.random() * 0.75);
		return {
			x: originX,
			y: originY,
			vx: Math.cos(direction) * speed,
			vy: Math.sin(direction) * speed,
			size: 6 + Math.random() * 7,
			rotation: Math.random() * Math.PI * 2,
			spin: (Math.random() - 0.5) * 0.4,
			color:
				CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
			round: Math.random() < 0.3,
			life: 0,
		};
	});

	let frame = 0;

	function tick() {
		frame += 1;
		context!.clearRect(0, 0, width, height);
		let alive = 0;

		for (const particle of particles) {
			particle.life += 1;
			particle.vx *= DRAG;
			particle.vy = particle.vy * DRAG + GRAVITY;
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.rotation += particle.spin;

			if (particle.y > height + 30) continue;
			alive += 1;

			// Fade out over the final stretch of the animation.
			const fade = Math.max(0, Math.min(1, (MAX_FRAMES - frame) / 50));
			context!.save();
			context!.globalAlpha = fade;
			context!.translate(particle.x, particle.y);
			context!.rotate(particle.rotation);
			context!.fillStyle = particle.color;
			if (particle.round) {
				context!.beginPath();
				context!.arc(0, 0, particle.size / 2.4, 0, Math.PI * 2);
				context!.fill();
			} else {
				context!.fillRect(
					-particle.size / 2,
					-particle.size / 4,
					particle.size,
					particle.size / 2,
				);
			}
			context!.restore();
		}

		if (alive > 0 && frame < MAX_FRAMES) {
			requestAnimationFrame(tick);
		} else {
			canvas.remove();
		}
	}

	requestAnimationFrame(tick);
}

/** Twin confetti cannons from the bottom corners, used on the results screen. */
export function fireCannons(intensity = 1) {
	const count = Math.round(60 * intensity);
	fireConfetti({ x: 0.05, y: 0.95, angle: 300, spread: 55, count, power: 17 });
	fireConfetti({ x: 0.95, y: 0.95, angle: 240, spread: 55, count, power: 17 });
}
