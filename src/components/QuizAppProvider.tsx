import type { ReactNode } from "react";
import { QuizAppContext, type QuizAppContextValue } from "./QuizAppContext";

export function QuizAppProvider({
	value,
	children,
}: {
	value: QuizAppContextValue;
	children: ReactNode;
}) {
	return <QuizAppContext.Provider value={value}>{children}</QuizAppContext.Provider>;
}
