import type { QuizQuestion, TextQuestion } from "../types/quiz";

export function normalizeAnswer(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/node\.js/g, "nodejs")
		.replace(/react\.js/g, "reactjs")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.replace(/\s+/g, " ");
}

function parseNumberResponse(response: string): number {
	const cleaned = response
		.toLowerCase()
		.replace(/[₦,\s]/g, "")
		.replace(/naira/g, "")
		.trim();
	const match = cleaned.match(/^(-?\d+(?:\.\d+)?)(k|m|bn|thousand|million|billion)?$/);
	if (!match) return Number.NaN;
	const value = Number(match[1]);
	const multiplier = match[2];
	const factor =
		multiplier === "k" || multiplier === "thousand"
			? 1_000
			: multiplier === "m" || multiplier === "million"
				? 1_000_000
				: multiplier === "bn" || multiplier === "billion"
					? 1_000_000_000
					: 1;
	return value * factor;
}

function levenshteinDistance(a: string, b: string): number {
	const row = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (let i = 1; i <= a.length; i++) {
		let previousDiagonal = row[0];
		row[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const previous = row[j];
			row[j] = Math.min(
				row[j] + 1,
				row[j - 1] + 1,
				previousDiagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
			previousDiagonal = previous;
		}
	}
	return row[b.length];
}

function tokenMatches(token: string, candidate: string): boolean {
	if (token === candidate) return true;
	if (Math.min(token.length, candidate.length) < 5) return false;
	return levenshteinDistance(token, candidate) <= 1;
}

function matchesSynonym(response: string, synonym: string): boolean {
	const normalizedResponse = normalizeAnswer(response);
	const normalizedSynonym = normalizeAnswer(synonym);
	if (!normalizedResponse || !normalizedSynonym) return false;
	if (` ${normalizedResponse} `.includes(` ${normalizedSynonym} `)) return true;

	const answerTokens = normalizedResponse.split(" ");
	const synonymTokens = normalizedSynonym.split(" ");
	// Each meaningful synonym token must be represented; word order is irrelevant.
	return synonymTokens.every((synonymToken) =>
		answerTokens.some((answerToken) => tokenMatches(answerToken, synonymToken)),
	);
}

function removePhrase(text: string, phrase: string): string {
	const normalizedPhrase = normalizeAnswer(phrase);
	return ` ${text} `
		.replace(` ${normalizedPhrase} `, " ")
		.trim()
		.replace(/\s+/g, " ");
}

// "Name any two of these": each pool entry can be matched once, and the words
// that matched are used up so "React Native" cannot also count as "React".
function scorePool(
	pool: string[][],
	required: number,
	points: number,
	normalizedResponse: string,
): number {
	const longestSynonym = (group: string[]) =>
		Math.max(...group.map((synonym) => normalizeAnswer(synonym).length));

	let remaining = normalizedResponse;
	let matched = 0;
	for (const group of [...pool].sort(
		(a, b) => longestSynonym(b) - longestSynonym(a),
	)) {
		const hits = group
			.filter((synonym) => matchesSynonym(remaining, synonym))
			.sort((a, b) => normalizeAnswer(b).length - normalizeAnswer(a).length);
		if (hits.length) {
			matched += 1;
			remaining = removePhrase(remaining, hits[0]);
		}
	}
	return Math.round((Math.min(matched, required) / required) * points);
}

function scoreText(question: TextQuestion, response: string): number {
	const normalizedResponse = normalizeAnswer(response);
	if (!normalizedResponse) return 0;

	if (question.answerPool?.length) {
		return scorePool(
			question.answerPool,
			question.poolRequired ?? 1,
			question.points,
			normalizedResponse,
		);
	}

	if (question.answerGroups?.length) {
		const matchedGroups = question.answerGroups.filter((group) =>
			group.some((synonym) => matchesSynonym(normalizedResponse, synonym)),
		).length;
		return Math.round((matchedGroups / question.answerGroups.length) * question.points);
	}

	if (
		question.acceptedAnswers.some((answer) =>
			matchesSynonym(normalizedResponse, answer),
		)
	) {
		return question.points;
	}
	return 0;
}

function scoreNumber(
	question: Extract<QuizQuestion, { type: "number" }>,
	response: string,
): number {
	const guess = parseNumberResponse(response);
	if (!response.trim() || !Number.isFinite(guess) || guess < 0) return 0;

	if (question.range) {
		const { min, max } = question.range;
		if (guess >= min && guess <= max) return question.points;

		const distance = guess < min ? min - guess : guess - max;
		const boundary = guess < min ? min : max;
		const relativeDistance = distance / boundary;
		if (relativeDistance <= 0.02) return Math.round(question.points * 0.75);
		if (relativeDistance <= 0.05) return Math.round(question.points * 0.5);
		if (relativeDistance <= 0.1) return Math.round(question.points * 0.25);
		return 0;
	}

	if (question.correctValue === undefined) return 0;
	if (guess === question.correctValue) return question.points;

	// Small counts should be exact; a whole-number guess off by one earns partial credit.
	if (question.correctValue <= 10) {
		if (Number.isInteger(guess) && Math.abs(guess - question.correctValue) === 1) {
			return Math.round(question.points * 0.5);
		}
		return 0;
	}

	const difference = Math.abs(guess - question.correctValue) / question.correctValue;
	if (difference <= 0.02) return Math.round(question.points * 0.75);
	if (difference <= 0.05) return Math.round(question.points * 0.5);
	if (difference <= 0.1) return Math.round(question.points * 0.25);
	return 0;
}

export function scoreAnswer(question: QuizQuestion, response: string): number {
	if (!response.trim()) return 0;
	if (question.type === "choice") {
		return normalizeAnswer(response) === normalizeAnswer(question.correctAnswer)
			? question.points
			: 0;
	}
	if (question.type === "text") return scoreText(question, response);
	return scoreNumber(question, response);
}

export function getCorrectAnswer(question: QuizQuestion): string {
	if (question.type === "choice") return question.correctAnswer;
	if (question.type === "text") return question.acceptedAnswers[0];

	if (question.range) {
		return `₦${(question.range.min / 1_000_000).toFixed(0)}m–₦${(
			question.range.max / 1_000_000
		).toFixed(0)}m`;
	}
	if (question.correctValue === undefined) return "No answer configured";
	if (question.correctValue >= 1_000_000) {
		return `₦${question.correctValue.toLocaleString("en-NG")}`;
	}
	return question.correctValue.toLocaleString("en-NG");
}

export interface ResolvedAnswer {
	earned: number;
	correct: boolean;
}

// A hint halves the points, but "correct" always means full marks before it.
export function resolveAnswer(
	question: QuizQuestion,
	submitted: string,
	hintUsed: boolean,
): ResolvedAnswer {
	const raw = scoreAnswer(question, submitted);
	return {
		earned: hintUsed ? Math.round(raw / 2) : raw,
		correct: Boolean(submitted) && raw === question.points,
	};
}
