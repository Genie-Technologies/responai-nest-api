import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { readFileSync } from "fs";
import * as https from "https";
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
  app.enableCors({
    origin: ["http://localhost:3000", "https://www.responai.com/"],
  });

  // Enable WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port);
}

bootstrap();
