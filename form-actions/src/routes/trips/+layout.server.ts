import { getAllTrips } from '$lib/server/trips';

export async function load() {
	const trips = await getAllTrips();
	return {
		trips
	};
}
