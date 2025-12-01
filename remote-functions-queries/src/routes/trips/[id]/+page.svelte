<script lang="ts">
	import TripFooter from './TripFooter.svelte';
	import TripPhotos from './TripPhotos.svelte';
	import { getTrip } from '$lib/trips.remote';
	import TripEntries from './TripEntries.svelte';

	const { form, params } = $props();
	
	const trip = $derived(await getTrip(params.id));
</script>

<section class="mx-auto flex max-w-3xl flex-col gap-4 text-slate-700">
	<h1 class="text-3xl font-semibold text-slate-900">{trip?.destination ?? 'Trip'}</h1>
	{#if trip?.destination}
		<p class="text-base">Planning a journey to {trip.destination}.</p>
	{/if}
</section>

{#if params.id}
	<TripPhotos tripId={params.id} />
	<TripEntries tripId={params.id} {form} />
	<TripFooter tripId={params.id} />
{/if}