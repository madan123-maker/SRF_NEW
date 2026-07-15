import { PrismaClient, Department, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class DepartmentRepository extends BaseRepository<Department, Prisma.DepartmentUncheckedCreateInput, Prisma.DepartmentUpdateInput> {
  constructor() {
    super(prisma, prisma.department);
  }

  async findByCode(code: string): Promise<Department | null> {
    return this.findOne({ code, deletedAt: null });
  }

  async search(organizationId: string, query: string, skip: number, take: number) {
    const where: Prisma.DepartmentWhereInput = {
      organizationId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [data, total] = await Promise.all([
      this.model.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' },
        include: { parent: true, children: true }
      }),
      this.model.count({ where }),
    ]);

    return { data, total };
  }
}
