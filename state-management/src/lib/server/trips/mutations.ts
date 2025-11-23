import { eq } from 'drizzle-orm';

import { db } from '../db/index';
import { entry, trip } from '../db/schema';
import { delay } from '$lib/delay';

export type CreateTripValues = {
	destination: string;
	startDate?: string;
	endDate?: string;
};

export async function createTrip(values: CreateTripValues) {
	const id = crypto.randomUUID();

	await db
		.insert(trip)
		.values({
			id,
			destination: values.destination
		})
		.execute();

	return { id };
}

export type CreateEntryValues = {
	title?: string;
	description?: string;
	timestamp?: number;
};

export async function createEntry(tripId: string, values: CreateEntryValues) {
	await delay(1500);
	const record = {
		id: crypto.randomUUID().toString(),
		tripId,
		title: values.title ?? null,
		description: values.description ?? null,
		timestamp: values.timestamp ?? Date.now()
	};

	await db.insert(entry).values(record).execute();
	return record;
}

export async function deleteEntry(entryId: string) {
	await db.delete(entry).where(eq(entry.id, entryId)).execute();
}
