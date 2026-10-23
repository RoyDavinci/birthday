import { useEffect, useState } from "react";

const QUESTION_SECONDS = 30;

export function useQuizTimer(
	deadlineAt: number | null,
	active: boolean,
): number {
	const [now, setNow] = useState(0);

	useEffect(() => {
		if (deadlineAt === null) return;
		const updateNow = () => setNow(Date.now());
		updateNow();
		if (!active) return;
		const interval = window.setInterval(updateNow, 200);
		return () => window.clearInterval(interval);
	}, [deadlineAt, active]);

	if (deadlineAt === null) return QUESTION_SECONDS;
	return Math.max(0, Math.ceil((deadlineAt - now) / 1000));
}
