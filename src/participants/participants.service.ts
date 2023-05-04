import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { Participants } from "src/db/models/participants.entity";
import { Repository } from "typeorm";

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participants)
    private readonly participantsRepository: Repository<Participants>,
  ) {}

  async getParticipants() {
    return await this.participantsRepository.find();
  }

  async getParticipant(userId: string) {
    return await this.participantsRepository.find({
      where: { userId },
    });
  }

  async createParticipants(threadId: string, userIds: string[]) {
    try {
      return await Promise.all(
        userIds.map((userId) =>
          this.participantsRepository.save({
            id: randomUUID().toString(),
            threadId,
            userId,
          }),
        ),
      );
    } catch (error) {
      console.error("Error while creating participant: ", error);
      throw new Error(
        "There was an error creating the user, please try again later.",
      );
    }
  }
}
