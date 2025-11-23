import { createTrip, getTripByName } from '$lib/server/trips';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const destination = String(data.get('destination') ?? '').trim();
		const startDate = String(data.get('startDate') ?? '').trim();
		const endDate = String(data.get('endDate') ?? '').trim();

		if (!destination) {
			return fail(400, {
				errors: { destination: 'Destination is required' },
				values: { destination, startDate, endDate }
			});
		}

		const existingTrip = await getTripByName(destination);

		if (existingTrip) {
			return fail(400, {
				errors: { destination: 'Destination already exists' },
				values: { destination, startDate, endDate }
			});
		}

		const created = await createTrip({ destination, startDate, endDate });
		throw redirect(303, `/trips/${created.id}`);
	}
};
