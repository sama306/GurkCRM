# 03. Modelo de Datos

> Este documento es la base para escribir el `schema.prisma` y las migraciones de SQL Server. Está pensado para poder pedir directamente "generá el schema.prisma a partir de este documento" más adelante.

## Convenciones generales

- Todas las tablas tienen `id` (UUID/`cuid`), `createdAt`, `updatedAt`.
- Soft delete opcional vía `deletedAt` (nullable) en entidades principales (Customer, Company, Deal) para no perder historial.
- Multi-tenant: las tablas de negocio tienen `organizationId` (la empresa que usa el SaaS), no confundir con `Company` (empresa del cliente del CRM).
- Nombres de tabla en PascalCase singular (convención Prisma), nombres de columna en camelCase.

## Diagrama de entidades (alto nivel)

```
Organization (tenant del SaaS)
   │
   ├── User ──────────────┐
   │     │                 │
   │     ├── Task ◀────────┤ (assignee)
   │     ├── Activity       │
   │     └── Notification   │
   │                        │
   ├── Company (cliente)    │
   │     └── Contact        │
   │     └── Customer ──────┘
   │           │
   │           └── Deal
   │                 ├── Comment
   │                 ├── File
   │                 └── Activity
   │
   ├── Role (Owner/Admin/Sales/Viewer)
   │
   └── Invitation
         └── email → se crea User al aceptar
```

## Diccionario de entidades

### Organization *(tenant — la empresa dueña de la cuenta SaaS)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | string | |
| logoUrl | string? | |
| primaryColor | string? | branding |
| timezone | string | default `UTC` |
| createdAt / updatedAt | DateTime | |

### User
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| roleId | UUID | FK → Role |
| fullName | string | |
| email | string | unique |
| passwordHash | string | bcrypt, nunca exponer en DTO |
| avatarUrl | string? | |
| isActive | boolean | default true |
| lastLoginAt | DateTime? | |
| createdAt / updatedAt | DateTime | |

Relación 1:N con `RefreshToken` (una sesión/dispositivo por token).

### RefreshToken
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| tokenHash | string | se guarda hasheado, no en texto plano |
| expiresAt | DateTime | |
| revokedAt | DateTime? | para logout / invalidación |
| createdAt | DateTime | |

### Role
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | enum | `OWNER`, `ADMIN`, `SALES`, `VIEWER` |
| permissions | JSON | mapa de permisos por recurso (ver [05-autenticacion-roles.md](./05-autenticacion-roles.md)) |

### Company *(empresa cliente del CRM, no confundir con Organization)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK, tenant |
| name | string | |
| industry | string? | |
| website | string? | |
| address | string? | |
| size | enum? | `1-10`, `11-50`, `51-200`, `201+` |
| status | enum | `ACTIVE`, `INACTIVE` |
| createdAt / updatedAt | DateTime | |

### Contact *(persona de contacto dentro de una Company)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| companyId | UUID | FK → Company |
| fullName | string | |
| position | string? | cargo |
| email | string? | |
| phone | string? | |
| socialLinks | JSON? | |
| createdAt / updatedAt | DateTime | |

### Customer *(cliente individual — puede o no pertenecer a una Company)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK, tenant |
| companyId | UUID? | FK → Company (opcional) |
| ownerId | UUID | FK → User, responsable comercial |
| fullName | string | |
| email | string? | |
| phone | string? | |
| address | string? | |
| status | enum | `LEAD`, `ACTIVE`, `INACTIVE` |
| notes | text? | |
| createdAt / updatedAt / deletedAt | DateTime | |

