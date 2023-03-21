import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Messages } from '../db/models/messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Messages])],
  controllers: [MessagesController],
  exports: [MessagesService],
  providers: [MessagesService],
})
export class MessagesModule {}
