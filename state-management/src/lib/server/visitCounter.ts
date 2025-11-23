const visitCounts = new Map<string, number>();

export function incrementVisitCounter(tripId: string): number {
	let counter = 1;
	const current = visitCounts.get(tripId);

	if (current) {
		counter = counter + current;
	}

	visitCounts.set(tripId, counter);

	return counter;
}
