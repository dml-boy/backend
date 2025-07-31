import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1); // ✅ now this works

  // 🧠 Swagger config
  const config = new DocumentBuilder()
    .setTitle('Dashboard API')
    .setDescription('Admin and Employee dashboard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 🍪 Session config with secure cross-origin support
  app.use(
    session({
      secret: 'keyboard-cat', // store in env for production
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        secure: true,         // ✅ required for HTTPS on Render
        sameSite: 'none',     // ✅ allow cross-origin cookies
      },
    }),
  );

app.enableCors({
  origin: 'https://crudsems.vercel.app',
  credentials: true,
});

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
