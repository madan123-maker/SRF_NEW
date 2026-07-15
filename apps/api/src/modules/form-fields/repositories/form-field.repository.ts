import { PrismaClient, FormField, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class FormFieldRepository extends BaseRepository<FormField, Prisma.FormFieldUncheckedCreateInput, Prisma.FormFieldUpdateInput> {
  constructor() {
    super(prisma, prisma.formField);
  }

  async findByQuestionId(questionId: string, skip: number = 0, limit: number = 50, filters: Prisma.FormFieldWhereInput = {}) {
    const where: Prisma.FormFieldWhereInput = {
      questionId,
      deletedAt: null,
      ...filters
    };
    
    return Promise.all([
      prisma.formField.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.formField.count({ where })
    ]);
  }

  async existsByFieldKey(questionId: string, fieldKey: string) {
    const record = await prisma.formField.findUnique({
      where: { questionId_fieldKey: { questionId, fieldKey } },
      select: { id: true, deletedAt: true }
    });
    return record && !record.deletedAt ? true : false;
  }

  async getMaxDisplayOrder(questionId: string) {
    const result = await prisma.formField.aggregate({
      where: { questionId, deletedAt: null },
      _max: { displayOrder: true }
    });
    return result._max.displayOrder ?? -1;
  }
}
