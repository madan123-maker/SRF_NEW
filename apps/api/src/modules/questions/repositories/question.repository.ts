import { PrismaClient, Question, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class QuestionRepository extends BaseRepository<Question, Prisma.QuestionUncheckedCreateInput, Prisma.QuestionUpdateInput> {
  constructor() {
    super(prisma, prisma.question);
  }

  async findByActionPointId(actionPointId: string, skip: number = 0, limit: number = 50, filters: Prisma.QuestionWhereInput = {}) {
    const where: Prisma.QuestionWhereInput = {
      actionPointId,
      deletedAt: null,
      ...filters
    };
    
    return Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.question.count({ where })
    ]);
  }

  async existsByCode(actionPointId: string, code: string) {
    const record = await prisma.question.findUnique({
      where: { actionPointId_code: { actionPointId, code } },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }

  async existsByName(actionPointId: string, name: string) {
    const record = await prisma.question.findUnique({
      where: { actionPointId_name: { actionPointId, name } },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }
  
  async existsBySlug(slug: string) {
    const record = await prisma.question.findUnique({
      where: { slug },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }

  async getMaxDisplayOrder(actionPointId: string) {
    const result = await prisma.question.aggregate({
      where: { actionPointId, deletedAt: null },
      _max: { displayOrder: true }
    });
    return result._max.displayOrder ?? -1;
  }
}
