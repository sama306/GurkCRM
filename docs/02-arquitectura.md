# 02. Arquitectura

## Visión general

GurkCRM se compone de dos aplicaciones independientes que se comunican por API REST:

```
┌─────────────────────┐        HTTPS / JSON        ┌─────────────────────┐
│      FRONTEND        │ ──────────────────────────▶│       BACKEND        │
│  Astro + React + TS   │◀────────────────────────── │  Node.js + Express    │
│  (Vercel)             │        REST API             │  (Railway/Render/VPS) │
└─────────────────────┘                             └───────────┬─────────┘
                                                                  │ Prisma ORM
                                                                  ▼
                                                        ┌─────────────────┐
                                                        │  SQL Server        │
                                                        └─────────────────┘
```

- El **frontend** es una SPA/SSR híbrida con Astro (islas de React para partes interactivas) que consume la API vía TanStack Query.
- El **backend** expone una API REST versionada, sin estado (stateless), autenticada por JWT.
- La **base de datos** es relacional (SQL Server), accedida exclusivamente a través de Prisma ORM.

## Backend: Clean Architecture por capas

```
backend/
├── src/
│   ├── modules/                 # Un folder por entidad de negocio
│   │   ├── auth/
│   │   ├── users/
│   │   ├── companies/
│   │   ├── customers/
│   │   ├── contacts/
│   │   ├── deals/
│   │   ├── tasks/
│   │   ├── comments/
│   │   ├── notifications/
│   │   └── activities/
│   │       ├── {module}.routes.ts
│   │       ├── {module}.controller.ts
│   │       ├── {module}.service.ts
│   │       ├── {module}.repository.ts
│   │       ├── {module}.dto.ts
│   │       └── {module}.schema.ts     # Zod
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts     # valida con Zod
│   ├── shared/
│   │   ├── errors/                    # clases de error custom (AppError, etc.)
│   │   ├── utils/
│   │   └── types/
│   ├── config/
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── app.ts / server.ts
```

### Responsabilidad de cada capa

| Capa | Responsabilidad |
|---|---|
| **Routes** | Define endpoints y conecta middlewares + controller. No tiene lógica. |
| **Controller** | Recibe `req/res`, llama al service, formatea la respuesta HTTP. No tiene lógica de negocio. |
| **Service** | Lógica de negocio pura. Orquesta repositorios. Lanza errores de dominio. |
| **Repository** | Única capa que habla con Prisma/la base de datos. Abstrae las queries. |
| **DTO** | Forma de los datos que entran/salen de la API (evita exponer el modelo de Prisma tal cual). |
| **Schema (Zod)** | Validación de inputs (body, params, query). |

Este orden de dependencia es unidireccional: `Routes → Controller → Service → Repository → Prisma`. Ninguna capa "salta" a otra que no sea la inmediata inferior.

### Principios aplicados

- **SOLID**, en particular *Single Responsibility* (cada capa hace una cosa) e *Inversión de dependencias* (los services no dependen de Prisma directamente, sino de la interfaz del repository).
- **Repository Pattern**: aísla el ORM. Si mañana cambia SQL Server por Postgres, solo se toca la capa repository.
- **DTOs**: nunca se devuelve el modelo de Prisma crudo (por ejemplo, nunca se debe filtrar el hash de la contraseña).
- **Middleware de validación**: todo input pasa por un schema de Zod antes de llegar al controller.
- **Manejo de errores centralizado**: un único `error.middleware.ts` traduce errores de dominio a códigos HTTP.

## Frontend: arquitectura por features

Ver el detalle completo en [06-frontend-estructura.md](./06-frontend-estructura.md). En resumen:

- **Astro** maneja el ruteo y el renderizado de páginas estáticas/SSR (Landing, Login, Registro).
- **React** se usa como islas interactivas dentro de Astro para el Dashboard y todos los módulos internos de la app (que en la práctica funcionan como una SPA una vez logueado).
- **TanStack Query** gestiona el estado de servidor (fetching, cache, invalidación) — reemplaza la necesidad de guardar datos de API en Zustand.
- **Zustand** gestiona estado de UI/cliente (sidebar abierta/cerrada, tema claro/oscuro, filtros locales, usuario autenticado en memoria).
- **React Hook Form + Zod**: mismos schemas de validación reutilizados (o espejados) entre frontend y backend.

## Comunicación Frontend ↔ Backend

- REST sobre HTTPS, JSON como formato de intercambio.
- Autenticación vía header `Authorization: Bearer <access_token>`.
- Access token de vida corta (ej. 15 min) + refresh token de vida larga (ej. 7 días) almacenado en cookie `httpOnly`.
- Convenciones de la API en [04-api-endpoints.md](./04-api-endpoints.md).

## Multi-tenancy (consideración de diseño)

Al ser un SaaS, cada **Company** (empresa que contrata el CRM, no confundir con la entidad "Empresa cliente") debería aislar sus datos. Para el alcance de portfolio se recomienda:

- Modelo **single-database, shared schema** con una columna `tenantId` / `organizationId` en las tablas principales.
- Todos los queries del backend filtran automáticamente por `tenantId` del usuario autenticado (se puede resolver con un middleware que inyecta el filtro, o con Prisma Client Extensions).
- Esto se documenta en detalle en [03-modelo-datos.md](./03-modelo-datos.md).

## Por qué esta arquitectura (justificación para portfolio/entrevistas)

- Separar en capas permite testear el `service` sin tocar la base de datos (mockeando el repository).
- El Repository Pattern facilita mostrar dominio de abstracción de datos, algo muy valorado en entrevistas técnicas.
- Zod compartido entre frontend/backend reduce duplicación y bugs de validación inconsistente.
- TanStack Query + Zustand es el patrón estándar actual en la industria para separar estado de servidor vs. estado de cliente (evita el anti-patrón de guardar todo en un store global).
