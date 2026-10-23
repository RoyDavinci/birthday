export type BadgeTier = "gold" | "silver" | "bronze";

export const BADGE_MEDALS: Record<BadgeTier, string> = {
	gold: "🥇",
	silver: "🥈",
	bronze: "🥉",
};

export const BADGE_LABELS: Record<BadgeTier, string> = {
	gold: "Gold",
	silver: "Silver",
	bronze: "Bronze",
};

/** Round badge tier from the share of the round's points earned (0–100). */
export function getBadgeTier(percentage: number): BadgeTier | null {
	if (percentage >= 80) return "gold";
	if (percentage >= 60) return "silver";
	if (percentage >= 40) return "bronze";
	return null;
}
