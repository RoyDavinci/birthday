export function formatAmountInput(value: string): string {
	const trimmed = value.trim();
	if (!trimmed || /[a-z]/i.test(trimmed)) return value;
	const hasCurrency = trimmed.startsWith("₦");
	const digits = trimmed.replace(/[₦,\s]/g, "");
	if (!/^\d+$/.test(digits)) return value;
	return `${hasCurrency ? "₦" : ""}${Number(digits).toLocaleString("en-NG")}`;
}

