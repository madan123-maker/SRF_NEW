/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { InvitationRepository } from '../repositories/invitation.repository';
import { CreateInvitationDTO, AcceptInvitationDTO } from '../validators/invitation.validator';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class InvitationService extends BaseService {
  private invitationRepository = new InvitationRepository();

  constructor() {
    super(prisma);
  }

  async inviteUser(data: CreateInvitationDTO, invitedById: string) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictError('User with this email already exists');

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return this.invitationRepository.create({
      email: data.email,
      roleId: data.roleId,
      organizationId: data.organizationId,
      departmentId: data.departmentId,
      invitedById,
      token,
      expiresAt,
      status: 'PENDING'
    });
  }

  async acceptInvitation(data: AcceptInvitationDTO) {
    const invitation = await this.invitationRepository.findByToken(data.token);
    if (!invitation) throw new NotFoundError('Invalid invitation token');
    if (invitation.status !== 'PENDING') throw new ConflictError('Invitation is no longer valid');
    if (invitation.expiresAt < new Date()) throw new ConflictError('Invitation has expired');

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) throw new ConflictError('Username already in use');

    return this.executeInTransaction(async (tx) => {
      const passwordHash = await bcrypt.hash(data.password, 12);
      
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile,
          passwordHash,
          userRoles: { create: { roleId: invitation.roleId } },
          organizationId: invitation.organizationId,
          departmentId: invitation.departmentId,
          active: true,
          isEmailVerified: true
        }
      });

      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });

      return user;
    });
  }

  async cancelInvitation(id: string) {
    const invitation = await this.invitationRepository.findById(id);
    if (!invitation) throw new NotFoundError('Invitation not found');
    if (invitation.status !== 'PENDING') throw new ConflictError('Cannot cancel a non-pending invitation');

    return this.invitationRepository.update(id, { status: 'CANCELLED' });
  }

  async search(query: string = '', page: number = 1, limit: number = 10, filters: any = {}) {
    const skip = (page - 1) * limit;
    return this.invitationRepository.search(query, skip, limit, filters);
  }
}
