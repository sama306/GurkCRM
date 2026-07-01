# 09. Deployment

## Resumen

| Componente | Servicio sugerido | Notas |
|---|---|---|
| Frontend (Astro) | **Vercel** | Deploy automático desde GitHub, soporta Astro nativamente |
| Backend (Express) | **Railway** o **Render** | Ambos soportan Node.js + variables de entorno fácilmente. VPS como alternativa si se quiere más control |
| Base de datos | **SQL Server** administrado (Azure SQL Database tiene free tier) o SQL Server en el mismo VPS del backend | Evaluar costo/practicidad |

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

## Deploy del Backend (Railway o Render)

### Railway
1. Nuevo proyecto → Deploy from GitHub → seleccionar repo, Root Directory: `backend/`.
2. Agregar variables de entorno (ver [08-variables-entorno.md](./08-variables-entorno.md)).
3. Start Command: `npm run start` (asumiendo build previo con `tsc` o similar a `dist/server.js`).
4. Si SQL Server corre en el mismo Railway (plugin) o externo (Azure SQL), configurar `DATABASE_URL` acorde.
5. Ejecutar `npx prisma migrate deploy` como parte del build/release step (no `migrate dev` en producción).

### Render (alternativa)
- Mismo proceso: Web Service apuntando a `backend/`, con `Build Command: npm install && npm run build && npx prisma generate` y `Start Command: npm run start`.

### VPS (alternativa con más control)
- Requiere configurar manualmente: Node.js, PM2 (o similar) para mantener el proceso vivo, Nginx como reverse proxy con SSL (Let's Encrypt), y SQL Server instalado o en contenedor Docker.
- Recomendado solo si ya tenés experiencia con administración de servidores; para portfolio, Railway/Render es más rápido de mostrar funcionando.

## Base de Datos en producción

- **Azure SQL Database** es la opción más natural para SQL Server administrado, con un free tier (Basic tier) suficiente para un proyecto de portfolio.
- Alternativa: correr SQL Server en un contenedor Docker dentro del mismo VPS/Railway (más económico pero menos "producción real").
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
- [ ] HTTPS activo en ambos servicios (por defecto en Vercel/Railway/Render).
- [ ] Variables `JWT_*_SECRET` distintas de las usadas en desarrollo.
- [ ] `COOKIE_SECURE=true` en producción.
- [ ] README del repo con capturas, link al deploy y stack tecnológico (ver plantilla en [10-convenciones-codigo.md](./10-convenciones-codigo.md)).
