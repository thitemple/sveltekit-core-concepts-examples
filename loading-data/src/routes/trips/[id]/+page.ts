export async function load({ data }) {
	const userSettings = JSON.parse(localStorage.getItem('settings') ?? '{}');

	// IMPORTANT: merge the server data, it's not automatic
	return { ...data, userSettings };
}
