import { Module } from "@nestjs/common";
import { ParticipantsService } from "./participants.service";
import { ParticipantsController } from "./participants.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Participants } from "src/db/models/participants.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Participants])],
  controllers: [ParticipantsController],
  exports: [ParticipantsService],
  providers: [ParticipantsService],
})
export class ParticipantsModule {}
