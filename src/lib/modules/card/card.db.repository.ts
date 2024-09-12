//repository; deals with how to CRUD in DB
import { cardTable, type SelectCard } from '$lib/db/turso/remfo.turso.model';
import { db } from '$lib/db/turso/turso.service';
import type { ICardRepository } from '$lib/modules/card/card.model';
import { and, count, desc, eq, lt } from 'drizzle-orm';

export class CardDBRepository implements ICardRepository {
	async create(values: { id: string; front: string; back: string; userId: string }) {
		await db.insert(cardTable).values(values);
	}

	async readByUserId(userId: string) {
		return db.select()
			.from(cardTable)
			.where(eq(cardTable.userId, userId))
			.orderBy(cardTable.nextPractice);
	}

	async readByUserIdOrderByCreated(userId: string) {
		return db.select({
			id: cardTable.id,
			front: cardTable.front,
			back: cardTable.back,
			createdAt: cardTable.createdAt
		})
			.from(cardTable)
			.where(and(
				eq(cardTable.userId, userId),
				eq(cardTable.deleted, false)))
			.orderBy(desc(cardTable.createdAt));
	}

	async readByUserIdOrderByNextPractice(userId: string) {
		return db.select({
			id: cardTable.id,
			front: cardTable.front,
			back: cardTable.back,
			createdAt: cardTable.createdAt,
			nextPractice: cardTable.nextPractice
		})
			.from(cardTable)
			.where(and(
				eq(cardTable.userId, userId),
				lt(cardTable.nextPractice, new Date()),
				eq(cardTable.deleted, false)
			))
			.orderBy(cardTable.nextPractice);
	}

	async readOneByUserId(userId: string) {
		const data = await db.select()
			.from(cardTable)
			.where(eq(cardTable.userId, userId))
			.orderBy(cardTable.nextPractice)
			.limit(1);
		return data[0] || null;
	}

	async readCountByUserId(userId: string) {
		const data = await db.select({
			count: count()
		})
			.from(cardTable)
			.where(eq(cardTable.userId, userId));
		return data[0]?.count || 0;
	}

	async deleteSoftly(cardId: string, userId: string) {
		await db.update(cardTable)
			.set({ deleted: true })
			.where(and(
				eq(cardTable.id, cardId),
				eq(cardTable.userId, userId)));
	}

	async update(cardId: string, userId: string, data: Partial<SelectCard>) {
		await db.update(cardTable)
			.set(data)
			.where(and(
				eq(cardTable.id, cardId),
				eq(cardTable.userId, userId)));
	}
}
