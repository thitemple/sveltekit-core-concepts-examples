export function formatDate(value: number | null | undefined) {
	if (!value) return "Date TBD";
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}
