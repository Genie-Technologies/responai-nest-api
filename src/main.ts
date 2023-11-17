import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

// Enable WebSockets
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const port = process.env.PORT || 3001;

  app.useBodyParser("text");

  // Enable CORS
  app.enableCors();

  // Enable WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port);
}

bootstrap();
