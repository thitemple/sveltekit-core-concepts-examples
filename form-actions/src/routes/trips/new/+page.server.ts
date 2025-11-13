import { createTrip, getTripByName } from '$lib/server/trips';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const destination = String(data.get('destination') ?? '').trim();

		if (!destination) {
			return fail(400, { errors: { destination: 'Destination is required' }, destination });
		}

		const existingTrip = await getTripByName(destination);
		if (existingTrip) {
			return fail(400, {
				errors: { destination: 'Destination already exists' },
				destination
			});
		}

		const created = await createTrip(destination || 'Untitled trip');
		throw redirect(303, `/trips/${created.id}`);
	}
};
