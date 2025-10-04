import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/entities/user.entity';
import { Message } from './chat/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
      url: process.env.DATABASE_URL,
      database: process.env.DATABASE_URL ? undefined : 'chat.db',
      entities: [User, Message],
      synchronize: true,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UsersModule,
    ChatModule,
  ],
})
export class AppModule {}
