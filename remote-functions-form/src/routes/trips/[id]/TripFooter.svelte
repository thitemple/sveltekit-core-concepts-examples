<script lang="ts">
	import { getTrips } from "$lib/trips.remote";

	const { tripId }: { tripId: string } = $props();

	const trips = $derived(await getTrips());
	const activeIndex = $derived(trips.findIndex((candidate) => candidate.id === tripId));
	const previousTrip = $derived(activeIndex > 0 ? trips[activeIndex - 1] : null);
	const nextTrip = $derived(
		activeIndex !== -1 && activeIndex < trips.length - 1 ? trips[activeIndex + 1] : null,
	);
	const toTripHref = (id: string) => `/trips/${encodeURIComponent(id)}`;
</script>

<footer
	class="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600"
>
	{#if previousTrip}
		<a
			href={toTripHref(previousTrip.id)}
			class="flex flex-col items-start gap-1 rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
		>
			<span class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Previous trip</span
			>
			<span class="text-base font-semibold text-slate-800">{previousTrip.destination}</span>
		</a>
	{:else}
		<span class="text-slate-400">No previous trip</span>
	{/if}

	{#if nextTrip}
		<a
			href={toTripHref(nextTrip.id)}
			class="flex flex-col items-end gap-1 rounded-md px-3 py-2 text-right transition hover:bg-slate-100 hover:text-slate-900"
		>
			<span class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Next trip</span>
			<span class="text-base font-semibold text-slate-800">{nextTrip.destination}</span>
		</a>
	{:else}
		<span class="text-slate-400">No next trip</span>
	{/if}
</footer>
