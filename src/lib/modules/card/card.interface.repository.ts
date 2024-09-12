import type { SelectCard } from "$lib/db/turso/remfo.turso.model";

export interface ICardRepository {
	create(values: { id: string; front: string; back: string; userId: string }): Promise<void>;
	readByUserId(userId: string): Promise<SelectCard[]>;
	readByUserIdOrderByCreated(userId: string): Promise<Array<Partial<SelectCard>>>;
	readByUserIdOrderByNextPractice(userId: string): Promise<Array<Partial<SelectCard>>>;
	readOneByUserId(userId: string): Promise<SelectCard | null>;
	readCountByUserId(userId: string): Promise<number>;
	update(cardId: string, userId: string, data: Partial<SelectCard>): Promise<void>;
	deleteSoftly(cardId: string, userId: string): Promise<void>;
}