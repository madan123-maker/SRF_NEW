import { SessionRepository } from '../repositories/session.repository';
import { TokenService } from './token.service';
import ms from 'ms';

export class SessionService {
  private sessionRepository = new SessionRepository();
  private tokenService = new TokenService();

  async createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<{ refreshToken: string }> {
    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);
    const expiresInStr = process.env.JWT_REFRESH_EXPIRES || '7d';
    const expiresAt = new Date(Date.now() + ms(expiresInStr as ms.StringValue));

    await this.sessionRepository.create({
      userId,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt
    });

    return { refreshToken };
  }

  async validateSession(refreshToken: string): Promise<string> {
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    return session.userId;
  }

  async revokeSession(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);
    if (session) {
      await this.sessionRepository.delete(session.id);
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteAllForUser(userId);
  }
}
