import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { dataSourceOptions, vectorSourceOptions } from "./db/data-source";
import { MessagesModule } from "./messages/messages.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { WebsocketsGateway } from "./websockets/websockets.gateway";
import { WebsocketsModule } from "./websockets/websockets.module";
import { AuthenticationService } from "./authentication/authentication.service";
import { AuthenticationModule } from "./authentication/authentication.module";
import { ThreadsModule } from "./threads/threads.module";
import { ParticipantsModule } from "./participants/participants.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forRoot(vectorSourceOptions),
    MessagesModule,
    WebsocketsModule,
    UsersModule,
    AuthenticationModule,
    ThreadsModule,
    ParticipantsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketsGateway, AuthenticationService],
})
export class AppModule {}
