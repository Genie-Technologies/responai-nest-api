import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService, dataSourceOptions } from './db/data-source';
import { MessagesModule } from './messages/messages.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WebsocketsGateway } from './websockets/websockets.gateway';
import { WebsocketsModule } from './websockets/websockets.module';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    MessagesModule,
    WebsocketsModule,
    UsersModule,
    AuthenticationModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketsGateway, AuthenticationService],
})
export class AppModule {}
