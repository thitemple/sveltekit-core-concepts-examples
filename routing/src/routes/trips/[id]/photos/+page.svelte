<script lang="ts">
	import { page } from "$app/state";
</script>

<h2 class="font-bold">Photos from a trip {page.params.id}</h2>

<a class="text-cyan-700 underline hover:bg-cyan-50" href="/trips/{page.params.id}">Back</a>
