# GurkCRM — Documentación del Proyecto

CRM SaaS moderno para la gestión de clientes, oportunidades de negocio, tareas y equipos. Proyecto de portfolio orientado a demostrar habilidades Full Stack (Astro + React + TypeScript, Node/Express, SQL Server + Prisma).

## Índice de documentos

| Documento | Contenido |
|---|---|
| [01-overview.md](./01-overview.md) | Objetivo, alcance, público objetivo, MVP vs. futuro |
| [02-arquitectura.md](./02-arquitectura.md) | Arquitectura general, capas, Clean Architecture, patrones |
| [03-modelo-datos.md](./03-modelo-datos.md) | Entidades, relaciones, diagrama ER, diccionario de datos |
| [04-api-endpoints.md](./04-api-endpoints.md) | Especificación de la API REST, convenciones, endpoints por módulo |
| [05-autenticacion-roles.md](./05-autenticacion-roles.md) | JWT, refresh tokens, bcrypt, roles y permisos (RBAC) |
| [06-frontend-estructura.md](./06-frontend-estructura.md) | Estructura de carpetas, componentes, estado global, formularios |
| [07-funcionalidades.md](./07-funcionalidades.md) | Detalle funcional de cada módulo (Clientes, Deals, Kanban, etc.) |
| [08-variables-entorno.md](./08-variables-entorno.md) | Variables de entorno de frontend y backend |
| [09-deployment.md](./09-deployment.md) | Deploy en Vercel + Railway/Render + SQL Server |
| [10-convenciones-codigo.md](./10-convenciones-codigo.md) | Naming, estructura de commits, ESLint/Prettier, buenas prácticas |
| [11-roadmap.md](./11-roadmap.md) | Fases de desarrollo sugeridas, checklist por sprint |

## Cómo usar esta documentación

1. Leé `01-overview.md` y `02-arquitectura.md` primero: definen las decisiones estructurales de todo el proyecto.
2. `03-modelo-datos.md` es la base para crear el schema de Prisma y las migraciones de SQL Server — lo vas a necesitar antes de escribir cualquier prompt de base de datos.
3. `04-api-endpoints.md` y `05-autenticacion-roles.md` guían el desarrollo del backend.
4. `06-frontend-estructura.md` y `07-funcionalidades.md` guían el desarrollo del frontend, módulo por módulo.
5. `08` a `11` son transversales: entorno, deploy, convenciones y planificación.

## Estructura de carpetas del repo

```
GurkCRM/
├── frontend/      # Astro + React + TypeScript
├── backend/       # Node.js + Express + Prisma
└── docs/          # Esta documentación
```
