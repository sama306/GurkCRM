import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        role: string;
      };
    }
  }
}
