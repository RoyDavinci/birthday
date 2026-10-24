import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../data/questions";
import { resolveAnswer, scoreAnswer } from "./scoring";

const question = (id: number) => {
	const found = QUESTIONS.find((item) => item.id === id);
	if (!found) throw new Error(`Question ${id} not found`);
	return found;
};

describe("scoreAnswer", () => {
	it("accepts reordered multi-part answers and common variants", () => {
		expect(scoreAnswer(question(8), "tea & Chinese rice")).toBe(10);
		expect(scoreAnswer(question(10), "Heineken and Nutri milk")).toBe(10);
		expect(scoreAnswer(question(27), "react.js and node.js")).toBe(10);
		expect(scoreAnswer(question(27), "python and Django")).toBe(10);
		expect(scoreAnswer(question(44), "I need money")).toBe(15);
	});

	it("awards partial credit when only one required answer part is present", () => {
		expect(scoreAnswer(question(9), "red")).toBe(3);
		expect(scoreAnswer(question(27), "React")).toBe(5);
		expect(scoreAnswer(question(14), "Naruto")).toBe(7);
	});

	it("accepts small typos without accepting unrelated words", () => {
		expect(scoreAnswer(question(43), "in and of itsel")).toBe(15);
		expect(scoreAnswer(question(43), "banana")).toBe(0);
	});

	it("requires exact small counts or gives limited credit for a one-count miss", () => {
		expect(scoreAnswer(question(28), "6")).toBe(15);
		expect(scoreAnswer(question(28), "6.5")).toBe(0);
		expect(scoreAnswer(question(49), "3")).toBe(10);
		expect(scoreAnswer(question(49), "4")).toBe(5);
		expect(scoreAnswer(question(49), "0")).toBe(0);
	});

	it("parses naira amounts and shorthand", () => {
		expect(scoreAnswer(question(32), "35m")).toBe(20);
		expect(scoreAnswer(question(32), "₦35,000,000")).toBe(20);
		expect(scoreAnswer(question(31), "18k")).toBe(20);
	});

	it("keeps the dream-house budget range out of the question prompt", () => {
		expect(question(33).prompt).not.toMatch(/50m|100m|50 million|100 million/i);
		expect(scoreAnswer(question(33), "75m")).toBe(20);
	});

	it("accepts typed answers with variants and typos, but not look-alikes", () => {
		expect(scoreAnswer(question(1), "abia")).toBe(10);
		expect(scoreAnswer(question(1), "Abia State")).toBe(10);
		expect(scoreAnswer(question(1), "Anambra")).toBe(0);
		expect(scoreAnswer(question(7), "jolof rice")).toBe(10);
		expect(scoreAnswer(question(7), "amala")).toBe(0);
		expect(scoreAnswer(question(11), "Man United")).toBe(15);
		expect(scoreAnswer(question(11), "Manchester City")).toBe(0);
		expect(scoreAnswer(question(26), "javascript")).toBe(20);
		expect(scoreAnswer(question(26), "Java")).toBe(0);
		expect(scoreAnswer(question(34), "Spain")).toBe(15);
		expect(scoreAnswer(question(34), "Croatia")).toBe(0);
		expect(scoreAnswer(question(50), "Mathias")).toBe(25);
	});

	it("scores the salary-to-car-budget ratio with partial credit for close guesses", () => {
		expect(scoreAnswer(question(54), "1944")).toBe(25);
		expect(scoreAnswer(question(54), "1950")).toBe(19);
		expect(scoreAnswer(question(54), "100")).toBe(0);
	});

	it("rewards only the false statement on boss questions", () => {
		const bosses = QUESTIONS.filter((item) => /FALSE/.test(item.prompt));
		expect(bosses).toHaveLength(5);
		for (const boss of bosses) {
			if (boss.type !== "choice") throw new Error("boss must be a choice");
			expect(scoreAnswer(boss, boss.correctAnswer)).toBe(boss.points);
			const wrong = boss.options.find((option) => option !== boss.correctAnswer)!;
			expect(scoreAnswer(boss, wrong)).toBe(0);
		}
	});

	it("scores 'any two technologies' without letting one phrase count twice", () => {
		expect(scoreAnswer(question(27), "React Native")).toBe(5);
		expect(scoreAnswer(question(27), "react and react native")).toBe(10);
		expect(scoreAnswer(question(27), "PHP, Laravel")).toBe(10);
		expect(scoreAnswer(question(27), "C# and Postgres")).toBe(10);
		expect(scoreAnswer(question(27), "Ruby and Go")).toBe(0);
	});

	it("gives per-title credit for the anime question", () => {
		expect(
			scoreAnswer(question(14), "Naruto, One Piece and Attack on Titan"),
		).toBe(20);
		expect(scoreAnswer(question(14), "naruto and one piece")).toBe(13);
		expect(scoreAnswer(question(14), "Bleach")).toBe(0);
	});

	it("treats Boston Legal as the legal-drama answer", () => {
		expect(scoreAnswer(question(13), "Boston Legal")).toBe(15);
		expect(scoreAnswer(question(13), "Suits")).toBe(0);
	});

	it("halves the points when a hint is used, but still counts it as correct", () => {
		const full = resolveAnswer(question(61), "Canberra", false);
		expect(full).toEqual({ earned: 10, correct: true });
		const hinted = resolveAnswer(question(61), "Canberra", true);
		expect(hinted).toEqual({ earned: 5, correct: true });
		expect(resolveAnswer(question(61), "Sydney", true)).toEqual({
			earned: 0,
			correct: false,
		});
		expect(resolveAnswer(question(61), "", false).correct).toBe(false);
	});

	it("scores the new general-knowledge and typed questions", () => {
		expect(scoreAnswer(question(71), "1960")).toBe(10);
		expect(scoreAnswer(question(71), "1963")).toBe(0);
		expect(scoreAnswer(question(73), "Achebe")).toBe(10);
		expect(scoreAnswer(question(73), "Soyinka")).toBe(0);
	});

	it("scores the Naija slang round", () => {
		expect(scoreAnswer(question(81), "To relocate abroad")).toBe(10);
		expect(scoreAnswer(question(81), "To start a business")).toBe(0);
		expect(scoreAnswer(question(85), "Sabi")).toBe(10);
	});

	it("keeps Q12 consistent: the beach resort is the answer", () => {
		const q12 = question(12);
		if (q12.type !== "choice") throw new Error("Q12 must be a choice question");
		expect(q12.correctAnswer).toBe("A beach resort");
		expect(q12.funFact ?? "").not.toMatch(/cubana/i);
		expect(q12.options.some((option) => /cubana/i.test(option))).toBe(false);
	});

	it("scores the Current Affairs and Roy in Real Life rounds", () => {
		expect(scoreAnswer(question(91), "Spain")).toBe(10);
		expect(scoreAnswer(question(91), "Argentina")).toBe(0);
		expect(scoreAnswer(question(95), "Navi Pillay")).toBe(10);
		expect(scoreAnswer(question(105), "Hisses and does it himself")).toBe(15);
		expect(scoreAnswer(question(105), "Reports it straight to the manager")).toBe(0);
	});
});
