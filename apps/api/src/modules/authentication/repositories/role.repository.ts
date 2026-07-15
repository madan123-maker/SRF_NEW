import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoleRepository {
  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id }
    });
  }

  async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name }
    });
  }
}
