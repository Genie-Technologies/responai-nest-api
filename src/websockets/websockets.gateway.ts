import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Messages } from "src/db/models/messages.entity";
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
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
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

    // TODO: Thread will be created before the message is sent,
    // as a pre-optimization, so we can always ensure that we have a thread_id here.
    console.log("INCOMING MESSAGE PAYLOAD", payload);
    const message = new Messages();
    message.threadId = payload.thread_id;
    message.message = payload.message;
    message.createdAt = new Date(payload.timestamp);
    message.updatedAt = new Date(payload.timestamp);
    message.senderId = payload.sender_id;
    message.receiverId = payload.receiver_id;
    message.id = randomUUID();

    // Get the thread instance and assign it to message.thread
    const thread = await this.threadsService.getThread(payload.thread_id);
    message.thread = thread;
    thread.lastMessage = message.message;
    console.log("THREAD", thread);
    console.log("message", message);
    delete thread.participants;
    await this.threadsService.saveThread(thread);

    const newMessage = await this.messagesService.saveMessage(message);

    // Send the message to each user in the thread. FE has to be updated so these thread_ids are registered
    // for this to work properly.
    this.server.to(payload.thread_id).emit(`received_message`, {
      threadId: payload.thread_id,
      threadName: payload.thread_name,
      newMessage,
      participants: payload.participants,
    });
  }

  @SubscribeMessage("join")
  handleJoin(client: Socket, payload: any): void {
    client.join(payload.room);
    this.server.to(payload.room).emit("joined_room", {
      message: `User ${client.id} joined ${payload.room}`,
    });
  }

  @SubscribeMessage("join_home")
  handleJoinHome(client: Socket, payload: any): void {
    client.join(payload.user_id);
    this.server.to(payload.user_id).emit(`joined_home_${payload.user_id}`, {
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
    const token = cookies?.split(";")[0];
    return token;
  }
}
