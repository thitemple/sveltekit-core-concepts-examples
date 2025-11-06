import { json } from "@sveltejs/kit";
import { trips as tripsData } from "$lib/data";

export async function GET() {
	const trips = await Promise.resolve(tripsData);

	return json({ trips });
}
