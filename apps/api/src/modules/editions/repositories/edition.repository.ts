import { PrismaClient, Edition, Prisma, EditionStatus } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class EditionRepository extends BaseRepository<Edition, Prisma.EditionUncheckedCreateInput, Prisma.EditionUpdateInput> {
  constructor() {
    super(prisma, prisma.edition);
  }

  async search(organizationId: string, query: string, skip: number, take: number, status?: EditionStatus) {
    const where: Prisma.EditionWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status && { status }),
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      })
    };

    const [data, total] = await Promise.all([
      this.model.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' },
        include: { department: true } 
      }),
      this.model.count({ where }),
    ]);

    return { data, total };
  }
}
