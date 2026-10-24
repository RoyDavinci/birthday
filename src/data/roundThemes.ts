export type RoundKind = "roy" | "general";

export interface RoundTheme {
	emoji: string;
	color: string;
	/** Whether the round is about Roy or general knowledge. */
	kind: RoundKind;
	/** Badge title awarded for a strong score in this round. */
	badge: string;
}

/** One emoji, accent colour and badge per round, keyed by round number. */
export const ROUND_THEMES: Record<number, RoundTheme> = {
	1: { emoji: "🌍", color: "#ff5fa2", kind: "roy", badge: "Naija Roots Scholar" },
	2: { emoji: "💬", color: "#e879f9", kind: "general", badge: "Pidgin Professor" },
	3: { emoji: "🍛", color: "#ff9f45", kind: "roy", badge: "Jollof Judge" },
	4: { emoji: "🧠", color: "#60a5fa", kind: "general", badge: "Know-It-All" },
	5: { emoji: "📺", color: "#4cc9f0", kind: "roy", badge: "Binge Boss" },
	6: { emoji: "😎", color: "#ffd23f", kind: "roy", badge: "Vibe Reader" },
	7: { emoji: "🧮", color: "#fb7185", kind: "general", badge: "Mental Calculator" },
	8: { emoji: "💻", color: "#2ee6c5", kind: "roy", badge: "Stack Whisperer" },
	9: { emoji: "💰", color: "#a3e635", kind: "roy", badge: "Money Moves Mogul" },
	10: { emoji: "🎤", color: "#34d399", kind: "general", badge: "Naija Pop Pro" },
	11: { emoji: "🤝", color: "#a78bfa", kind: "roy", badge: "Inner Circle" },
	12: { emoji: "🧩", color: "#fbbf24", kind: "general", badge: "Riddle Master" },
	13: { emoji: "🔥", color: "#f87171", kind: "roy", badge: "Deep Cuts Detective" },
};

const FALLBACK_THEME: RoundTheme = {
	emoji: "🎉",
	color: "#ffd23f",
	kind: "roy",
	badge: "Quiz Champion",
};

export function getRoundTheme(round: number): RoundTheme {
	return ROUND_THEMES[round] ?? FALLBACK_THEME;
}
