import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map();
  private typingUsers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      client.userId = user.id;
      client.username = user.username;
      this.connectedUsers.set(client.id, user.username);

      console.log(`✅ User connected: ${user.username} (${client.id})`);

      this.server.emit('userJoined', {
        username: user.username,
        connectedUsers: Array.from(this.connectedUsers.values()),
      });
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const username = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);

    if (username) {
      console.log(`👋 User disconnected: ${username}`);
      this.server.emit('userLeft', {
        username,
        connectedUsers: Array.from(this.connectedUsers.values()),
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { content: string; replyToId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId || !client.username) {
      return { error: 'Unauthorized' };
    }

    const message = await this.chatService.createMessage(client.userId, data.content, data.replyToId);

    // Load reply information if exists
    let replyTo = null;
    if (message.replyToId) {
      const replyMessage = await this.chatService.getMessageById(message.replyToId);
      if (replyMessage) {
        replyTo = {
          id: replyMessage.id,
          content: replyMessage.content,
          username: replyMessage.user.username,
          userId: replyMessage.userId,
        };
      }
    }

    // Clear typing indicator when message is sent
    const existingTimeout = this.typingUsers.get(client.userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingUsers.delete(client.userId);
    }

    this.server.emit('newMessage', {
      id: message.id,
      content: message.content,
      username: client.username,
      userId: client.userId,
      createdAt: message.createdAt,
      readBy: message.readBy || [],
      replyTo,
    });

    return { success: true };
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const messages = await this.chatService.getRecentMessages();

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      username: msg.user.username,
      userId: msg.userId,
      createdAt: msg.createdAt,
      readBy: msg.readBy || [],
      replyTo: msg.replyTo ? {
        id: msg.replyTo.id,
        content: msg.replyTo.content,
        username: msg.replyTo.user?.username,
        userId: msg.replyTo.userId,
      } : null,
    }));
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId || !client.username) {
      return { error: 'Unauthorized' };
    }

    if (data.isTyping) {
      // Clear existing timeout if any
      const existingTimeout = this.typingUsers.get(client.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Broadcast typing event
      client.broadcast.emit('userTyping', {
        userId: client.userId,
        username: client.username,
        isTyping: true,
      });

      // Auto-stop typing after 3 seconds
      const timeout = setTimeout(() => {
        this.typingUsers.delete(client.userId);
        client.broadcast.emit('userTyping', {
          userId: client.userId,
          username: client.username,
          isTyping: false,
        });
      }, 3000);

      this.typingUsers.set(client.userId, timeout);
    } else {
      // Clear timeout and broadcast stop typing
      const existingTimeout = this.typingUsers.get(client.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.typingUsers.delete(client.userId);
      }

      client.broadcast.emit('userTyping', {
        userId: client.userId,
        username: client.username,
        isTyping: false,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const message = await this.chatService.markAsRead(data.messageId, client.userId);

    if (message) {
      // Broadcast read receipt to all users
      this.server.emit('messageRead', {
        messageId: data.messageId,
        userId: client.userId,
        readBy: message.readBy || [],
      });

      return { success: true };
    }

    return { error: 'Message not found' };
  }
}
