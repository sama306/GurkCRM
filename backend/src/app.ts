import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { prisma } from './config/prisma';

const app = express();

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use(errorHandler);

export { app, prisma };
