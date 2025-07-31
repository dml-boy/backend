import { Controller, Get, Post, Body, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/authenticated.guard';
import { ParseIntPipe } from '@nestjs/common';
import { IsInt, IsPositive } from 'class-validator';
import { Prisma } from '@prisma/client';

// DTO for allocatePoints
class AllocatePointsDto {
  @IsInt()
  @IsPositive()
  recipientId: number;

  @IsInt()
  @IsPositive()
  amount: number;
}

@Controller('api')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`Fetching users: search=${search}, page=${page}, limit=${limit}`);
    return this.adminService.getUsers(search, page, limit);
  }

@Get('admin/balance')
async getAdminBalance(@Req() req) {
  return this.adminService.getAdminBalance(req.user.id);
}


  @Get('admins')
  async getAdmins() {
    this.logger.log('Fetching admins (legacy endpoint)');
    return this.adminService.getAdmins();
  }

  @Get('admin/all')
  async getAllAdmins() {
    this.logger.log('Fetching all admins');
    return this.adminService.getAdmins();
  }

  @Get('transactions')
  async getTransactions(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`Fetching transactions: page=${page}, limit=${limit}`);
    return this.adminService.getAllTransactions(page, limit);
  }

  @Post('staff-points/allocate')
  async allocatePoints(@Req() req, @Body() body: AllocatePointsDto) {
    this.logger.log(`Allocating points: senderId=${req.user.id}, recipientId=${body.recipientId}, amount=${body.amount}`);
    return this.adminService.allocatePoints(req.user.id, body.recipientId, body.amount);
  }

//popo
}