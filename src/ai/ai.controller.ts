import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Query,
  Request,
  Body,
} from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  getAiRes(@Body() body: { msgContent: string; threadId: string }) {
    const { msgContent, threadId } = body;
    return this.aiService.getAiRes(msgContent, threadId);
  }

  @Get("search")
  searchEmbedding(@Body() body: { searchText: string; threadId: string }) {
    const { searchText, threadId } = body;
    return this.aiService.cosineSimilaritySearch(searchText, threadId);
  }

  @Get("generate-embedding")
  generateEmbedding(@Body() body: { searchText: string; threadId: string }) {
    const { searchText, threadId } = body;
    return this.aiService.generateEmbedding(searchText);
  }
}
