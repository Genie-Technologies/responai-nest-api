import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Threads } from 'src/db/models/threads.entity';
import { Messages } from 'src/db/models/messages.entity';
import { Participants } from 'src/db/models/participants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Messages, Threads, Participants])],
  controllers: [ThreadsController],
  exports: [ThreadsService],
  providers: [ThreadsService],
})
export class ThreadsModule {}
