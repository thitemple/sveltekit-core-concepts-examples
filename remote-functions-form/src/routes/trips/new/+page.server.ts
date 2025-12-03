import { createTrip, getTripByName } from "$lib/server/trips";
import { fail, redirect } from "@sveltejs/kit";
import * as v from "valibot";
import type { Actions } from "./$types";

const createTripSchema = v.object({
	destination: v.pipe(v.string(), v.nonEmpty("Destination is required"), v.trim()),
	startDate: v.pipe(v.string(), v.nonEmpty("Start date is required")),
	endDate: v.string(),
});

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const values = {
			destination: String(data.get("destination") ?? ""),
			startDate: String(data.get("startDate") ?? ""),
			endDate: String(data.get("endDate") ?? ""),
		};

		const parsed = v.safeParse(createTripSchema, values);
		if (!parsed.success) {
			const errors: Record<string, string> = {};
			for (const issue of parsed.issues) {
				const key = String(issue.path?.[0]?.key ?? "form");
				if (!errors[key]) errors[key] = issue.message;
			}
			return fail(400, { errors, values });
		}

		const { destination, startDate, endDate } = parsed.output;

		const existingTrip = await getTripByName(destination);

		if (existingTrip) {
			return fail(400, {
				errors: { destination: "Destination already exists" },
				values: { destination, startDate, endDate },
			});
		}

		const created = await createTrip({ destination, startDate, endDate });
		throw redirect(303, `/trips/${created.id}`);
	},
};
