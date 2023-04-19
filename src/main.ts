import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

// Enable WebSockets
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;

  // Enable CORS
  app.enableCors();

  // Enable WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));
  console.log("LISTENING ON PORT:", port);
  await app.listen(port);
}

bootstrap();
