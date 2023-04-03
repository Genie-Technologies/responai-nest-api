import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
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

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    console.log('Message received: ', payload, 'from client: ', client.id);
    this.server.emit('message', payload);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: any): void {
    console.log('Join received: ', payload, 'from client: ', client.id);
    client.join(payload.room);
    this.server
      .to(payload.room)
      .emit('message', { message: 'New user joined' });
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, payload: any): void {
    console.log('Leave received: ', payload, 'from client: ', client.id);
    client.leave(payload.room);
    this.server.to(payload.room).emit('message', { message: 'User left' });
  }

  getTokenFromClient(client: Socket): string {
    // The token is in the cookies of the client
    const cookies = client.handshake.headers.cookie;
    const token = cookies.split(';')[0];
    return token;
  }
}
