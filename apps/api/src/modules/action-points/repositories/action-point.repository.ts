import { PrismaClient, ActionPoint, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class ActionPointRepository extends BaseRepository<ActionPoint, Prisma.ActionPointUncheckedCreateInput, Prisma.ActionPointUpdateInput> {
  constructor() {
    super(prisma, prisma.actionPoint);
  }

  async findByReformAreaId(reformAreaId: string, skip: number = 0, limit: number = 50, filters: Prisma.ActionPointWhereInput = {}) {
    const where: Prisma.ActionPointWhereInput = {
      reformAreaId,
      deletedAt: null,
      ...filters
    };
    
    return Promise.all([
      prisma.actionPoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.actionPoint.count({ where })
    ]);
  }

  async existsByCode(reformAreaId: string, code: string) {
    const record = await prisma.actionPoint.findUnique({
      where: { reformAreaId_code: { reformAreaId, code } },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }

  async existsByName(reformAreaId: string, name: string) {
    const record = await prisma.actionPoint.findUnique({
      where: { reformAreaId_name: { reformAreaId, name } },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }
  
  async existsBySlug(slug: string) {
    const record = await prisma.actionPoint.findUnique({
      where: { slug },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }

  async getMaxDisplayOrder(reformAreaId: string) {
    const result = await prisma.actionPoint.aggregate({
      where: { reformAreaId, deletedAt: null },
      _max: { displayOrder: true }
    });
    return result._max.displayOrder ?? -1;
  }
}
