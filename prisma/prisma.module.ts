// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // makes it available globally (optional)
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // export so other modules can use it
})
export class PrismaModule {}
