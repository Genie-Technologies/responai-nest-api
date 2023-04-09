import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UUID, randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { WebhookIncomingMessagePayload } from 'src/constants';
import { MessagesService } from 'src/messages/messages.service';
import { ThreadsService } from 'src/threads/threads.service';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly messagesService: MessagesService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('----> Websockets initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const token = this.getTokenFromClient(client);
    console.log('token: ', token);
    console.log(`----> Client connected: `, client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('incoming_message')
  async handleMessage(
    client: Socket,
    payload: WebhookIncomingMessagePayload,
  ): Promise<void> {
    console.log('Message received: ', payload, 'from client: ', client.id);
    // TODO: Authenticate the user

    console.log('Saving last message to thread: ', payload.threadId);
    await this.threadsService.saveLastMessageToThread(
      payload.threadId,
      payload.message,
    );

    console.log('Saving message to database');
    const message = {
      threadId: payload.threadId,
      message: payload.message,
      createdAt: new Date(payload.timestamp),
      recieverId: payload.to[0].userId,
      senderId: payload.to[0].id,
      updatedAt: new Date(payload.timestamp),
      id: randomUUID(),
    };
    console.log('message: ', message);
    await this.messagesService.saveMessage(message);

    // Send the message to the room
    console.log('Sending message to room: ', payload.threadId);
    this.server.to(payload.threadId).emit('received_message', payload);
    // this.server.emit('received_message', payload);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: any): void {
    console.log('Join received: ', payload, 'from client: ', client.id);
    client.join(payload.room);
    this.server
      .to(payload.room)
      .emit('received_message', { message: 'New user joined' });
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, payload: any): void {
    console.log('Leave received: ', payload, 'from client: ', client.id);
    client.leave(payload.room);
    this.server
      .to(payload.room)
      .emit('received_message', { message: 'User left' });
  }

  getTokenFromClient(client: Socket): string {
    // The token is in the cookies of the client
    const cookies = client.handshake.headers.cookie;
    const token = cookies.split(';')[0];
    return token;
  }
}
