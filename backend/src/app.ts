import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { companiesRoutes } from './modules/companies/companies.routes';
import { contactsRoutes } from './modules/contacts/contacts.routes';
import { customersRoutes } from './modules/customers/customers.routes';
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
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1', contactsRoutes);
app.use('/api/v1/customers', customersRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use(errorHandler);

export { app, prisma };
