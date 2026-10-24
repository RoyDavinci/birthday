import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import { ROUND_THEMES } from "./roundThemes";

describe("question bank integrity", () => {
	it("has unique question IDs", () => {
		const ids = QUESTIONS.map((question) => question.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("keeps every choice answer in its option list", () => {
		for (const question of QUESTIONS) {
			if (question.type === "choice") {
				expect(question.options).toContain(question.correctAnswer);
			}
		}
	});

	it("does not include the removed fraud question", () => {
		expect(
			QUESTIONS.some((question) => /involved in fraud/i.test(question.prompt)),
		).toBe(false);
	});

	it("gives every choice question four distinct options", () => {
		for (const question of QUESTIONS) {
			if (question.type === "choice") {
				expect(new Set(question.options).size).toBe(4);
			}
		}
	});

	it("keeps each round contiguous and in order", () => {
		const rounds = QUESTIONS.map((question) => question.round);
		expect([...rounds].sort((a, b) => a - b)).toEqual(rounds);
	});

	it("gives every typed and number question a hint", () => {
		for (const question of QUESTIONS) {
			if (question.type !== "choice") {
				expect(question.hint, `question ${question.id}`).toBeTruthy();
			}
		}
	});

	it("has a theme and badge for every round", () => {
		const rounds = new Set(QUESTIONS.map((question) => question.round));
		for (const round of rounds) {
			expect(ROUND_THEMES[round], `round ${round}`).toBeDefined();
			expect(ROUND_THEMES[round].badge).toBeTruthy();
		}
	});

	it("mixes RoyDavinci rounds with general-knowledge rounds", () => {
		const kinds = Object.values(ROUND_THEMES).map((theme) => theme.kind);
		expect(kinds.filter((kind) => kind === "roy").length).toBeGreaterThanOrEqual(6);
		expect(kinds.filter((kind) => kind === "general").length).toBeGreaterThanOrEqual(4);
		// No two general rounds back to back, so Roy rounds keep appearing.
		const order = Object.keys(ROUND_THEMES)
			.map(Number)
			.sort((a, b) => a - b)
			.map((round) => ROUND_THEMES[round].kind);
		for (let index = 1; index < order.length; index++) {
			expect(order[index] === "general" && order[index - 1] === "general").toBe(false);
		}
	});

	it("ends on a RoyDavinci round", () => {
		const lastRound = QUESTIONS[QUESTIONS.length - 1].round;
		expect(ROUND_THEMES[lastRound].kind).toBe("roy");
	});

	it("has a Naija slang round placed between two RoyDavinci rounds", () => {
		const slang = QUESTIONS.filter((question) => question.roundTitle === "Naija Slang");
		expect(slang).toHaveLength(5);
		const round = slang[0].round;
		expect(ROUND_THEMES[round - 1].kind).toBe("roy");
		expect(ROUND_THEMES[round + 1].kind).toBe("roy");
	});

	it("writes RoyDavinci fun facts in the first person", () => {
		for (const question of QUESTIONS) {
			if (ROUND_THEMES[question.round].kind === "roy" && question.funFact) {
				expect(question.funFact, `question ${question.id}`).not.toMatch(
					/\b(he|his|him)\b/i,
				);
			}
		}
	});
});
