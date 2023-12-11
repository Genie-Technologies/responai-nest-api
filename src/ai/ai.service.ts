import { Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository, Not } from "typeorm";
import { codeBlock, oneLine } from "common-tags";
import { CreateEmbeddingResponse } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessageParam } from "openai/resources";

import { Messages } from "src/db/models/messages.entity";
import openai, { openai2 } from "./ai.config";
import { ChatMessage, MsgEmbdngContext } from "./types";

@Injectable()
export class AiService {
  constructor(
    @InjectEntityManager("vectordbConnection")
    private entityManager: EntityManager,

    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}

  USER_NOT_FOUND = "User not found";
  INVALID_UUID = "Invalid UUID";

  async saveMsgsEmbdgs(threadId) {
    try {
      const msgs = await this.messagesRepository.find({
        where: { threadId, embedded: false },
      });

      if (!msgs || msgs.length === 0) {
        return { msgs, text: "No messages to embed" };
      }

      const embeddings = await this.generateEmbedding(msgs);
      const msgsEmbdgs = this.pairEmbdgsWithMsgs(embeddings, msgs);
      const savedEmbeddings = await this.saveEmbedding(msgsEmbdgs);

      if (savedEmbeddings && savedEmbeddings.length > 0) {
        // Now I need to update all the msgs with the embedded property set to true
        const msgIds = msgs.map((msg) => msg.id);
        const updateResult = await this.messagesRepository
          .createQueryBuilder()
          .update(Messages)
          .set({ embedded: true })
          .where("id IN (:...msgIds)", { msgIds })
          .execute();

        return updateResult;
      } else {
        throw new Error("Error saving embeddings");
      }
    } catch (err) {
      console.log("Error saving embeddings:", err);
    }
  }

  async generateEmbedding(msgContent: string | Messages[]) {
    // TODO: can add in counting the amount of tokens later because the openai embedding
    // endpoint only accepts up to 8192 tokens per request.
    let tokenizedMsgContent;

    if (Array.isArray(msgContent)) {
      tokenizedMsgContent = msgContent.map((msg) =>
        msg.message.trim().replace(/\n/g, " "),
      );
    } else {
      // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
      tokenizedMsgContent = msgContent.trim().replace(/\n/g, " ");
    }

    try {
      const res = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: tokenizedMsgContent,
      });

      const { data }: CreateEmbeddingResponse = await res.json();
      return data; // ?.data?.data[0].embedding;
    } catch (err) {
      console.log(err);
    }
  }

  pairEmbdgsWithMsgs(
    embeddings: { object: string; embedding: number[]; index: number }[],
    msgs: Messages[],
  ): MsgEmbdngContext[] {
    // @ts-ignore
    return embeddings.map((embdgObj) => {
      return {
        embedding: JSON.stringify(embdgObj.embedding),
        msg: msgs[embdgObj.index].message,
        thread_id: msgs[embdgObj.index].threadId,
      };
    });
  }

  // write function to to save the embedding to the database
  async saveEmbedding(msgWithEmbdg: MsgEmbdngContext[]) {
    console.log("Saving embedding to database", msgWithEmbdg.length);

    // TODO: this wouldn't work passing an array to the query builder to insert
    const res = await Promise.all(
      msgWithEmbdg.map(async (msg) => {
        return await this.entityManager
          .createQueryBuilder()
          .insert()
          .into("messages")
          .values(msg)
          .execute();
      }),
    );

    return res;
  }

  async cosineSimilaritySearch(searchText: string, threadId: string) {
    try {
      const res = await this.generateEmbedding(searchText);
      return await this.entityManager
        .createQueryBuilder()
        .select()
        .from("messages", "m")
        .where("m.thread_id = :threadId", { threadId })
        .orderBy(`m.embedding <-> '${JSON.stringify(res[0].embedding)}'`)
        .limit(100)
        .execute();
    } catch (err) {
      console.log("Error in cosineSimilaritySearch:", err);
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
    msgHistory?: ChatMessage[],
  ) {
    let promptContent = "";
    if (searchResults && searchResults.length > 0) {
      promptContent = searchResults.reduce((acc, curr) => {
        return acc + curr.msg + "\n---\n";
      }, "");
    }

    const chatHistory = this.chatHistoryToString(msgHistory);

    return codeBlock`
      ${oneLine`
      You are a master at social communication and will be assisting users for a chat application.
      You will respond to the user's questions and inquiries. Use the relavent messages below between users in a chat room to give you context, when needed.
      You can also use the chat history between you and the user to give you context, when needed as well. References to "this chat" or "this thread" will refer to the chat room history, not history between you and the user.
      Answer user questions, which may be related or unlrelated to the chat history, give your insights and analysis from your knowledge and experience.
      Take your time to answer the user's questions and inquiries, carefully curating your responses.
      `}

      Examples:
        prompt: "hello?"
        response: "Hi, how can I help you?"

        prompt: "Can you summarize the chat history for me?"
        response: "Sure, here is a summary of the chat history: ..."


      Relavent Messages in a chat room to give you context:
      ${promptContent}


      Question: """
      ${msgContent}
      """
    `;

    // Messages between the user and the chat assistant:
    //   ${chatHistory}
  }

  getLastUserMsg = (msgsObj) => {
    for (let i = msgsObj.messages.length - 1; i >= 0; i--) {
      const msg = msgsObj.messages[i];
      if (msg.role === "user" && msg.content !== "") {
        return msg;
      }
    }
  };

  chatHistoryToString = (msgs: ChatMessage[]) => {
    return msgs.map((obj) => JSON.stringify(obj)).join(", ");
  };

  async chatCompletionRequest(
    msgsObj: { threadId?: string; messages: ChatMessage[] },
    res,
  ) {
    // First we need to do a similarity search on the last user message that was sent and that is the last item in the messages array
    // in the msgsObj.messages property and with the role == 'user'.
    // Then we need to compile the prompt content with the messages array and the similarity search result.

    let searchResults;
    const lastUserMsg = this.getLastUserMsg(msgsObj);

    if (msgsObj.threadId) {
      searchResults = await this.cosineSimilaritySearch(
        lastUserMsg.content,
        msgsObj.threadId,
      );
    }

    const promptContent = this.compilePrompContent(
      searchResults,
      lastUserMsg.content,
      msgsObj.messages,
    );

    const chatMessage: ChatCompletionMessageParam = {
      role: "user",
      content: promptContent,
    };

    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [chatMessage],
        // max_tokens: 512,
        // temperature: 0.2,
      });
      const stream = OpenAIStream(response);
      const streamingRes = new StreamingTextResponse(stream).body;
      const reader = streamingRes.getReader();

      return this.readAndWriteStream(reader, res);
    } catch (err) {
      console.log("Error in chatCompletionRequest: ", err);
    }
  }

  async readAndWriteStream(reader, response) {
    reader
      .read()
      .then(({ done, value }) => {
        if (done) {
          response.end();
          return;
        }
        response.write(value);
        this.readAndWriteStream(reader, response); // Read next chunk
      })
      .catch((error) => {
        console.error("Stream reading error:", error);
        response.status(500).send("Error while reading stream");
      });
  }
}
