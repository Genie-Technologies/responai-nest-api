import {
  Controller,
  Get,
  Body,
  Post,
  Req,
  RawBodyRequest,
  Res,
} from "@nestjs/common";
import { Request } from "express";
import { AiService } from "./ai.service";
import { ChatMessage, MsgEmbdngContext } from "./types";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get("search")
  searchEmbedding(@Body() body: { searchText: string; threadId: string }) {
    const { searchText, threadId } = body;
    return this.aiService.cosineSimilaritySearch(searchText, threadId);
  }

  @Get("generate-embedding")
  generateEmbedding(@Body() body: { searchText: string }) {
    const { searchText } = body;
    return this.aiService.generateEmbedding(searchText);
  }

  @Post("chat")
  async chat(
    @Body() body: { threadId: string; messages: ChatMessage[] },
    @Res() res: Response,
  ) {
    return await this.aiService.chatCompletionRequest(
      // @ts-ignore
      JSON.parse(body),
      res,
    );
  }

  @Post("save-embedding")
  async saveEmbedding(@Body() req: MsgEmbdngContext[]) {
    return await this.aiService.saveEmbedding(req);
  }

  @Post("save-msgs-embeddings")
  async saveMsgEmbeddings(
    @Body()
    req: {
      threadId: string;
    },
  ) {
    return await this.aiService.saveMsgsEmbdgs(req.threadId);
  }
}
