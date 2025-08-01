import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AdminService {
  
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(search = '', page = 1, limit = 10) {
    const whereClause: any = {
      role: Role.EMPLOYEE,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      users: users.map(user => ({
        ...user,
        staffPoints: user.staffPoints || 0,
      })),
      total,
    };
  }

  async allocatePoints(senderId: number, recipientId: number, amount: number) {
    if (!senderId || !recipientId) {
      throw new BadRequestException('Sender and recipient IDs are required');
    }

    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
    if (!sender || sender.role !== Role.ADMIN) {
      throw new BadRequestException('Sender must be an admin');
    }

    const recipient = await this.prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          senderId,
          recipientId,
          amount,
        },
      }),
      this.prisma.user.update({
        where: { id: recipientId },
        data: {
          staffPoints: { increment: amount },
        },
      }),
      
    ]);

    return { success: true, message: 'Points allocated successfully' };
  }

async getAdminBalance(adminId: number): Promise<{ availablePoints: any; allocatedPoints: any }> {
  const [admin, allocated] = await this.prisma.$transaction([
    this.prisma.user.findUnique({
      where: { id: adminId },
      select: { staffPoints: true },
    }),
    this.prisma.transaction.aggregate({
      where: { senderId: adminId },
      _sum: { amount: true },
    }),
  ]);

  if (!admin) {
    throw new NotFoundException('Admin not found');
  }

  return {
    availablePoints: admin.staffPoints,
    allocatedPoints: allocated._sum.amount ?? 0,
  };
}




  async getAllTransactions(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.transaction.count(),
    ]);

    return {
      transactions: transactions.map(t => ({
        ...t,
        timestamp: t.createdAt,
      })),
      total,
    };
  }

  async getAdmins() {
    return this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        staffPoints: true
      },
    });
  }
}
