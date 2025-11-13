import { asc, count, desc, eq } from 'drizzle-orm';

import { db } from '../db/index';
import { entry, photo, trip } from '../db/schema';
import { delay } from '$lib/delay';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

export type PageOptions = {
	size?: number;
	current?: number;
};

export async function getAllTrips() {
	return db.select().from(trip).orderBy(asc(trip.destination));
}

export async function getTripById(id: string) {
	const [singleTrip] = await db.select().from(trip).where(eq(trip.id, id)).limit(1).execute();

	return singleTrip ? singleTrip : null;
}

export async function getTripByName(destination: string) {
	const [singleTrip] = await db
		.select()
		.from(trip)
		.where(eq(trip.destination, destination))
		.limit(1)
		.execute();

	return singleTrip ? singleTrip : null;
}

export async function getPhotos(tripId: string) {
	await delay(2000);
	return db.select().from(photo).where(eq(photo.tripId, tripId)).execute();
}

export async function getEntries(tripId: string, page?: PageOptions) {
	const pageSize = Math.max(1, page?.size ?? DEFAULT_PAGE_SIZE);
	const requestedPage = Math.max(1, page?.current ?? DEFAULT_PAGE);

	const [aggregate] = await db
		.select({ count: count() })
		.from(entry)
		.where(eq(entry.tripId, tripId))
		.execute();

	const total = Number(aggregate?.count ?? 0);
	const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
	const effectiveTotalPages = total === 0 ? 1 : totalPages;
	const currentPage = Math.min(requestedPage, effectiveTotalPages);
	const offset = (currentPage - 1) * pageSize;

	const entries = await db
		.select()
		.from(entry)
		.where(eq(entry.tripId, tripId))
		.orderBy(desc(entry.timestamp))
		.limit(pageSize)
		.offset(offset)
		.execute();

	return {
		entries,
		pagination: {
			currentPage,
			pageSize,
			totalEntries: total,
			totalPages,
			hasNextPage: currentPage < totalPages,
			hasPreviousPage: currentPage > 1 && total > 0
		}
	};
}
