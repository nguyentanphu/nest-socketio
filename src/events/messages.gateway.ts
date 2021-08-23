import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({cors: true})
export class MessagesGateway implements OnGatewayConnection {
  handleConnection(client: Socket, ...args: any[]) {
    client.emit('chat-message', 'Hello world');
  }
  @WebSocketServer()
  io: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
    
  }

  @SubscribeMessage('send-message')
  sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() {message, room}) {
    if (room) {
      socket.broadcast.to(room).emit('receive-message', message);
    } else {
      socket.broadcast.emit('receive-message', message);
    }
  }

  @SubscribeMessage('join-room')
  joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() room) {
    if (room) {
      socket.join(room);
      return `Join room: ${room}`;
    }
  }

}
