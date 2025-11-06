<script lang="ts">
	const { data } = $props();
</script>

<h1 class="text-2xl font-bold">My trips</h1>

{#snippet listItem(id: number, name: string)}
	<li class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 lg:px-8">
		<div class="flex min-w-0 gap-x-4">
			<div class="min-w-0 flex-auto">
				<p class="text-sm/6 font-semibold text-gray-900">
					<a href="/trips/{id}" class="text-cyan-600 hover:underline">
						<span class="absolute inset-x-0 -top-px bottom-0"></span>
						{name}</a
					>
				</p>
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-x-4">
			<svg
				viewBox="0 0 20 20"
				fill="currentColor"
				data-slot="icon"
				aria-hidden="true"
				class="size-5 flex-none text-gray-400"
			>
				<path
					d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd"
					fill-rule="evenodd"
				/>
			</svg>
		</div>
	</li>
{/snippet}

<p><strong>Static trips</strong></p>
<ul role="list" class="divide-y divide-gray-100">
	{@render listItem(1, "New York")}
	{@render listItem(2, "Paris")}
	{@render listItem(3, "Punta Cana")}
</ul>

<p><strong>Trips from loader</strong></p>
<ul role="list" class="divide-y divide-gray-100">
	{#each data.trips as trip}
		{@render listItem(trip.id, trip.destination)}
	{/each}
</ul>
