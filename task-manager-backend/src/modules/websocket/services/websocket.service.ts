import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface WebSocketEvent {
  type: string;
  data: any;
  room?: string;
  userId?: string;
  excludeUserId?: string;
}

@Injectable()
export class WebSocketService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  /**
   * Broadcast event to a specific room
   */
  broadcastToRoom(room: string, event: string, data: any, excludeUserId?: string) {
    if (!this.server) return;
    
    const roomSockets = this.server.in(room);
    if (excludeUserId) {
      roomSockets.except(excludeUserId).emit(event, data);
    } else {
      roomSockets.emit(event, data);
    }
  }

  /**
   * Broadcast event to a specific user
   */
  broadcastToUser(userId: string, event: string, data: any) {
    if (!this.server) return;
    this.server.to(userId).emit(event, data);
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastToAll(event: string, data: any, excludeUserId?: string) {
    if (!this.server) return;
    
    if (excludeUserId) {
      this.server.except(excludeUserId).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }

  /**
   * Broadcast event to admin users only
   */
  broadcastToAdmins(event: string, data: any) {
    if (!this.server) return;
    this.server.to('admin-room').emit(event, data);
  }

  /**
   * Get connected users count in a room
   */
  getRoomUserCount(roomName: string): number {
    if (!this.server) return 0;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    if (!this.server) return false;
    return this.server.sockets.adapter.rooms.has(userId);
  }
} 