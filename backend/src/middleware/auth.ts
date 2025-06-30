import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '@/database/connection';
import { logger } from '@/utils/logger';
import { User, AuthenticatedRequest } from '@/types';

interface JWTPayload {
  id: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      logger.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Get user from database
    const result = await query(
      `SELECT id, email, first_name, last_name, role, avatar_url, 
              is_email_verified, last_login, subscription_plan, 
              subscription_expires, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [decoded.id]
    );

    if (!result.rows || result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'User not found or email not verified'
      });
      return;
    }

    const user: User = result.rows[0];

    // Check if user is active (you can add more checks here)
    if (user.subscription_expires && new Date(user.subscription_expires) < new Date()) {
      // Handle expired subscription if needed
      logger.warn(`User ${user.id} has expired subscription`);
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Attach user to request
    req.user = user;
    
    logger.debug(`User authenticated: ${user.email}`);
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Optional auth middleware (doesn't fail if no token provided)
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    // Use the regular auth middleware
    await authMiddleware(req, res, next);
  } catch (error) {
    // If auth fails, just continue without user
    next();
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Premium or admin middleware
export const requirePremium = requireRole(['admin', 'premium']);

// Team ownership/membership middleware
export const requireTeamAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const result = await query(
      `SELECT tm.role, t.owner_id
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id
       WHERE tm.team_id = $1 AND tm.user_id = $2`,
      [teamId, req.user.id]
    );

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
  } catch (error) {
    logger.error('Team access middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Diagram ownership/access middleware
export const requireDiagramAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const result = await query(
      `SELECT d.*, tm.role as team_role
       FROM diagrams d
       LEFT JOIN team_members tm ON d.team_id = tm.team_id AND tm.user_id = $2
       WHERE d.id = $1`,
      [diagramId, req.user.id]
    );

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
  } catch (error) {
    logger.error('Diagram access middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 