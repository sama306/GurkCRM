# 04. API — Convenciones y Endpoints

## Convenciones generales

- Base URL: `/api/v1`
- Formato: JSON (`Content-Type: application/json`)
- Autenticación: header `Authorization: Bearer <accessToken>` (excepto rutas públicas)
- Nombres de recursos en plural: `/customers`, `/deals`, `/tasks`
- Filtros y paginación por query params: `?page=1&limit=20&search=texto&status=ACTIVE&sortBy=createdAt&order=desc`

### Formato de respuesta estándar

**Éxito (200/201):**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 134 }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo 'email' es requerido.",
    "details": []
  }
}
```

### Códigos de estado usados

| Código | Uso |
|---|---|
| 200 | OK (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request / validación |
| 401 | No autenticado |
| 403 | No autorizado (rol insuficiente) |
| 404 | No encontrado |
| 409 | Conflicto (ej. email duplicado) |
| 422 | Entidad no procesable |
| 500 | Error interno |

## Auth — `/api/v1/auth`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Crea Organization + User Owner | No |
| POST | `/auth/login` | Login, devuelve accessToken + set-cookie refreshToken | No |
| POST | `/auth/refresh` | Rota el refresh token, devuelve nuevo accessToken | Cookie |
| POST | `/auth/logout` | Revoca el refresh token actual | No (usa cookie de refresh token) |
| POST | `/auth/forgot-password` | Envía email con link de reseteo | No |
| POST | `/auth/reset-password` | Setea nueva contraseña con token | No |
| GET | `/auth/me` | Devuelve el usuario autenticado | Sí |

## Users — `/api/v1/users`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/users` | Lista usuarios de la organización | Admin |
| GET | `/users/:id` | Detalle de usuario | Admin |
| PATCH | `/users/:id` | Editar usuario (rol, activo/inactivo) | Admin |
| PATCH | `/users/me` | Editar perfil propio | Todos |
| PATCH | `/users/me/password` | Cambiar contraseña propia | Todos |

## Companies — `/api/v1/companies`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/companies` | Lista + filtros + paginación | Viewer |
| GET | `/companies/:id` | Detalle (incluye contacts) | Viewer |
| POST | `/companies` | Crear | Sales |
| PATCH | `/companies/:id` | Editar | Sales |
| DELETE | `/companies/:id` | Eliminar | Admin |

## Contacts — `/api/v1/contacts` (anidado también en `/companies/:companyId/contacts`)

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/companies/:companyId/contacts` | Lista contactos de una empresa | Viewer |
| POST | `/companies/:companyId/contacts` | Crear contacto | Sales |
| PATCH | `/contacts/:id` | Editar | Sales |
| DELETE | `/contacts/:id` | Eliminar | Admin |

## Customers — `/api/v1/customers`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/customers` | Lista + filtros (status, ownerId, search) + paginación | Viewer |
| GET | `/customers/:id` | Detalle (incluye deals, comments, files) | Viewer |
| POST | `/customers` | Crear | Sales |
| PATCH | `/customers/:id` | Editar | Sales |
| DELETE | `/customers/:id` | Eliminar (soft delete) | Admin |
| GET | `/customers/export` | Exportar CSV/Excel/PDF | Sales |

## Deals — `/api/v1/deals`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/deals` | Lista + filtros (stage, ownerId, customerId) | Viewer |
| GET | `/deals/board` | Agrupado por stage, listo para el Kanban | Viewer |
| GET | `/deals/:id` | Detalle | Viewer |
| POST | `/deals` | Crear | Sales |
| PATCH | `/deals/:id` | Editar campos | Sales |
| PATCH | `/deals/:id/stage` | Mover de columna (drag & drop) — actualiza `stage` + `position` | Sales |
| DELETE | `/deals/:id` | Eliminar | Admin |

## Tasks — `/api/v1/tasks`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/tasks` | Lista + filtros (status, priority, assigneeId, dueDate) | Viewer |
| GET | `/tasks/:id` | Detalle | Viewer |
| POST | `/tasks` | Crear | Sales |
| PATCH | `/tasks/:id` | Editar | Sales (propias) / Admin (todas) |
| PATCH | `/tasks/:id/status` | Cambiar estado rápido | Sales |
| DELETE | `/tasks/:id` | Eliminar | Sales (propias) / Admin |

## Comments — `/api/v1/comments`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/comments?entityType=DEAL&entityId=...` | Lista comentarios de una entidad | Viewer |
| POST | `/comments` | Crear comentario | Sales |
| DELETE | `/comments/:id` | Eliminar (propio o Admin) | Sales/Admin |

## Files — `/api/v1/files`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/files?entityType=CUSTOMER&entityId=...` | Lista archivos de una entidad | Viewer |
| POST | `/files` | Subir archivo (multipart) | Sales |
| DELETE | `/files/:id` | Eliminar | Sales/Admin |

## Notifications — `/api/v1/notifications`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/notifications` | Lista notificaciones del usuario autenticado | Todos |
| PATCH | `/notifications/:id/read` | Marcar como leída | Todos |
| PATCH | `/notifications/read-all` | Marcar todas como leídas | Todos |

## Dashboard / Analytics — `/api/v1/dashboard`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/dashboard/summary` | KPIs generales (clientes activos, ventas, oportunidades) | Viewer |
| GET | `/dashboard/sales-chart` | Serie temporal de ventas | Viewer |
| GET | `/dashboard/conversion-funnel` | Conversión por stage | Viewer |
| GET | `/dashboard/recent-activity` | Últimas actividades | Viewer |

## Search — `/api/v1/search`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/search?q=texto` | Búsqueda global (customers, companies, contacts, deals, users) | Viewer |

## Settings — `/api/v1/settings`

| Método | Endpoint | Descripción | Rol mínimo |
|---|---|---|---|
| GET | `/settings/organization` | Datos de la organización | Todos |
| PATCH | `/settings/organization` | Editar branding/nombre/zona horaria | Admin/Owner |

## Notas de implementación

- Todo endpoint que liste datos soporta `page`, `limit`, `search`, `sortBy`, `order` como estándar.
- Todo endpoint de escritura pasa por el middleware de validación Zod antes del controller.
- El `tenantId`/`organizationId` **nunca** se recibe del body/query: siempre se toma del JWT decodificado, para evitar que un usuario acceda a datos de otra organización.
