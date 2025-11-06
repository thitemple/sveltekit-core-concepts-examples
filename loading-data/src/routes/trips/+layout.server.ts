import { delay } from '$lib/delay';
import { getAllTrips } from '$lib/server/trips';

export async function load() {
	await delay(1000);
	const trips = await getAllTrips();
	return {
		trips
	};
}
