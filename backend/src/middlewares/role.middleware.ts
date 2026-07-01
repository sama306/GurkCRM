import type { Request, Response, NextFunction } from 'express';

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
          details: [],
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para acceder a este recurso',
          details: [],
        },
      });
      return;
    }

    next();
  };
}
