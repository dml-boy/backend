import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        staffPoints: true,
        createdAt: true,
      },
    });
  }

  async transfer(fromUserId: number, toUserId: number, amount: number) {
    if (fromUserId === toUserId) {
      throw new BadRequestException("You can't transfer to yourself");
    }

    const fromUser = await this.prisma.user.findUnique({ where: { id: fromUserId } });
    const toUser = await this.prisma.user.findUnique({ where: { id: toUserId } });

    if (!fromUser || !toUser) {
      throw new BadRequestException('Invalid user(s)');
    }

    if (fromUser.staffPoints < amount) {
      throw new BadRequestException('Insufficient points');
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: fromUserId },
        data: { staffPoints: { decrement: amount } },
      }),
      this.prisma.user.update({
        where: { id: toUserId },
        data: { staffPoints: { increment: amount } },
      }),
      this.prisma.transaction.create({
        data: {
          senderId: fromUserId,
          recipientId: toUserId,
          amount,
        },
      }),
    ]);
  }

  async getTransactions(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
