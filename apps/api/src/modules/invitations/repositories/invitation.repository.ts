/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, UserInvitation, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class InvitationRepository extends BaseRepository<UserInvitation, Prisma.UserInvitationUncheckedCreateInput, Prisma.UserInvitationUpdateInput> {
  constructor() {
    super(prisma, prisma.userInvitation);
  }

  async findByToken(token: string): Promise<UserInvitation | null> {
    return this.findOne({ token });
  }

  async search(query: string, skip: number, take: number, filters: any = {}) {
    const where: Prisma.UserInvitationWhereInput = {
      ...filters,
      OR: query ? [
        { email: { contains: query, mode: 'insensitive' } },
      ] : undefined,
    };

    const [data, total] = await Promise.all([
      this.model.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' }
      }),
      this.model.count({ where }),
    ]);

    return { data, total };
  }
}
