# 09. Deployment

> Actualizado en julio 2026 tras verificar el estado actual de cada plataforma.

## Resumen

| Componente | Servicio elegido | Notas |
|---|---|---|
| Frontend (Astro) | **Vercel** | Deploy automático desde GitHub. El proyecto ya usa el patrón correcto (estático por default + `prerender = false` puntual), solo hace falta cambiar el adapter de `@astrojs/node` (desarrollo) a `@astrojs/vercel` (producción) |
| Backend (Express) | **Render** | Tiene capa gratuita real para servicios web (750 hs/mes). El servicio "duerme" tras inactividad (la primera request después de estar inactivo tarda ~1 min en responder) — aceptable para un portfolio |
| Base de datos | **Azure SQL Database** (free tier) | Microsoft amplió la oferta gratuita: hasta 10 bases serverless por suscripción, 100.000 vCore-segundos y 32 GB de almacenamiento gratis por mes, de por vida de la suscripción (no es un trial que expira) |

### Por qué Render y no Railway

Railway eliminó su capa gratuita permanente hace tiempo — hoy pide tarjeta de crédito desde el registro y no tiene tier gratuito real (solo créditos de prueba por 30 días). Render sí mantiene una capa gratuita utilizable indefinidamente para un proyecto de portfolio, a cambio de aceptar el "spin down". Si en algún momento el proyecto necesita estar siempre activo sin ese delay, el paso a un plan pago de Render es simple y no requiere migrar de plataforma.

## Preparación previa al deploy

1. **Monorepo en GitHub**: subir la carpeta `GurkCRM` completa (con `frontend/`, `backend/`, `docs/`) como un único repositorio, o separarlos en dos repos si preferís pipelines independientes. Para un proyecto de portfolio, un monorepo simplifica mostrar el trabajo completo en un solo link.
2. Verificar que `.env` esté en `.gitignore` y que exista `.env.example` en ambas carpetas.
3. Confirmar que el `schema.prisma` apunte a `sqlserver` como provider y que las migraciones estén generadas (`prisma migrate dev`) antes del primer deploy.

## Deploy del Frontend (Vercel)

1. Conectar el repo de GitHub en Vercel.
2. Root Directory: `frontend/` (si es monorepo).
3. Framework Preset: Astro (autodetectado).
4. Variables de entorno: `PUBLIC_API_URL` apuntando a la URL pública del backend ya deployado.
5. Build Command: `npm run build` (Astro por defecto), Output: `dist/`.

## Deploy del Backend (Render)

1. Nuevo Web Service → Deploy from GitHub → seleccionar repo, Root Directory: `backend/`.
2. Build Command: `npm install && npm run build && npx prisma generate`.
3. Start Command: `npm run start` (asumiendo build previo con `tsc` a `dist/server.js`).
4. Agregar variables de entorno (ver [08-variables-entorno.md](./08-variables-entorno.md)), incluyendo `DATABASE_URL` apuntando a Azure SQL Database.
5. Ejecutar `npx prisma migrate deploy` como parte del build/release step (no `migrate dev` en producción).
6. Tener en cuenta el "spin down" del free tier: el servicio se apaga tras ~15 min de inactividad y la primera request después tarda ~1 min en responder. Esto es aceptable para un portfolio, pero vale la pena advertirlo si alguien va a evaluar el proyecto en vivo (por ejemplo, con una nota en el README del repo).

> **Nota histórica:** este documento originalmente sugería Railway como alternativa. Se descartó porque eliminó su capa gratuita permanente (pide tarjeta desde el registro, solo ofrece créditos de prueba por 30 días) — ver la sección "Por qué Render y no Railway" más arriba.

### VPS (alternativa con más control)
- Requiere configurar manualmente: Node.js, PM2 (o similar) para mantener el proceso vivo, Nginx como reverse proxy con SSL (Let's Encrypt), y SQL Server instalado o en contenedor Docker.
- Recomendado solo si ya tenés experiencia con administración de servidores; para portfolio, Render es más rápido de mostrar funcionando.

## Base de Datos en producción

- **Azure SQL Database**, usando la oferta gratuita ampliada: hasta 10 bases serverless por suscripción, con 100.000 vCore-segundos y 32 GB de almacenamiento gratis por mes, de por vida de la suscripción (no expira como un trial). El auto-pause cuando la base está inactiva es aceptable para un portfolio.
- Alternativa: correr SQL Server en un contenedor Docker dentro del mismo VPS (más económico pero menos "producción real").
- Guardar el `DATABASE_URL` de producción únicamente como variable de entorno del servicio de backend, nunca en el repo.

## CORS

El backend debe permitir explícitamente el origen del frontend deployado:

```ts
app.use(cors({
  origin: process.env.CLIENT_URL, // URL de Vercel en producción
  credentials: true, // necesario para las cookies httpOnly del refresh token
}));
```

## Checklist antes de compartir el link del portfolio

- [ ] Seed de datos ficticios cargado (no mostrar la app vacía).
- [ ] Crear un usuario "demo" de solo lectura (rol Viewer) para que reclutadores puedan explorar sin poder romper datos, o resetear el seed periódicamente.
- [ ] HTTPS activo en ambos servicios (por defecto en Vercel/Render).
- [ ] Variables `JWT_*_SECRET` distintas de las usadas en desarrollo.
- [ ] `COOKIE_SECURE=true` en producción.
- [ ] README del repo con capturas, link al deploy y stack tecnológico (ver plantilla en [10-convenciones-codigo.md](./10-convenciones-codigo.md)).
