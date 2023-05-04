import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { Participants } from "src/db/models/participants.entity";
import { ParticipantsService } from "./participants.service";

@Controller("participants")
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get("health")
  health() {
    return "OK";
  }

  @Get()
  getParticipants() {
    return this.participantsService.getParticipants();
  }
}
