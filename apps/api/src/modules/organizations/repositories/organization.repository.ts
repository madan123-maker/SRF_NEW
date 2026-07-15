import { PrismaClient, Organization, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class OrganizationRepository extends BaseRepository<Organization, Prisma.OrganizationUncheckedCreateInput, Prisma.OrganizationUpdateInput> {
  constructor() {
    super(prisma, prisma.organization);
  }

  async findByCode(code: string): Promise<Organization | null> {
    return this.findOne({ code, deletedAt: null });
  }

  async search(query: string, skip: number, take: number) {
    const where: Prisma.OrganizationWhereInput = {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [data, total] = await Promise.all([
      this.model.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.model.count({ where }),
    ]);

    return { data, total };
  }
}
