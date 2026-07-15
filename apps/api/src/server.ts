import './shared/config/env.config'; // Fail-fast environment validation
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler } from './shared/middleware/error.middleware';
import { requestContextMiddleware } from './shared/middleware/request.middleware';

// Module Routes
import { authRoutes } from './modules/authentication';
import { organizationRoutes } from './modules/organizations';
import { departmentRoutes } from './modules/departments';
import { userRoutes } from './modules/users';
import { roleRoutes } from './modules/roles';
import { permissionRoutes } from './modules/permissions';
import { invitationRoutes } from './modules/invitations';
import { editionRoutes } from './modules/editions';

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(requestContextMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Module Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/editions', editionRoutes);

// Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
