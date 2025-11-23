<script lang="ts">
	let { error, status } = $props();

	const heading = $derived(status === 404 ? 'Trip not found' : 'Something went wrong');
	const description = $derived(
		error?.message ??
			'We ran into a problem while loading this trip. You can try again or head back to all trips.'
	);
</script>

<svelte:head>
	<title>{heading}</title>
</svelte:head>

<section class="mx-auto flex max-w-xl flex-col gap-6 text-slate-700">
	<div class="flex flex-col gap-2">
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Error {status}</p>
		<h1 class="text-3xl font-semibold text-slate-900">{heading}</h1>
		<p class="text-base leading-7 text-slate-600">{description}</p>
	</div>

	{#if error?.message}
		<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
			<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Details</p>
			<p class="mt-1 text-sm leading-6 text-slate-600">{error.message}</p>
		</div>
	{/if}
</section>
