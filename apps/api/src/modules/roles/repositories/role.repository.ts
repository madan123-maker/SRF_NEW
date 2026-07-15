import { PrismaClient, Role, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class RoleRepository extends BaseRepository<Role, Prisma.RoleUncheckedCreateInput, Prisma.RoleUpdateInput> {
  constructor() {
    super(prisma, prisma.role);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({ name });
  }

  async search(query: string, skip: number, take: number) {
    const where: Prisma.RoleWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [data, total] = await Promise.all([
      this.model.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' },
        include: { permissions: { include: { permission: true } } }
      }),
      this.model.count({ where }),
    ]);

    return { data, total };
  }
}
