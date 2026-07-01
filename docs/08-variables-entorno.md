# 08. Variables de Entorno

## Backend (`backend/.env`)

```bash
# Servidor
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:4321

# Base de datos (SQL Server)
DATABASE_URL="sqlserver://localhost:1433;database=gurkcrm;user=sa;password=TU_PASSWORD;trustServerCertificate=true"

# JWT
JWT_ACCESS_SECRET=cambiar_por_un_secreto_largo_y_random
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=otro_secreto_largo_y_random_distinto
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# Cookies
COOKIE_SECURE=false        # true en producción (HTTPS)
COOKIE_DOMAIN=localhost

# Email (opcional en MVP — puede loguearse en consola en dev)
EMAIL_PROVIDER=console      # console | resend | sendgrid
EMAIL_FROM=no-reply@gurkcrm.com
RESEND_API_KEY=

# Storage de archivos (Fase 2)
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Frontend (`frontend/.env`)

```bash
PUBLIC_API_URL=http://localhost:4000/api/v1
PUBLIC_APP_NAME=GurkCRM
```

> En Astro, las variables que necesitan estar disponibles en el cliente deben tener el prefijo `PUBLIC_`.

## Buenas prácticas

- Nunca commitear `.env` — agregar a `.gitignore` desde el día 1.
- Crear `.env.example` en ambas carpetas con las claves (sin valores sensibles) para documentar qué variables se necesitan.
- En producción, `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` deben ser distintos entre sí y generados con alta entropía (ej. `openssl rand -base64 64`).
- `COOKIE_SECURE=true` es obligatorio en producción (requiere HTTPS, lo cual Vercel/Railway/Render dan por defecto).

## `.gitignore` sugerido (raíz del repo)

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
frontend/.astro/
backend/dist/
```
