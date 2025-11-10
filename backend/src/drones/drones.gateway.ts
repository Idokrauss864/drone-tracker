import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
  namespace: '/ws', 
})
export class DronesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    
  }

  handleDisconnect(client: Socket) {
  }

  broadcastNewDrone(drone: { id: number; latitude: number; longitude: number; type: string; createdAt?: Date }) {
    this.server.emit('newDrone', drone);
  }
}

export {};
