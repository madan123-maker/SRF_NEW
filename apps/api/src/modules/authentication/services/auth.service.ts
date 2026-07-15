/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRepository } from '../repositories/user.repository';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { RegisterDTO, LoginDTO, ChangePasswordDTO, ResetPasswordDTO, AuthContext } from '../dto/auth.dto';
import { AuthenticationError, ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger.util';
import { BaseService } from '../../../shared/services/base.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService extends BaseService {
  private userRepository = new UserRepository();
  private sessionService = new SessionService();
  private tokenService = new TokenService();
  private passwordService = new PasswordService();

  constructor() {
    super(prisma);
  }

  async register(data: RegisterDTO, userAgent?: string, ipAddress?: string) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await this.passwordService.hash(data.password);
    
    const user = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      userRoles: { create: { roleId: data.roleId } },
      organizationId: data.organizationId,
      departmentId: data.departmentId,
      verificationToken: this.tokenService.generateRandomToken(),
      verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    logger.info(`User registered: ${user.email}`);
    // Omit sensitive data
    const { passwordHash: _unused, ...safeUser } = user;
    return safeUser;
  }

  async login(data: LoginDTO, userAgent?: string, ipAddress?: string) {
    const user = await this.userRepository.findByEmail(data.email);
    
    if (!user || user.deletedAt) {
      logger.warn(`Login failed for email: ${data.email} - Not found`);
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.active) {
      throw new AuthenticationError('Account is disabled');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AuthenticationError('Account is locked. Try again later.');
    }

    const isValid = await this.passwordService.compare(data.password, user.passwordHash);
    
    if (!isValid) {
      const attempts = user.failedAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 mins lock
      await this.userRepository.update(user.id, { failedAttempts: attempts, lockedUntil });
      logger.warn(`Login failed for email: ${data.email} - Invalid password`);
      throw new AuthenticationError('Invalid credentials');
    }

    // Reset failed attempts
    await this.userRepository.update(user.id, { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() });

    const { refreshToken } = await this.sessionService.createSession(user.id, userAgent, ipAddress);
    
    type UserWithRoles = typeof user & { userRoles: { roleId: string, role: { name: string, permissions: { permission: { action: string } }[] } }[] };
    const primaryUserRole = (user as UserWithRoles).userRoles[0];
    const permissions = primaryUserRole?.role.permissions.map((p: { permission: { action: string } }) => p.permission.action) || [];
    const authContext: AuthContext = {
      userId: user.id,
      roleId: primaryUserRole?.roleId || '',
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      permissions,
      sessionId: refreshToken // Temporarily mapping to refresh token for revocation tracking in payload if needed
    };

    const accessToken = this.tokenService.generateAccessToken(authContext);

    logger.info(`User logged in: ${user.email}`, { userId: user.id });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: primaryUserRole?.role.name || '',
        permissions
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const userId = await this.sessionService.validateSession(refreshToken);
      const user = await this.userRepository.findById(userId);
      
      if (!user || user.deletedAt || !user.active) {
        throw new AuthenticationError('Invalid user');
      }

      type UserWithRoles = typeof user & { userRoles: { roleId: string, role: { name: string, permissions: { permission: { action: string } }[] } }[] };
      const primaryUserRole = (user as UserWithRoles).userRoles[0];
      const permissions = primaryUserRole?.role.permissions.map((p: { permission: { action: string } }) => p.permission.action) || [];
      const authContext: AuthContext = {
        userId: user.id,
        roleId: primaryUserRole?.roleId || '',
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        permissions,
        sessionId: refreshToken
      };

      const accessToken = this.tokenService.generateAccessToken(authContext);
      return { accessToken };
    } catch (e: any) {
      throw new AuthenticationError(e.message);
    }
  }

  async logout(refreshToken: string) {
    await this.sessionService.revokeSession(refreshToken);
  }

  async logoutAll(userId: string) {
    await this.sessionService.revokeAllSessions(userId);
    logger.info(`All sessions revoked for user: ${userId}`);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Do not reveal if user exists
      return;
    }

    const resetToken = this.tokenService.generateRandomToken();
    const hashedToken = this.tokenService.hashToken(resetToken);
    
    await this.userRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    logger.info(`Password reset requested for: ${user.email}`);
    // Note: In real life, trigger Email Queue here
    // return resetToken; // For testing purposes we'd send it, but normally it's emailed.
  }

  async resetPassword(data: ResetPasswordDTO) {
    const hashedToken = this.tokenService.hashToken(data.token);
    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user || !user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    const passwordHash = await this.passwordService.hash(data.newPassword);
    
    await this.userRepository.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpiry: null
    });

    await this.logoutAll(user.id);
    logger.info(`Password reset successful for: ${user.email}`);
  }

  async deleteSession(sessionId: string) {
    await this.sessionService.revokeSession(sessionId);
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValid = await this.passwordService.compare(data.currentPassword, user.passwordHash);
    if (!isValid) throw new AuthenticationError('Invalid current password');

    const passwordHash = await this.passwordService.hash(data.newPassword);
    await this.userRepository.update(user.id, { passwordHash });
    
    logger.info(`Password changed for user: ${userId}`);
  }
}
