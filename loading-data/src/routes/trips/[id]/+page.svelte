<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const { data } = $props();

	const activeIndex = $derived(data.trips.findIndex((candidate) => candidate.id === data.trip.id));
	const previousTrip = $derived(activeIndex > 0 ? data.trips[activeIndex - 1] : null);
	const nextTrip = $derived(
		activeIndex !== -1 && activeIndex < data.trips.length - 1 ? data.trips[activeIndex + 1] : null
	);
	const toTripHref = (id: string) => `/trips/${encodeURIComponent(id)}`;
	const pagination = $derived(data.pagination);
	const pageNumbers = $derived(
		pagination ? Array.from({ length: pagination.totalPages }, (_value, index) => index + 1) : []
	);
	const toEntriesPageHref = (page: number) => `?page=${page}`;
	const accordionEntries = $derived(
		data.entries.map((entry, index) => ({
			...entry,
			disclosureId: `entry-${entry.id ?? index}`
		}))
	);
</script>

<section class="mx-auto flex max-w-3xl flex-col gap-4 text-slate-700">
	<h1 class="text-3xl font-semibold text-slate-900">{data.trip?.destination ?? 'Trip'}</h1>
	{#if data.trip?.destination}
		<p class="text-base">Planning a journey to {data.trip.destination}.</p>
	{/if}
</section>

<section class="bg-white">
	<div class="mx-auto max-w-3xl px-0 py-10 sm:py-12">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Photos</h2>
			{#await data.photos}
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

<section class="bg-white">
	<div class="mx-auto max-w-3xl px-0 py-10 sm:py-12">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Entries</h2>
			{#if accordionEntries.length > 0}
				<dl class="mt-10 divide-y divide-slate-200">
					{#each accordionEntries as entry, index (entry.disclosureId)}
						<div class="py-6 first:pt-0 last:pb-0">
							<dt>
								<button
									type="button"
									command="--toggle"
									commandfor={entry.disclosureId}
									class="flex w-full items-start justify-between text-left text-slate-900"
								>
									<span class="text-base leading-7 font-semibold">
										{entry.title ?? 'Untitled entry'}
									</span>
									<span class="ml-6 flex h-7 items-center">
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											data-slot="icon"
											aria-hidden="true"
											class="h-6 w-6 in-aria-expanded:hidden"
										>
											<path d="M12 6v12m6-6H6" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											data-slot="icon"
											aria-hidden="true"
											class="h-6 w-6 not-in-aria-expanded:hidden"
										>
											<path d="M18 12H6" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</span>
								</button>
							</dt>
							<el-disclosure id={entry.disclosureId} hidden={index !== 0} class="contents">
								<dd class="mt-2 pr-12">
									<p class="text-base leading-7 text-slate-600">
										{entry.description ?? 'No details provided for this entry yet.'}
									</p>
								</dd>
							</el-disclosure>
						</div>
					{/each}
				</dl>
				{#if pagination && pageNumbers.length > 1}
					<nav
						class="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600"
					>
						<a
							href={pagination.hasPreviousPage
								? toEntriesPageHref(pagination.currentPage - 1)
								: undefined}
							class="inline-flex items-center gap-2 rounded-md px-3 py-2 font-semibold transition hover:bg-slate-100 hover:text-slate-900"
							class:opacity-50={!pagination.hasPreviousPage}
							class:pointer-events-none={!pagination.hasPreviousPage}
							aria-disabled={!pagination.hasPreviousPage}
							tabindex={pagination.hasPreviousPage ? undefined : -1}
							data-sveltekit-noscroll
						>
							<span>Previous</span>
						</a>
						<ul class="flex items-center gap-1">
							{#each pageNumbers as page (page)}
								{@const isCurrent = pagination.currentPage === page}
								<li>
									{#if isCurrent}
										<span
											class="inline-flex min-w-10 justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
										>
											{page}
										</span>
									{:else}
										<a
											href={toEntriesPageHref(page)}
											data-sveltekit-noscroll
											class="inline-flex min-w-10 justify-center rounded-md px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
										>
											{page}
										</a>
									{/if}
								</li>
							{/each}
						</ul>
						<a
							href={pagination.hasNextPage
								? toEntriesPageHref(pagination.currentPage + 1)
								: undefined}
							class="inline-flex items-center gap-2 rounded-md px-3 py-2 font-semibold transition hover:bg-slate-100 hover:text-slate-900"
							class:opacity-50={!pagination.hasNextPage}
							class:pointer-events-none={!pagination.hasNextPage}
							aria-disabled={!pagination.hasNextPage}
							tabindex={pagination.hasNextPage ? undefined : -1}
							data-sveltekit-noscroll
						>
							<span>Next</span>
						</a>
					</nav>
				{/if}
			{:else}
				<p class="mt-6 text-sm text-slate-600">No entries recorded for this trip yet.</p>
			{/if}
		</div>
	</div>
	<button
		class="flex flex-col items-end gap-1 rounded-md px-3 py-2 text-right transition hover:bg-slate-100 hover:text-slate-900"
		onclick={() => {
			const params = new URLSearchParams(page.url.searchParams);
			params.set('sort', crypto.randomUUID());
			goto(`?${params.toString()}`, { noScroll: true });
		}}>Sort</button
	>
</section>

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
