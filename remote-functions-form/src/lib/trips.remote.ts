import { query } from "$app/server";
import {
	getAllTrips,
	getEntries,
	getPhotos,
	getTripById,
	getPaginatedTrips as getPaginatedTripsFromDb,
	getTripActivityStats,
} from "./server/trips";
import * as v from "valibot";

export const getTrips = query(async () => {
	console.log(`🏖️ Getting all trips 📍`);
	return getAllTrips();
});

export const getTripPhotos = query(v.string(), async (tripId) => {
	console.log(`📸 Getting photos remotely for ${tripId}`);
	return getPhotos(tripId);
});

export const getTripEntries = query(
	v.object({ tripId: v.string(), page: v.string() }),
	async ({ tripId, page }) => {
		console.log(`📓 Getting entries remotely for ${tripId}`);
		const requestedPage = Number(page ?? 1);
		const currentPage = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;

		return getEntries(tripId, {
			current: currentPage,
		});
	},
);

export const getTrip = query(v.string(), async (tripId) => {
	console.log(`🏖️ Getting trip remotely for ${tripId}📍`);
	return getTripById(tripId);
});

export const getPaginatedTrips = query(
	v.object({
		page: v.optional(v.number()),
		size: v.optional(v.number()),
	}),
	async ({ page = 1, size = 6 } = {}) => {
		console.log(`📄 Getting trips remotely (page=${page}, size=${size})`);
		return await getPaginatedTripsFromDb({ page, size });
	},
);

export const getTripStats = query.batch(v.string(), async (tripIds) => {
	console.log(`📊 Getting trip stats for ${tripIds.length} trips`);
	const statsByTripId = await getTripActivityStats(tripIds);

	return (tripId: string) =>
		statsByTripId.get(tripId) ?? {
			tripId,
			entryCount: 0,
			photoCount: 0,
		};
});
