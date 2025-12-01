<script lang="ts">
	import { getTripPhotos } from "$lib/trips.remote";

  const {tripId}: {tripId: string} = $props();

</script>
<section class="bg-white">
	<div class="mx-auto max-w-3xl px-0 py-10 sm:py-12">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Photos</h2>
			{#await getTripPhotos(tripId)}
				<div
					class="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-slate-600"
				>
					<svg
						class="h-6 w-6 animate-spin text-slate-500"
						viewBox="0 0 24 24"
						fill="none"
						role="status"
						aria-hidden="true"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							d="M4 12a8 8 0 018-8"
							stroke="currentColor"
							stroke-width="4"
							stroke-linecap="round"
						/>
					</svg>
					<p class="text-sm font-medium">Loading photos…</p>
				</div>
			{:then photos}
				{#if photos.length > 0}
					<ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
						{#each photos as photo (photo.id)}
							<li>
								<figure
									class="relative flex h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
								>
									<img
										src={photo.url ?? ''}
										alt={photo.caption ?? 'Trip photo'}
										class="h-full w-full object-cover transition duration-200"
										loading="lazy"
									/>
									{#if photo.caption}
										<figcaption
											class="absolute inset-x-0 bottom-0 bg-slate-900/70 px-2 py-1 text-left text-xs font-medium text-white"
										>
											{photo.caption}
										</figcaption>
									{/if}
								</figure>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-6 text-sm text-slate-600">No photos uploaded for this trip yet.</p>
				{/if}
			{/await}
		</div>
	</div>
</section>