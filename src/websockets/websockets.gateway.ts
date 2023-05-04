import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { UUID, randomUUID } from "crypto";
import { Server, Socket } from "socket.io";
import { WebhookIncomingMessagePayload } from "src/constants";
import { MessagesService } from "src/messages/messages.service";
import { ThreadsService } from "src/threads/threads.service";
import { ParticipantsService } from "src/participants/participants.service";

@WebSocketGateway(3002, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly messagesService: MessagesService,
    private readonly participantsService: ParticipantsService,
  ) {}

  @WebSocketServer() server: Server;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  afterInit(server: Server) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = this.getTokenFromClient(client);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleDisconnect(client: Socket) {}

  @SubscribeMessage("incoming_message")
  async handleMessage(
    client: Socket,
    payload: WebhookIncomingMessagePayload,
  ): Promise<void> {
    // TODO: Authenticate the user

    let threadId = payload.thread_id;

    if (!threadId) {
      // Create a thread
      const thread = await this.threadsService.createThread({
        userId: payload.sender_id,
        threadName: payload.thread_name,
        createdAt: payload.timestamp,
        lastMessage: payload.message,
      });

      threadId = thread.id;

      // Enter participants into table
      await this.participantsService.createParticipants(
        threadId,
        payload.participant_user_ids,
      );
    }

    const message = {
      threadId,
      message: payload.message,
      createdAt: new Date(payload.timestamp),
      updatedAt: new Date(payload.timestamp),
      senderId: payload.sender_id,
      receiverId: payload.receiver_id,
      id: randomUUID(),
    };

    const newMessage = await this.messagesService.saveMessage(message);

    // Send the message to the room

    payload.participant_user_ids.forEach((id) => {
      this.server.to(id).emit(`received_message_${id}`, newMessage);
    });
  }

  @SubscribeMessage("join")
  handleJoin(client: Socket, payload: any): void {
    client.join(payload.room);
    this.server.to(payload.room).emit("received_message", {
      message: `User ${client.id} joined ${payload.room}`,
    });
  }

  @SubscribeMessage("join_home")
  handleJoinHome(client: Socket, payload: any): void {
    client.join(payload.user_id);
    this.server
      .to(payload.user_id)
      .emit(`received_message_${payload.user_id}`, {
        message: `User ${client.id} joined ${payload.user_id}`,
      });
  }

  @SubscribeMessage("leave")
  handleLeave(client: Socket, payload: any): void {
    client.leave(payload.room);
    this.server
      .to(payload.room)
      .emit("received_message", { message: "User left" });
  }

  getTokenFromClient(client: Socket): string {
    // The token is in the cookies of the client
    const cookies = client.handshake.headers.cookie;
    const token = cookies.split(";")[0];
    return token;
  }
}
