<script lang="ts">
	import { page } from "$app/state";
</script>

<main
	class="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8"
>
	<h1 class="mt-4 text-pretty text-6xl font-semibold tracking-tight text-gray-900 md:text-5xl">
		Something went wrong inside trips
	</h1>

	<p class="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
		{page.error?.message}
	</p>
</main>
