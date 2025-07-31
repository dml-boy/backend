import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { PrismaService } from '../prisma/prisma.service';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true, 
        envFilePath: '.env',
    }),
    
    AuthModule,
    EmployeeModule,
    AdminModule,
    PrismaModule
  ],
  controllers: [
    AppController,
    EmployeeController,
  ],
  providers: [
    AppService,
    PrismaService,
    EmployeeService,
  ],
})
export class AppModule {}
