<script lang="ts">
	import type { Snapshot } from "@sveltejs/kit";

	let { form } = $props();

	let destination = $state<string>(form?.values?.destination ?? "");
	let startDate = $state<string>(form?.values?.startDate ?? "");
	let endDate = $state<string>(form?.values?.endDate ?? "");

	// Snapshot: keep the draft form values across navigations
	export const snapshot: Snapshot<{
		destination: string;
		startDate: string;
		endDate: string;
	}> = {
		capture: () => ({
			destination,
			startDate,
			endDate,
		}),
		restore: (value) => {
			destination = value.destination;
			startDate = value.startDate;
			endDate = value.endDate;
		},
	};
</script>

<div class="max-w-lg space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Create a Trip</h1>
		<p class="mt-1 text-sm text-slate-600">Add a destination to start planning a new adventure.</p>
	</div>
	<form method="POST" class="max-w-md space-y-5">
		<div class="space-y-1">
			<label for="destination" class="text-sm font-medium text-slate-700"> Destination </label>
			<input
				id="destination"
				name="destination"
				bind:value={destination}
				class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
			/>
			{#if form?.errors?.destination}
				<p class="mt-1 text-xs text-red-600">
					{form.errors.destination}
				</p>
			{/if}
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="space-y-1">
				<label for="startDate" class="text-sm font-medium text-slate-700"> Start date </label>
				<input
					id="startDate"
					type="date"
					name="startDate"
					bind:value={startDate}
					class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
				/>
				{#if form?.errors?.startDate}
					<p class="mt-1 text-xs text-red-600">
						{form.errors.startDate}
					</p>
				{/if}
			</div>

			<div class="space-y-1">
				<label for="endDate" class="text-sm font-medium text-slate-700"> End date </label>
				<input
					id="endDate"
					type="date"
					name="endDate"
					bind:value={endDate}
					class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
				/>
			</div>
		</div>

		<button
			type="submit"
			class="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
		>
			Create trip
		</button>
	</form>
</div>
