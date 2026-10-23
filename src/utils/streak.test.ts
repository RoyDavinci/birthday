import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../data/questions";
import type { RecordedAnswer } from "../types/quiz";
import { getBadgeTier } from "./badges";
import { computeStreaks } from "./streak";

function answered(correctFlags: boolean[]): Record<number, RecordedAnswer> {
	return Object.fromEntries(
		correctFlags.map((correct, index) => [
			QUESTIONS[index].id,
			{
				response: "x",
				earned: correct ? QUESTIONS[index].points : 0,
				timedOut: false,
				correct,
			},
		]),
	);
}

describe("computeStreaks", () => {
	it("starts at zero", () => {
		expect(computeStreaks({})).toEqual({ current: 0, best: 0 });
	});

	it("counts consecutive correct answers and remembers the best run", () => {
		expect(computeStreaks(answered([true, true, true, false, true]))).toEqual({
			current: 1,
			best: 3,
		});
	});

	it("resets to zero after a miss", () => {
		expect(computeStreaks(answered([true, true, false]))).toEqual({
			current: 0,
			best: 2,
		});
	});

	it("falls back to full marks for answers saved without a correct flag", () => {
		const legacy = {
			[QUESTIONS[0].id]: {
				response: "x",
				earned: QUESTIONS[0].points,
				timedOut: false,
			},
		};
		expect(computeStreaks(legacy).current).toBe(1);
	});
});

describe("getBadgeTier", () => {
	it("awards gold, silver and bronze at 80, 60 and 40 percent", () => {
		expect(getBadgeTier(100)).toBe("gold");
		expect(getBadgeTier(80)).toBe("gold");
		expect(getBadgeTier(79)).toBe("silver");
		expect(getBadgeTier(60)).toBe("silver");
		expect(getBadgeTier(59)).toBe("bronze");
		expect(getBadgeTier(40)).toBe("bronze");
		expect(getBadgeTier(39)).toBeNull();
	});
});
