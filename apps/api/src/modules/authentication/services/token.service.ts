/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthContext } from '../dto/auth.dto';

export class TokenService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET || 'secret';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  private readonly accessExpires = process.env.JWT_ACCESS_EXPIRES || '15m';

  generateAccessToken(payload: AuthContext): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpires as `${number}m` | `${number}h` | `${number}d` });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static verifyToken(token: string, secret: string): Record<string, any> {
    return jwt.verify(token, secret) as Record<string, any>;
  }

  verifyAccessToken(token: string): AuthContext {
    return jwt.verify(token, this.accessSecret) as AuthContext;
  }
}
