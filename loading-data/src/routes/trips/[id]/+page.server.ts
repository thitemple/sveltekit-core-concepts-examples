import { getEntries, getPhotos, getTripById } from '$lib/server/trips';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
	const requestedPage = Number(url.searchParams.get('page') ?? '1');
	const currentPage = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;

	const photos = getPhotos(params.id);
	const trip = await getTripById(params.id);
	const entriesResult = await getEntries(params.id, {
		current: currentPage
	});

	if (!trip) {
		error(404, 'Trip not found');
	}

	return { trip, entries: entriesResult.entries, pagination: entriesResult.pagination, photos };
}
