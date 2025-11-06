import { json } from "@sveltejs/kit";
import { trips as tripsData } from "$lib/data";

export async function GET({ params }) {
	const trip = await Promise.resolve(tripsData.find((trip) => trip.id === Number(params.id)));

	return json({ trip });
}
