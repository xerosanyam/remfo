import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

// picks value from .env
export const turso_client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(turso_client,
	// { logger: true }
);

import { activityTable, cardTable } from "$lib/db/turso.schema";

async function insertActivityFromCards() {
	// Fetch all rows from the card table
	const cards = await db.select().from(cardTable).all();

	// Loop through each card and insert rows into the activity table
	for (const card of cards) {
		const activityInsertData = {
			userId: card.userId,
			cardId: card.id,
		};

		// Insert activity for creation
		await db.insert(activityTable).values({
			id: crypto.randomUUID(),
			action: 'INSERT',
			createdAt: card.createdAt,
			...activityInsertData,
		});

		// If createdAt and updatedAt are different, insert activity for update
		if (card.createdAt !== card.updatedAt) {
			await db.insert(activityTable).values({
				id: crypto.randomUUID(),
				action: 'UPDATE',
				createdAt: card.updatedAt,
				...activityInsertData,
			});
		}
	}
}

// Run the script
insertActivityFromCards()
	.then(() => console.log('Activity records inserted successfully.'))
	.catch((error) => console.error('Error inserting activity records:', error));
