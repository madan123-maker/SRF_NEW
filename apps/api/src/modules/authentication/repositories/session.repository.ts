import { PrismaClient, UserSession, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class SessionRepository extends BaseRepository<UserSession, Prisma.UserSessionUncheckedCreateInput, Prisma.UserSessionUpdateInput> {
  constructor() {
    super(prisma, prisma.userSession);
  }

  async create(data: Prisma.UserSessionUncheckedCreateInput) {
    return prisma.userSession.create({ data });
  }

  async findByRefreshTokenHash(hash: string) {
    return prisma.userSession.findUnique({
      where: { refreshTokenHash: hash }
    });
  }

  async findById(id: string) {
    return prisma.userSession.findUnique({
      where: { id }
    });
  }

  async delete(id: string) {
    return prisma.userSession.delete({
      where: { id }
    });
  }

  async deleteAllForUser(userId: string) {
    return prisma.userSession.deleteMany({
      where: { userId }
    });
  }

  async deleteExpired() {
    return prisma.userSession.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
  }
}
