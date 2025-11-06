import { error } from "@sveltejs/kit";
import { trips as tripsData } from "$lib/data";

export async function load({ params }) {
	const trips = await Promise.resolve(tripsData);
	const trip = trips.find((t) => t.id === +params.id);

	if (!trip) {
		error(404, "Trip not found");
	}

	return {
		trip
	};
}
