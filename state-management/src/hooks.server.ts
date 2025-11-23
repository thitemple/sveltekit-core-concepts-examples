export async function handle({ event, resolve }) {
	console.log('DAS event.request', event.request);

	return await resolve(event);
}
