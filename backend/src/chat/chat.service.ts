import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(userId: string, content: string, replyToId?: string): Promise<Message> {
    const message = this.messageRepository.create({
      userId,
      content,
      replyToId,
    });
    return this.messageRepository.save(message);
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['user', 'replyTo', 'replyTo.user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentMessages(): Promise<Message[]> {
    const messages = await this.getMessages(50);
    return messages.reverse();
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      return null;
    }

    // Initialize readBy array if it doesn't exist
    if (!message.readBy) {
      message.readBy = [];
    }

    // Add userId to readBy if not already there
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await this.messageRepository.save(message);
    }

    return message;
  }
}
