import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { codeBlock, oneLine } from "common-tags";
import {
  ChatCompletionRequestMessage,
  CreateEmbeddingResponse,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import openai from "./ai.config";

@Injectable()
export class AiService {
  constructor(
    @InjectEntityManager("vectordbConnection")
    private entityManager: EntityManager,
  ) {}

  USER_NOT_FOUND = "User not found";
  INVALID_UUID = "Invalid UUID";

  async generateEmbedding(msgContent: string) {
    // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
    const tokenizedMsgContent = msgContent.trim().replace(/\n/g, " ");

    try {
      console.log("Getting AI response");
      const res = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: tokenizedMsgContent,
      });

      const {
        data: [{ embedding }],
      }: CreateEmbeddingResponse = await res.json();
      console.log("AI res embedding length:", embedding.length);
      return embedding; // ?.data?.data[0].embedding;
    } catch (err) {
      console.log(err);
    }
  }

  async getAiRes(msgContent: string, threadId: string) {
    try {
      const searchResults = await this.cosineSimilaritySearch(
        msgContent,
        threadId,
      );
      const prompt = this.compilePrompContent(searchResults, msgContent);
      const res = await this.completionRequest(prompt);
      return res;
    } catch (err) {
      console.log(err);
    }
  }

  // write function to to save the embedding to the database
  async saveEmbedding(
    embedding: number[],
    msgContent: string,
    threadId: string,
  ) {
    console.log("Saving embedding to database", embedding.length);
    const result = await this.entityManager
      .createQueryBuilder()
      .insert()
      .into("messages")
      .values({
        embedding: JSON.stringify(embedding),
        msg: msgContent,
        thread_id: threadId,
      })
      .execute();
    console.log("Result: ", result);
  }

  async cosineSimilaritySearch(searchText: string, threadId: string) {
    try {
      const res = await this.generateEmbedding(searchText);
      const result = await this.entityManager
        .createQueryBuilder()
        .select()
        .from("messages", "m")
        .where("m.thread_id = :threadId", { threadId })
        .orderBy(`m.embedding <-> '${JSON.stringify(res)}'`)
        .limit(100)
        .execute();

      console.log("Search Result: ", result.length);
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  compilePrompContent(
    searchResults: {
      id: string;
      thread_id: string;
      msg: string;
      embedding: string[];
    }[],
    msgContent: string,
  ) {
    const promptContent = searchResults.reduce((acc, curr) => {
      return acc + curr.msg + "\n---\n";
    }, "");

    return codeBlock`
      ${oneLine`
        You are a very enthusiastic chat assistant who loves
        to help people! Given the following messages between a group of people,
        answer the question using only that information as reference.
        If you are unsure and answer cannot be generated from the chat history, say
        "Sorry, I don't know how to help with that."
      `}

      Messages content:
      ${promptContent}

      Question: """
      ${msgContent}
      """
    `;
  }

  async completionRequest(promptContent: string) {
    const chatMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: promptContent,
    };

    try {
      const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [chatMessage],
        max_tokens: 512,
        temperature: 0.2,
        // stream: true,
      });
      const data = await res.json();
      console.log("Completion Res: ", data.choices[0].message.content);

      // Transform the response into a readable stream
      // const stream = OpenAIStream(response)
      // Return a StreamingTextResponse, which can be consumed by the client
      // return new StreamingTextResponse(stream)

      return data.choices[0].message.content;
    } catch (err) {
      console.log(err);
    }
  }
}
