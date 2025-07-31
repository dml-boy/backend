import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Roles } from '../../src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EmployeeService } from './employee.service';
import { Role } from '@prisma/client'; // ✅ Import Role enum

@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EMPLOYEE) // ✅ Use enum, not string
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.employeeService.getProfile(req.user.id);
  }

  @Post('transfer')
  transfer(@Req() req, @Body() body: { toUserId: number; amount: number }) {
    return this.employeeService.transfer(req.user.id, body.toUserId, body.amount);
  }

  @Get('transactions')
  getTransactions(@Req() req) {
    return this.employeeService.getTransactions(req.user.id);
  }
}
