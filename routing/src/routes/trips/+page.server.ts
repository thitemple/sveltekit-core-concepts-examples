import { trips as tripsData } from "$lib/data";

export async function load() {
	const trips = await Promise.resolve(tripsData);

	return {
		trips
	};
}
