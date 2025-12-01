import { createEntry, deleteEntry, getEntries, getPhotos, getTripById } from "$lib/server/trips";
import { error, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	addEntry: async ({ request, params }) => {
		const data = await request.formData();
		const title = String(data.get("title") ?? "").trim();
		const description = String(data.get("description") ?? "").trim();

		if (!title || !description) {
			return fail(400, {
				errors: { form: "Add a title and a description" },
				fields: { title, description },
			});
		}

		const entry = await createEntry(params.id, { title, description });
		return { entry };
	},

	deleteEntry: async ({ request }) => {
		const data = await request.formData();
		const entryId = String(data.get("entryId") ?? "");
		if (!entryId) {
			return fail(400, { errors: { form: "Entry not found" } });
		}

		await deleteEntry(entryId);
		return { deletedEntryId: entryId };
	},
};