### Deal *(oportunidad, entidad del pipeline)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK, tenant |
| customerId | UUID | FK → Customer |
| companyId | UUID? | FK → Company |
| ownerId | UUID | FK → User, responsable |
| title | string | |
| estimatedValue | decimal | |
| currency | string | default `USD` |
| stage | enum | `NEW`, `CONTACTED`, `MEETING`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST` |
| expectedCloseDate | Date? | |
| lostReason | string? | solo si `stage = LOST` |
| position | int | orden dentro de la columna del Kanban |
| createdAt / updatedAt | DateTime | |

### Task
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK, tenant |
| assigneeId | UUID | FK → User |
| relatedCustomerId | UUID? | FK → Customer (opcional) |
| relatedDealId | UUID? | FK → Deal (opcional) |
| title | string | |
| description | text? | |
| priority | enum | `LOW`, `MEDIUM`, `HIGH` |
| dueDate | DateTime? | |
| status | enum | `PENDING`, `IN_PROGRESS`, `DONE` |
| createdAt / updatedAt | DateTime | |

### Comment *(polimórfico: puede pertenecer a Customer o Deal)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| authorId | UUID | FK → User |
| entityType | enum | `CUSTOMER`, `DEAL` |
| entityId | UUID | id de la entidad referenciada |
| body | text | |
| createdAt | DateTime | |

### File *(archivos adjuntos, polimórfico igual que Comment)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| uploadedById | UUID | FK → User |
| entityType | enum | `CUSTOMER`, `DEAL` |
| entityId | UUID | |
| fileName | string | |
| fileUrl | string | URL en storage (S3/Cloudinary/etc.) |
| fileType | string | mime type |
| sizeBytes | int | |
| createdAt | DateTime | |

### Notification
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User, destinatario |
| type | enum | `NEW_CUSTOMER`, `TASK_ASSIGNED`, `NEW_COMMENT`, `REMINDER` |
| title | string | |
| body | string? | |
| isRead | boolean | default false |
| linkUrl | string? | deep link al recurso |
| createdAt | DateTime | |

### Invitation *(invitación por email para unirse a una organización)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizationId | UUID | FK → Organization |
| email | string | email del invitado (no necesita ser un User existente) |
| roleId | UUID | FK → Role, rol que se le asignará al aceptar |
| invitedById | UUID | FK → User, quien creó la invitación |
| tokenHash | string | token de aceptación, se guarda hasheado (mismo criterio que RefreshToken) |
| status | enum | `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED` |
| expiresAt | DateTime | 7 días desde creación |
| createdAt | DateTime | |
| acceptedAt | DateTime? | null hasta que se acepte |
| updatedAt | DateTime | |

### Activity *(log de auditoría / historial de actividad)*
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User, quien ejecutó la acción |
| entityType | enum | `CUSTOMER`, `DEAL`, `TASK`, `COMPANY` |
| entityId | UUID | |
| action | enum | `CREATED`, `UPDATED`, `DELETED`, `STAGE_CHANGED` |
| metadata | JSON? | diff de cambios |
| createdAt | DateTime | |

## Relaciones clave (resumen)

- `Organization 1—N User`
- `Organization 1—N Company/Customer/Deal/Task` (tenant scoping)
- `Company 1—N Contact`
- `Company 1—N Customer` (opcional)
- `Customer 1—N Deal`
- `User 1—N Deal` (como owner)
- `User 1—N Task` (como assignee)
- `Deal 1—N Comment`, `Deal 1—N File`
- `Customer 1—N Comment`, `Customer 1—N File`
- `User 1—N Notification`
- `User 1—N Activity`
- `Organization 1—N Invitation`
- `Role 1—N Invitation` (rol propuesto)
- `User 1—N Invitation` (como invitedBy)

## Índices recomendados

- `User.email` — unique
- `Deal.stage` + `Deal.organizationId` — para queries del Kanban
- `Task.assigneeId` + `Task.status`
- `Comment.entityType` + `Comment.entityId`
- `File.entityType` + `File.entityId`
- `Notification.userId` + `Notification.isRead`
- `Invitation.organizationId` + `Invitation.status` — para listar invitaciones activas
- `Invitation.email` + `Invitation.organizationId` — para detectar duplicados PENDING

## Datos ficticios (seed) — a definir en el prompt de base de datos

Cuando armes el prompt de seed, conviene generar:
- 1 Organization de prueba.
- 4 Users (uno por rol: Owner, Admin, Sales, Viewer).
- ~10 Companies con industrias variadas.
- ~15 Contacts distribuidos entre esas Companies.
- ~30 Customers (algunos con Company, otros sin).
- ~40 Deals distribuidos en todos los stages del pipeline (para que el Kanban se vea poblado).
- ~25 Tasks con distintas prioridades y estados.
- Algunos Comments y Notifications de ejemplo.

Esto se puede pedir como prompt separado usando `Prisma seed.ts` + una librería como `@faker-js/faker`.

## Notas de implementación

El archivo `backend/prisma/schema.prisma` fue generado y validado contra SQL Server. Las siguientes decisiones de implementación divergen del modelo "ideal" documentado arriba debido a limitaciones del conector Prisma/SQL Server o a características del lenguaje no soportadas:

### 1. Enums como String
SQL Server no soporta enums nativos en Prisma. Todos los campos que en el documento se listan como tipo `enum` (`DealStage`, `CustomerStatus`, `CompanyStatus`, `CompanySize`, `TaskPriority`, `TaskStatus`, `RoleName`, `CommentEntityType`, `FileEntityType`, `NotificationType`, `ActivityEntityType`, `ActivityAction`) se almacenan como `String` con comentarios inline indicando los valores permitidos. La validación de valores se realiza en la capa de aplicación mediante schemas Zod.

### 2. JSON como String
Los campos `Role.permissions`, `Contact.socialLinks` y `Activity.metadata` se definen como `String` en lugar de `Json` porque el conector SQL Server de Prisma no expone el tipo JSON nativo. La serialización/deserialización se maneja en la capa de repository.

### 3. onDelete / onUpdate: NoAction en entidades multi-tenant
Las entidades Customer, Deal y Task forman un grafo de relaciones con Organization, Company y User que genera múltiples rutas de cascade (ciclos referenciales). Para evitarlo, todas las FKs dentro de estos tres modelos llevan `onDelete: NoAction` y `onUpdate: NoAction`. La limpieza de datos huerfanos se resuelve a nivel de aplicación (service layer).

### 4. Relaciones polimórficas sin @relation nativa
Comment y File referencian a Customer o Deal mediante `entityType` + `entityId`. Prisma no soporta relaciones polimórficas directas, por lo que estos campos se modelan como columnas planas (sin `@relation`). La integridad referencial se garantiza en la capa de aplicación (repository/service), no a nivel de base de datos.
