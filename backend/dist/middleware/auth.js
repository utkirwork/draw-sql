"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDiagramAccess = exports.requireTeamAccess = exports.requirePremium = exports.requireAdmin = exports.requireRole = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("@/database/connection");
const logger_1 = require("@/utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'No authorization header provided'
            });
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'No token provided'
            });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger_1.logger.error('JWT_SECRET not configured');
            res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
            return;
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Get user from database
        const result = await (0, connection_1.query)(`SELECT id, email, first_name, last_name, role, avatar_url, 
              is_email_verified, last_login, subscription_plan, 
              subscription_expires, created_at, updated_at
       FROM users 
       WHERE id = $1`, [decoded.id]);
        if (!result.rows || result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'User not found or email not verified'
            });
            return;
        }
        const user = result.rows[0];
        // Check if user is active (you can add more checks here)
        if (user.subscription_expires && new Date(user.subscription_expires) < new Date()) {
            // Handle expired subscription if needed
            logger_1.logger.warn(`User ${user.id} has expired subscription`);
        }
        // Update last login
        await (0, connection_1.query)('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        // Attach user to request
        req.user = user;
        logger_1.logger.debug(`User authenticated: ${user.email}`);
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
            return;
        }
        logger_1.logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.authMiddleware = authMiddleware;
// Optional auth middleware (doesn't fail if no token provided)
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next();
            return;
        }
        // Use the regular auth middleware
        await (0, exports.authMiddleware)(req, res, next);
    }
    catch (error) {
        // If auth fails, just continue without user
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
// Role-based access control middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
// Admin only middleware
exports.requireAdmin = (0, exports.requireRole)(['admin']);
// Premium or admin middleware
exports.requirePremium = (0, exports.requireRole)(['admin', 'premium']);
// Team ownership/membership middleware
const requireTeamAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        const teamId = req.params.teamId || req.body.team_id;
        if (!teamId) {
            res.status(400).json({
                success: false,
                error: 'Team ID required'
            });
            return;
        }
        // Check if user is team member or admin
        const result = await (0, connection_1.query)(`SELECT tm.role, t.owner_id
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id
       WHERE tm.team_id = $1 AND tm.user_id = $2`, [teamId, req.user.id]);
        const isAdmin = req.user.role === 'admin';
        const hasTeamAccess = result.rows && result.rows.length > 0;
        if (!isAdmin && !hasTeamAccess) {
            res.status(403).json({
                success: false,
                error: 'Team access denied'
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Team access middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.requireTeamAccess = requireTeamAccess;
// Diagram ownership/access middleware
const requireDiagramAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        const diagramId = req.params.diagramId || req.params.id;
        if (!diagramId) {
            res.status(400).json({
                success: false,
                error: 'Diagram ID required'
            });
            return;
        }
        // Check diagram access
        const result = await (0, connection_1.query)(`SELECT d.*, tm.role as team_role
       FROM diagrams d
       LEFT JOIN team_members tm ON d.team_id = tm.team_id AND tm.user_id = $2
       WHERE d.id = $1`, [diagramId, req.user.id]);
        if (!result.rows || result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Diagram not found'
            });
            return;
        }
        const diagram = result.rows[0];
        const isAdmin = req.user.role === 'admin';
        const isOwner = diagram.owner_id === req.user.id;
        const isPublic = diagram.visibility === 'public';
        const hasTeamAccess = diagram.team_id && diagram.team_role;
        if (!isAdmin && !isOwner && !isPublic && !hasTeamAccess) {
            res.status(403).json({
                success: false,
                error: 'Diagram access denied'
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Diagram access middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.requireDiagramAccess = requireDiagramAccess;
//# sourceMappingURL=auth.js.map