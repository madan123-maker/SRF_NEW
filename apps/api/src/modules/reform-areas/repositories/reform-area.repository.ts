import { PrismaClient, ReformArea, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class ReformAreaRepository extends BaseRepository<ReformArea, Prisma.ReformAreaUncheckedCreateInput, Prisma.ReformAreaUpdateInput> {
  constructor() {
    super(prisma, prisma.reformArea);
  }

  async findByEditionId(editionId: string, skip: number = 0, limit: number = 50, filters: Prisma.ReformAreaWhereInput = {}) {
    const where: Prisma.ReformAreaWhereInput = {
      editionId,
      deletedAt: null,
      ...filters
    };
    
    return Promise.all([
      prisma.reformArea.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.reformArea.count({ where })
    ]);
  }

  async findByCode(editionId: string, code: string) {
    return prisma.reformArea.findUnique({
      where: { editionId_code: { editionId, code }, deletedAt: null }
    });
  }

  async findByName(editionId: string, name: string) {
    return prisma.reformArea.findUnique({
      where: { editionId_name: { editionId, name }, deletedAt: null }
    });
  }

  async getMaxDisplayOrder(editionId: string) {
    const result = await prisma.reformArea.aggregate({
      where: { editionId, deletedAt: null },
      _max: { displayOrder: true }
    });
    return result._max.displayOrder ?? -1;
  }
}
