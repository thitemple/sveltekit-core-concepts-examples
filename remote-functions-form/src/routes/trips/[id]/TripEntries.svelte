<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import {
		createEntryForm,
		deleteEntryCommand,
		deleteEntryForm,
		getTrip,
		getTripEntries,
	} from "$lib/trips.remote";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { ActionData } from "./$types";

	const { tripId, form }: { tripId: string; form: ActionData } = $props();

	const trip = $derived(await getTrip(tripId));

	const toPageNumber = (raw: string | null) => {
		const parsed = Number(raw ?? "1");
		return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
	};
	const clampPage = (value: number, totalPages?: number) => {
		const max = Math.max(1, totalPages ?? value ?? 1);
		return Math.min(Math.max(1, value), max);
	};
	const currentPage = $derived(toPageNumber(page.url.searchParams.get("page")));

	// local entries state
	const entriesResult = $derived(await getTripEntries({ tripId, page: String(currentPage) }));
	let entries = $state<typeof entriesResult.entries>([]);
	$effect(() => {
		entries = [...entriesResult.entries];
	});
	const accordionEntries = $derived(
		entries.map((entry, index) => ({
			...entry,
			disclosureId: `entry-${entry.id ?? index}`,
		})),
	);

	// entries pagination handling

	const pagination = $derived(entriesResult.pagination);
	const paginationCurrentPage = $derived(clampPage(currentPage, pagination?.totalPages));
	const pageNumbers = $derived(
		pagination ? Array.from({ length: pagination.totalPages }, (_, index) => index + 1) : [],
	);
	const toEntriesPageHref = (page: number) => `?page=${page}`;

	// entry dialog handling
	let addEntryDialog: HTMLDialogElement | null = null;
	let isAddEntryDialogOpen = $state(false);
	let isSavingEntry = $state(false);

	const openAddEntryDialog = () => {
		if (!addEntryDialog || addEntryDialog.open) return;
		addEntryDialog.showModal();
		isAddEntryDialogOpen = true;
	};

	const closeAddEntryDialog = () => {
		if (!addEntryDialog?.open) return;
		addEntryDialog.close();
	};

	const handleDialogClose = () => {
		isAddEntryDialogOpen = false;
	};

	// new entry optimistic update
	const handleAddEntrySubmit: SubmitFunction = ({ formData }) => {
		const newEntry = {
			id: crypto.randomUUID(),
			title: String(formData.get("title")),
			description: String(formData.get("description")),
			tripId: page.params.id!,
			timestamp: new Date().getTime(),
		} satisfies (typeof entriesResult.entries)[number];

		entries = [newEntry, ...entries];
		closeAddEntryDialog();

		return async ({ update, result }) => {
			if (result.type === "success" && result.data && "entry" in result.data) {
				const created = result.data.entry as (typeof entriesResult.entries)[number];
				entries = entries.map((entry) => (entry.id === newEntry.id ? created : entry));
			}

			if (result.type === "failure") {
				entries = entries.filter((entry) => entry.id !== newEntry.id);
			}

			await update({ invalidateAll: false });
		};
	};

	// delete entry optimistic update
	const handleDeleteEntrySubmit: SubmitFunction = ({ formData }) => {
		const entryId = String(formData.get("entryId") ?? "");
		if (!entryId) return;
		entries = entries.filter((entry) => entry.id !== entryId);
		return async ({ update }) => {
			await update();
		};
	};
</script>

