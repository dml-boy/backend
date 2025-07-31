// main.ts
import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 const config = new DocumentBuilder()
    .setTitle('Dashboard API')
    .setDescription('Admin and Employee dashboard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.use(
    session({
      secret: 'keyboard-cat', // replace with env
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
      },
    }),
  );
    // ✅ Enable CORS
  app.enableCors({
    origin: 'https://crudsems.vercel.app/', // frontend URL
    credentials: true, // if you're sending cookies
  });


  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
