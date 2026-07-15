import { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class UserRepository extends BaseRepository<User, Prisma.UserUncheckedCreateInput, Prisma.UserUpdateInput> {
  constructor() {
    super(prisma, prisma.user);
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      }
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: {
        userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      }
    });
  }

  async findByResetToken(token: string) {
    return prisma.user.findUnique({
      where: { resetPasswordToken: token, deletedAt: null }
    });
  }

  async findByVerificationToken(token: string) {
    return prisma.user.findUnique({
      where: { verificationToken: token, deletedAt: null }
    });
  }

  async create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data
    });
  }
}
