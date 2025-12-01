<script lang="ts">
	import { page } from "$app/state";
	import { getPaginatedTrips, getTripStats } from "$lib/trips.remote";

	let currentPage = $state(1);

	$effect(() => {
		const raw = page.url.searchParams.get("page") ?? "1";
		const value = Number(raw);
		if (!Number.isFinite(value)) {
			currentPage = 1;
		} else {
			currentPage = Math.max(1, Math.floor(value));
		}
	});

	const paginated = $derived(
		await getPaginatedTrips({
			page: currentPage,
		}),
	);
	const trips = $derived(paginated.trips ?? []);
	const pagination = $derived(paginated.pagination);

	const pageNumbers = $derived(
		pagination ? Array.from({ length: pagination.totalPages }, (_, index) => index + 1) : [],
	);

	const toPageHref = (page: number) => `?page=${page}`;

	const formatDate = (value?: number | null) => {
		if (!value) return "Date TBD";
		return new Intl.DateTimeFormat("en", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(new Date(value));
	};

	const formatDateRange = (start?: number | null, end?: number | null) => {
		if (!start && !end) return "Schedule coming soon";
		if (start && !end) return `${formatDate(start)} — open ended`;
		if (!start && end) return `Open start — ${formatDate(end)}`;
		return `${formatDate(start)} → ${formatDate(end)}`;
	};

	const showingStart = $derived(
		pagination && pagination.totalTrips > 0
			? (pagination.currentPage - 1) * pagination.pageSize + 1
			: 0,
	);

	const showingEnd = $derived(
		pagination && pagination.totalTrips > 0
			? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalTrips)
			: 0,
	);
</script>

<section class="mx-auto flex max-w-5xl flex-col gap-6 text-slate-700">
	<header class="flex flex-wrap items-start justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold text-slate-900">Trips overview</h1>
			<p class="text-sm text-slate-600">
				Browse trips by most recent start date. Cards batch-load stats via <code>query.batch</code> so
				each page only triggers one stats request.
			</p>
		</div>
	</header>

	<svelte:boundary>
		{#if trips.length === 0}
			<div
				class="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center text-slate-600"
			>
				<p class="text-base font-semibold text-slate-800">No trips yet</p>
				<p class="mt-1 text-sm">
					Create a trip to see it appear here with its entry and photo counts.
				</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each trips as trip (trip.id)}
					<article
						class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100"
					>
						<div class="flex items-start justify-between gap-3">
							<div class="space-y-1">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
									Destination
								</p>
								<p class="text-lg leading-tight font-semibold text-slate-900">{trip.destination}</p>
								<p class="text-sm text-slate-600">
									{formatDateRange(trip.startDate, trip.endDate)}
								</p>
							</div>
							<div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
								{formatDate(trip.startDate)}
							</div>
						</div>

						<div class="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
							{#await getTripStats(trip.id)}
								<p class="text-slate-500">Loading stats…</p>
							{:then stats}
								<p class="space-x-1">
									<span class="font-semibold">{stats.entryCount}</span>
									<span>entries</span>
									<span aria-hidden="true">•</span>
									<span class="font-semibold">{stats.photoCount}</span>
									<span>photos</span>
								</p>
							{:catch error}
								<p class="text-red-600">
									Could not load stats: {error?.message ?? "Unknown error"}
								</p>
							{/await}
						</div>

						<div class="mt-4 flex items-center justify-between text-sm">
							<a
								href={`/trips/${trip.id}`}
								class="inline-flex items-center gap-1 font-semibold text-cyan-700 transition hover:text-cyan-900"
								data-sveltekit-reload
							>
								View trip
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									class="h-4 w-4"
								>
									<path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</a>
							<p class="text-slate-500">
								ID: <span class="font-mono text-xs">{trip.id}</span>
							</p>
						</div>
					</article>
				{/each}
			</div>

			{#if pagination && pageNumbers.length > 1}
				<div
					class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
				>
					<p>
						Showing {showingStart}-{showingEnd} of {pagination.totalTrips} trips
					</p>
					{#key pagination.currentPage}
						<nav class="flex items-center gap-2">
							<a
								href={pagination.hasPreviousPage
									? toPageHref(pagination.currentPage - 1)
									: undefined}
								class="inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-semibold transition hover:bg-slate-100 hover:text-slate-900"
								class:opacity-50={!pagination.hasPreviousPage}
								class:pointer-events-none={!pagination.hasPreviousPage}
								aria-disabled={!pagination.hasPreviousPage}
								data-sveltekit-noscroll
							>
								<span>Previous</span>
							</a>
							<ul class="flex items-center gap-1">
								{#each pageNumbers as pageNumber (pageNumber)}
									{@const isCurrent = pagination.currentPage === pageNumber}
									<li>
										{#if isCurrent}
											<span
												class="inline-flex min-w-10 justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
											>
												{pageNumber}
											</span>
										{:else}
											<a
												href={toPageHref(pageNumber)}
												class="inline-flex min-w-10 justify-center rounded-md px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
												data-sveltekit-noscroll
											>
												{pageNumber}
											</a>
										{/if}
									</li>
								{/each}
							</ul>
							<a
								href={pagination.hasNextPage ? toPageHref(pagination.currentPage + 1) : undefined}
								class="inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-semibold transition hover:bg-slate-100 hover:text-slate-900"
								class:opacity-50={!pagination.hasNextPage}
								class:pointer-events-none={!pagination.hasNextPage}
								aria-disabled={!pagination.hasNextPage}
								data-sveltekit-noscroll
							>
								<span>Next</span>
							</a>
						</nav>
					{/key}
				</div>
			{/if}
		{/if}
	</svelte:boundary>
</section>
