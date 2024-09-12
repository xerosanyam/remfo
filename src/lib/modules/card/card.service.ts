// cardService.ts
import type { Difficulty } from '$lib/schemas';
import { SuperMemo2Strategy, type SpacedRepetitionStrategy } from '$lib/modules/card/supermemo';
import { CardFactory } from '$lib/modules/card/card.factory';
import { CardDBRepository } from '$lib/modules/card/card.db.repository';

export class CardService {
	private repository: CardDBRepository;
	private spacedRepetitionStrategy: SpacedRepetitionStrategy;

	constructor(repository: CardDBRepository, spacedRepetitionStrategy: SpacedRepetitionStrategy) {
		this.repository = repository;
		this.spacedRepetitionStrategy = spacedRepetitionStrategy;
	}

	async insertCard(values: { front: string; back: string; userId: string; }) {
		await this.repository.create({ id: crypto.randomUUID(), ...values });
	}

	async getCards(userId: string) {
		return this.repository.readByUserId(userId);
	}

	async getCardsOrderByCreated(userId: string) {
		return this.repository.readByUserIdOrderByCreated(userId);
	}

	async getCardsOrderByNextPractice(userId: string) {
		return this.repository.readByUserIdOrderByNextPractice(userId);
	}

	async getCard(userId: string) {
		return this.repository.readOneByUserId(userId);
	}

	async getTotalCards(userId: string) {
		return this.repository.readCountByUserId(userId);
	}

	async deleteCard({ cardId, userId }: { cardId: string; userId: string }) {
		await this.repository.deleteSoftly(cardId, userId);
	}

	async resetCard({ cardId, userId }: { cardId: string; userId: string }) {
		const initialCard = CardFactory.createInitialCard();
		await this.repository.update(cardId, userId, initialCard);
	}

	async reviewCard({ cardId, userId, difficulty }: { cardId: string; userId: string; difficulty: Difficulty }) {
		const cards = await this.repository.readByUserId(userId);
		let card = cards.find(c => c.id === cardId);

		if (card) {
			card = this.spacedRepetitionStrategy.calculate(card, difficulty);
			await this.repository.update(cardId, userId, card);
		}
	}
}

const cardDBRepository = new CardDBRepository();
const superMemo2Strategy = new SuperMemo2Strategy();
export const cardService = new CardService(cardDBRepository, superMemo2Strategy);
