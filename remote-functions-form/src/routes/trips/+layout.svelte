<script lang="ts">
	import { page } from '$app/state';
	import { getTrips } from '$lib/trips.remote';

	let { children } = $props();

	const activeTripId = $derived(page.params.id ?? null);
	const toTripHref = (id: string) => `/trips/${encodeURIComponent(id)}`;
</script>

<div class="flex min-h-screen bg-white">
	<aside class="w-64 border-r border-slate-200 bg-slate-50">
		<div class="px-4 pt-6 pb-2">
			<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Trips</p>
		</div>
		<nav class="flex flex-col gap-1 px-2 pb-6">
			{#await getTrips() then trips}
				{#if trips.length === 0}
					<p class="px-3 py-2 text-sm text-slate-500">No trips found.</p>
				{:else}
					{#each trips as trip}
						<a
							data-sveltekit-preload-data="tap"
							href={toTripHref(trip.id)}
							class={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-200 hover:text-slate-900 ${
								trip.id === activeTripId ? 'bg-slate-200 text-slate-900' : 'text-slate-600'
							}`}
						>
							{trip.destination ?? 'Untitled trip'}
						</a>
					{/each}
				{/if}
			{/await}
		</nav>
	</aside>
	<main class="flex-1 overflow-y-auto">
	
		<div class="p-6">
			{@render children?.()}
		</div>
	</main>
</div>
