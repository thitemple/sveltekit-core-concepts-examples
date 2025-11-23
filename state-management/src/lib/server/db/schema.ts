import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trip = sqliteTable('trip', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	destination: text('destination').notNull()
});

export const entry = sqliteTable('entry', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tripId: text('trip_id').references(() => trip.id, { onDelete: 'cascade' }),
	title: text('title'),
	description: text('description'),
	timestamp: integer('timestamp')
});

export const photo = sqliteTable('photo', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tripId: text('trip_id').references(() => trip.id, { onDelete: 'cascade' }),
	url: text('url'),
	caption: text('caption')
});

export const tripRelations = relations(trip, ({ many }) => ({
	entries: many(entry),
	photos: many(photo)
}));

export const entryRelations = relations(entry, ({ one }) => ({
	trip: one(trip, {
		fields: [entry.tripId],
		references: [trip.id]
	})
}));

export const photoRelations = relations(photo, ({ one }) => ({
	trip: one(trip, {
		fields: [photo.tripId],
		references: [trip.id]
	})
}));
