import { asc, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "../db/index";
import { entry, photo, trip } from "../db/schema";
import { delay } from "$lib/delay";

const DEFAULT_ENTRY_PAGE_SIZE = 10;
const DEFAULT_ENTRY_PAGE = 1;
const DEFAULT_TRIPS_PAGE_SIZE = 6;
const DEFAULT_TRIPS_PAGE = 1;
const RECENT_TRIPS_LIMIT = 10;

export type PageOptions = {
	size?: number;
	current?: number;
};

export async function getAllTrips() {
	return db.select().from(trip).orderBy(desc(trip.startDate), asc(trip.destination));
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

export async function getEntry(entryId: string) {
	const [singleEntry] = await db
		.select()
		.from(entry)
		.where(eq(entry.id, entryId))
		.limit(1)
		.execute();

	return singleEntry;
}

export async function getEntries(tripId: string, page?: PageOptions) {
	const pageSize = Math.max(1, page?.size ?? DEFAULT_ENTRY_PAGE_SIZE);
	const requestedPage = Math.max(1, page?.current ?? DEFAULT_ENTRY_PAGE);

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
			hasPreviousPage: currentPage > 1 && total > 0,
		},
	};
}

export type TripPageOptions = {
	page?: number;
	size?: number;
};

export async function getPaginatedTrips(options?: TripPageOptions) {
	const pageSize = Math.max(1, options?.size ?? DEFAULT_TRIPS_PAGE_SIZE);
	const requestedPage = Math.max(1, options?.page ?? DEFAULT_TRIPS_PAGE);

	const [aggregate] = await db.select({ count: count() }).from(trip).execute();
	const total = Number(aggregate?.count ?? 0);
	const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
	const effectiveTotalPages = total === 0 ? 1 : totalPages;
	const currentPage = Math.min(requestedPage, effectiveTotalPages);
	const offset = (currentPage - 1) * pageSize;

	const trips = await db
		.select()
		.from(trip)
		.orderBy(desc(trip.startDate), asc(trip.destination))
		.limit(pageSize)
		.offset(offset)
		.execute();

	return {
		trips,
		pagination: {
			currentPage,
			pageSize,
			totalTrips: total,
			totalPages,
			hasNextPage: currentPage < totalPages,
			hasPreviousPage: currentPage > 1 && total > 0,
		},
	};
}

export async function getRecentTrips(limit = RECENT_TRIPS_LIMIT) {
	const take = Math.max(1, limit);

	return db
		.select()
		.from(trip)
		.orderBy(desc(trip.startDate), asc(trip.destination))
		.limit(take)
		.execute();
}

export type TripActivityStat = {
	tripId: string;
	entryCount: number;
	photoCount: number;
};

export async function getTripActivityStats(
	tripIds: string[],
): Promise<Map<string, TripActivityStat>> {
	if (tripIds.length === 0) return new Map();

	const entryCounts = await db
		.select({ tripId: entry.tripId, entryCount: count(entry.id) })
		.from(entry)
		.where(inArray(entry.tripId, tripIds))
		.groupBy(entry.tripId)
		.execute();

	const photoCounts = await db
		.select({ tripId: photo.tripId, photoCount: count(photo.id) })
		.from(photo)
		.where(inArray(photo.tripId, tripIds))
		.groupBy(photo.tripId)
		.execute();

	const counts = new Map<string, TripActivityStat>(
		tripIds.map((tripId) => [tripId, { tripId, entryCount: 0, photoCount: 0 }]),
	);

	for (const entryCount of entryCounts) {
		if (!entryCount.tripId) continue;
		const current = counts.get(entryCount.tripId);
		if (current) current.entryCount = Number(entryCount.entryCount ?? 0);
	}

	for (const photoCount of photoCounts) {
		if (!photoCount.tripId) continue;
		const current = counts.get(photoCount.tripId);
		if (current) current.photoCount = Number(photoCount.photoCount ?? 0);
	}

	return counts;
}
