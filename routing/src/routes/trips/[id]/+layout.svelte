<script lang="ts">
	import { page } from "$app/state";

	const { children, data } = $props();
</script>

<h1 class="text-2xl font-bold">Trip: {data.trip.destination}</h1>

{@render children?.()}
