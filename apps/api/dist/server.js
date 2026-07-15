"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./shared/config/env.config"); // Fail-fast environment validation
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_middleware_1 = require("./shared/middleware/error.middleware");
const request_middleware_1 = require("./shared/middleware/request.middleware");
// Module Routes
const authentication_1 = require("./modules/authentication");
const organizations_1 = require("./modules/organizations");
const departments_1 = require("./modules/departments");
const users_1 = require("./modules/users");
const roles_1 = require("./modules/roles");
const permissions_1 = require("./modules/permissions");
const invitations_1 = require("./modules/invitations");
const editions_1 = require("./modules/editions");
const reform_areas_1 = require("./modules/reform-areas");
const action_points_1 = require("./modules/action-points");
const questions_1 = require("./modules/questions");
const form_fields_1 = require("./modules/form-fields");
const applications_1 = require("./modules/applications");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(request_middleware_1.requestContextMiddleware);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);
// Parsing Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
// Module Routes
app.use('/api/v1/auth', authentication_1.authRoutes);
app.use('/api/v1/organizations', organizations_1.organizationRoutes);
app.use('/api/v1/departments', departments_1.departmentRoutes);
app.use('/api/v1/users', users_1.userRoutes);
app.use('/api/v1/roles', roles_1.roleRoutes);
app.use('/api/v1/permissions', permissions_1.permissionRoutes);
app.use('/api/v1/invitations', invitations_1.invitationRoutes);
app.use('/api/v1/editions', editions_1.editionRoutes);
app.use('/api/v1/reform-areas', reform_areas_1.reformAreaRoutes);
app.use('/api/v1/action-points', action_points_1.actionPointRoutes);
app.use('/api/v1/questions', questions_1.questionRoutes);
app.use('/api/v1/form-fields', form_fields_1.formFieldRoutes);
app.use('/api/v1/applications', applications_1.applicationRoutes);
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
