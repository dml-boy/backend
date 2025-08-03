import { Controller, Get, Post, Body, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/authenticated.guard';
import { ParseIntPipe } from '@nestjs/common';
import { IsInt, IsPositive, IsOptional } from 'class-validator';

// DTO for query parameters
class QueryDto {
  @IsOptional()
  search?: string;

  @IsInt()
  @IsPositive()
  page: number = 1;

  @IsInt()
  @IsPositive()
  limit: number = 10;
}

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
  async getUsers(@Query() query: QueryDto) {
    this.logger.log({
      message: 'Fetching users',
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return this.adminService.getUsers(query.search, query.page, query.limit);
  }

  @Get('admin/balance')
  async getAdminBalance(@Req() req) {
    this.logger.log(`Fetching balance for admin: adminId=${req.user.id}`);
    return this.adminService.getAdminBalance(req.user.id);
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

  @Post('admin/points/initialize')
  async initializeAdminPoints(@Req() req) {
    this.logger.log(`Initializing points for admin: adminId=${req.user.id}`);
    return this.adminService.initializeAdminPoints(req.user.id);
  }
}