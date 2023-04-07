import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Messages } from '../db/models/messages.entity';
import { Threads } from 'src/db/models/threads.entity';
import { ThreadsController } from './threads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Messages, Threads])],
  controllers: [MessagesController, ThreadsController],
  exports: [MessagesService],
  providers: [MessagesService],
})
export class MessagesModule {}
