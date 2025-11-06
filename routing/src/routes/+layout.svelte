<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
	<div class="flex items-center justify-between px-6 py-4">
		<a href="/trips" class="text-sm font-semibold text-slate-700 hover:text-slate-900">All trips</a>
		<a
			href="/trips/new"
			class="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
		>
			New trip
		</a>
	</div>
</header>

{@render children?.()}
