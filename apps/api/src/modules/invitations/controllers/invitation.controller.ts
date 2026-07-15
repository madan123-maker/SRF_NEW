/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitation.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';

export class InvitationController {
  private service = new InvitationService();

  inviteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitation = await this.service.inviteUser(req.body, req.user!.userId);
      return sendCreated(res, 'Invitation sent successfully', { invitation });
    } catch (error) {
      next(error);
    }
  };

  acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.acceptInvitation(req.body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      return sendCreated(res, 'Invitation accepted successfully', { user: safeUser });
    } catch (error) {
      next(error);
    }
  };

  cancelInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.cancelInvitation(req.params.id);
      return sendSuccess(res, 'Invitation cancelled successfully');
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const query = (req.query.search as string) || '';
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;

      const { data, total } = await this.service.search(query, page, limit, filters);
      const meta = getPaginatedMeta(total, page, limit);

      return sendPaginated(res, 'Invitations retrieved successfully', { invitations: data, meta });
    } catch (error) {
      next(error);
    }
  };
}
