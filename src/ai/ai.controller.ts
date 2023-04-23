import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Query,
  Request,
} from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  getAiRes() {
    return this.aiService.getAiRes();
  }
}
