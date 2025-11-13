<script lang="ts">
	let { form } = $props();
</script>

<div class="max-w-lg space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Create a Trip</h1>
		<p class="mt-1 text-sm text-slate-600">Add a destination to start planning a new adventure.</p>
	</div>
	<form class="space-y-5" method="POST">
		<div class="space-y-2">
			<label for="destination" class="block text-sm font-medium text-slate-700">Destination</label>
			<input
				id="destination"
				name="destination"
				type="text"
				value={form?.destination}
				placeholder="e.g. Kyoto, Japan"
				required
				class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
			/>
		</div>
		{#if form?.errors.destination}
			<p class="text-sm text-red-600">{form.errors.destination}</p>
		{/if}
		<button
			type="submit"
			class="inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
		>
			Create trip
		</button>
	</form>
</div>
