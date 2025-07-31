import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma, Role, User } from '@prisma/client';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...rest }) => rest);
  }

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const role = this.validateRole(data.role);
const user = await this.prisma.user.create({
  data: {
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role,
    staffPoints: Number(0),  // 👈 Required field
    amount: new Prisma.Decimal(0),  // 👈 Required field for Decimal
  },
});


    const { password, ...userData } = user;
    return { message: 'User registered successfully', user: userData };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    const isValid =
      user && (await bcrypt.compare(data.password, user.password));
    if (!isValid) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: token,
    };
  }

  async logout() {
    // Stateless logout — token should be discarded on the client
    return { message: 'Logged out' };
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return null;

    const { password: _, ...rest } = user;
    return rest;
  }

  private validateRole(inputRole?: string): Role {
    if (!inputRole) return Role.EMPLOYEE;

    const normalized = inputRole.toUpperCase();
    if (!(normalized in Role)) {
      throw new BadRequestException(`Invalid role: ${inputRole}`);
    }

    return Role[normalized as keyof typeof Role];
  }
}
