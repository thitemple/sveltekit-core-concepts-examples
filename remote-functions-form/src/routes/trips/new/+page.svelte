<script lang="ts">
	import { goto } from "$app/navigation";
	import { createTripForm } from "$lib/trips.remote.js";
	import type { Snapshot } from "@sveltejs/kit";

	// Snapshot: keep the draft form values across navigations
	export const snapshot: Snapshot<{
		destination: string;
		startDate: string;
		endDate: string;
	}> = {
		capture: () => ({
			destination: createTripForm.fields.destination.value(),
			startDate: createTripForm.fields.startDate.value(),
			endDate: createTripForm.fields.endDate.value(),
		}),
		restore: (value) => {
			createTripForm.fields.set({
				...value,
			});
		},
	};
</script>

<div class="max-w-lg space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Create a Trip</h1>
		<p class="mt-1 text-sm text-slate-600">Add a destination to start planning a new adventure.</p>
	</div>
	<form
		{...createTripForm.enhance(async ({ form, data, submit }) => {
			try {
				await submit();
				form.reset();

				if (createTripForm.result?.success) {
					goto(`/trips/${createTripForm.result.trip.id}`);
				}
			} catch (error) {
				// show general error message
			}
		})}
		class="max-w-md space-y-5"
	>
		<div class="space-y-1">
			<label for="destination" class="text-sm font-medium text-slate-700"> Destination </label>
			<input
				{...createTripForm.fields.destination.as("text")}
				class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
			/>
			{#each createTripForm.fields.destination.issues() as issue}
				<p class="mt-1 text-xs text-red-600">
					{issue.message}
				</p>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="space-y-1">
				<label for="startDate" class="text-sm font-medium text-slate-700"> Start date </label>
				<input
					{...createTripForm.fields.startDate.as("date")}
					class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
				/>
				{#each createTripForm.fields.startDate.issues() as issue}
					<p class="mt-1 text-xs text-red-600">
						{issue.message}
					</p>
				{/each}
			</div>

			<div class="space-y-1">
				<label for="endDate" class="text-sm font-medium text-slate-700"> End date </label>
				<input
					{...createTripForm.fields.endDate.as("date")}
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