<section class="bg-white">
	<div class="mx-auto max-w-3xl px-0 py-10 sm:py-12">
		<div class="mx-auto max-w-3xl">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Entries</h2>

				<button
					type="button"
					class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-400"
					aria-haspopup="dialog"
					aria-expanded={isAddEntryDialogOpen ? "true" : "false"}
					onclick={openAddEntryDialog}
				>
					<span class="sr-only">Add entry</span>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						class="h-5 w-5"
					>
						<path d="M12 6v12m6-6H6" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>

			<dialog
				class="modal-centered w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-2xl"
				bind:this={addEntryDialog}
				onclose={handleDialogClose}
				aria-modal="true"
			>
				<form
					{...createEntryForm.enhance(async ({ form, data, submit }) => {
						try {
							const newEntry = {
								title: data.title,
								description: data.description,
								tripId,
								id: crypto.randomUUID(),
								timestamp: new Date().getTime(),
							};
							await createEntryForm.validate();
							if (!createEntryForm.fields.allIssues()) {
								closeAddEntryDialog();
							}
							await submit().updates(
								getTripEntries({ tripId, page: String(currentPage) }).withOverride((result) => ({
									...result,
									entries: [newEntry, ...result.entries],
								})),
							);
							form.reset();
						} catch (error) {}
					})}
					class="space-y-5"
				>
					<input type="hidden" value={tripId} name="tripId" />
					<div class="space-y-1">
						<p class="text-lg font-semibold text-slate-900">Add entry</p>
						<p class="text-sm text-slate-500">
							Create a new memory for {trip?.destination ?? "this trip"}.
						</p>
					</div>
					<div class="space-y-2">
						<label
							class="block text-sm font-medium text-slate-700"
							for={createEntryForm.fields.title.as("text").name}>Title</label
						>
						<input
							{...createEntryForm.fields.title.as("text")}
							class="block w-full rounded border border-slate-300 px-3 py-2"
						/>
						{#each createEntryForm.fields.title.issues() as issue}
							<p class="mt-1 text-xs text-red-600">
								{issue.message}
							</p>
						{/each}
					</div>
					<div class="space-y-2">
						<label
							class="block text-sm font-medium text-slate-700"
							for={createEntryForm.fields.title.as("text").name}
						>
							Description
						</label>
						<textarea
							{...createEntryForm.fields.description.as("text")}
							class="block w-full rounded border border-slate-300 px-3 py-2"
						></textarea>
						{#each createEntryForm.fields.description.issues() as issue}
							<p class="mt-1 text-xs text-red-600">
								{issue.message}
							</p>
						{/each}
					</div>
					<div class="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							class="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
							onclick={closeAddEntryDialog}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:cursor-not-allowed disabled:opacity-80"
							disabled={!!createEntryForm.pending}
							aria-busy={!!createEntryForm.pending ? "true" : "false"}
						>
							{#if !!createEntryForm.pending}
								<svg
									class="h-4 w-4 animate-spin"
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
								<span>Saving…</span>
							{:else}
								Save entry
							{/if}
						</button>
					</div>
				</form>
			</dialog>

			{#if accordionEntries.length > 0}
				<dl class="mt-10 divide-y divide-slate-200">
					{#each accordionEntries as entry, index (entry.disclosureId)}
						<div class="py-6 first:pt-0 last:pb-0">
							<dt>
								<button
									type="button"
									command="--toggle"
									commandfor={entry.disclosureId}
									class="flex w-full cursor-pointer items-start justify-between text-left text-slate-900"
								>
									<span class="text-base leading-7 font-semibold">
										{entry.title ?? "Untitled entry"}
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
								<dd class="mt-2 space-y-5 pr-12">
									<p class="text-base leading-7 text-slate-600">
										{entry.description ?? "No details provided for this entry yet."}
									</p>
									<div class="text-right">
										<input type="hidden" name="entryId" value={entry.id} />
										<button
											onclick={async () => {
												await deleteEntryCommand({ entryId: entry.id }).updates(
													getTripEntries({ tripId, page: String(currentPage) }).withOverride(
														(currentEntriesResult) => ({
															...currentEntriesResult,
															entries: currentEntriesResult.entries.filter(
																(e) => e.id !== entry.id,
															),
														}),
													),
												);
											}}
											class="cursor-pointer text-sm text-red-600 hover:underline">Delete</button
										>
									</div>
								</dd>
							</el-disclosure>
						</div>
					{/each}
				</dl>
				{#if pagination && pageNumbers.length > 1}
					{#key `${paginationCurrentPage}-${pageNumbers.length}`}
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
					{/key}
				{/if}
			{:else}
				<p class="mt-6 text-sm text-slate-600">No entries recorded for this trip yet.</p>
			{/if}
		</div>
	</div>
</section>
