import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export interface ReplyTo {
  id: string;
  content: string;
  username: string;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  username: string;
  userId: string;
  createdAt: string;
  readBy?: string[];
  replyTo?: ReplyTo | null;
}

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(content: string, replyToId?: string) {
    if (this.socket) {
      this.socket.emit('sendMessage', { content, replyToId });
    }
  }

  getMessages(callback: (messages: Message[]) => void) {
    if (this.socket) {
      this.socket.emit('getMessages', {}, callback);
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onUserJoined(callback: (data: { username: string; connectedUsers: string[] }) => void) {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  onUserLeft(callback: (data: { username: string; connectedUsers: string[] }) => void) {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  sendTyping(isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { isTyping });
    }
  }

  onUserTyping(callback: (data: { userId: string; username: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  markAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit('markAsRead', { messageId });
    }
  }

  onMessageRead(callback: (data: { messageId: string; userId: string; readBy: string[] }) => void) {
    if (this.socket) {
      this.socket.on('messageRead', callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
