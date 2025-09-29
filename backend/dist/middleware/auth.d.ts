import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuthMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requirePremium: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireTeamAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireDiagramAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map