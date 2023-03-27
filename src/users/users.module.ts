import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/db/models/users.entity';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([Users]), MessagesModule],
  exports: [UsersService],
})
export class UsersModule {}
