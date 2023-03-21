import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './services/config/config.service';
import { MessagesModule } from './messages/messages.module';
import { WebsocketsGateway } from './websockets/websockets.gateway';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    MessagesModule,
    WebsocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketsGateway],
})
export class AppModule {}
