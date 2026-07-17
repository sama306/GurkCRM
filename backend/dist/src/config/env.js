"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnv(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (!value)
        throw new Error(`Missing required env variable: ${key}`);
    return value;
}
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT ?? '4000', 10),
    CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:4321'),
    DATABASE_URL: getEnv('DATABASE_URL'),
    JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
    JWT_ACCESS_EXPIRES_IN: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
    JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    BCRYPT_SALT_ROUNDS: parseInt(getEnv('BCRYPT_SALT_ROUNDS', '10'), 10),
    COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
    COOKIE_DOMAIN: getEnv('COOKIE_DOMAIN', 'localhost'),
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER ?? 'console',
    EMAIL_FROM: process.env.EMAIL_FROM ?? 'no-reply@gurkcrm.com',
};
//# sourceMappingURL=env.js.map