import { getEntries, getPhotos, getTripById, createEntry, deleteEntry } from '$lib/server/trips';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load({ params, url }) {
	const requestedPage = Number(url.searchParams.get('page') ?? '1');
	const currentPage = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;

	const photos = getPhotos(params.id);

	const [trip, entriesResult] = await Promise.all([
		getTripById(params.id),
		getEntries(params.id, {
			current: currentPage
		})
	]);

	if (!trip) {
		error(404, 'Trip not found');
	}

	return { trip, entries: entriesResult.entries, pagination: entriesResult.pagination, photos };
}

export const actions: Actions = {
	addEntry: async ({ request, params }) => {
		const data = await request.formData();
		const title = String(data.get('title') ?? '').trim();
		const description = String(data.get('description') ?? '').trim();

		if (!title || !description) {
			return fail(400, {
				errors: { form: 'Add a title and a description' },
				fields: { title, description }
			});
		}

		return fail(400, {
			errors: { form: 'Just a test' },
			fields: { title, description }
		});

		const entry = await createEntry(params.id, { title, description });
		return { entry };
	},

	deleteEntry: async ({ request }) => {
		const data = await request.formData();
		const entryId = String(data.get('entryId') ?? '');
		if (!entryId) {
			return fail(400, { errors: { form: 'Entry not found' } });
		}
		await deleteEntry(entryId);
		return { deletedEntryId: entryId };
	}
};
