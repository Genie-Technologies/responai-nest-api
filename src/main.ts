import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Enable WebSockets
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // Enable CORS
  app.enableCors();

  // Enable WebSockets
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(port);
}
bootstrap();
