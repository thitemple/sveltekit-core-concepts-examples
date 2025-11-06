<div class="container mx-auto space-y-4">
	<h1 class="text-2xl font-bold">Create a new trip</h1>
	<form>
		<div class="space-y-12 sm:space-y-16">
			<div>
				<h2 class="text-base/7 font-semibold text-gray-900">New trip</h2>
				<p class="mt-1 max-w-2xl text-sm/6 text-gray-600">Your latest awesome trip!</p>

				<div
					class="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0"
				>
					<div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
						<label for="username" class="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
							>Destination</label
						>
						<div class="mt-2 sm:col-span-2 sm:mt-0">
							<div
								class="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-cyan-600 sm:max-w-md"
							>
								<div class="shrink-0 select-none text-base text-gray-500 sm:text-sm/6"></div>
								<input
									id="destination"
									type="text"
									name="destination"
									placeholder="Dubai"
									class="block min-w-0 grow bg-white py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="mt-6 flex items-center justify-end gap-x-6">
			<button type="button" class="text-sm/6 font-semibold text-gray-900">Cancel</button>
			<button
				type="submit"
				class="shadow-xs inline-flex justify-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
				>Save</button
			>
		</div>
	</form>
</div>
