# 05. Autenticación y Roles

## Flujo de autenticación

### Registro
1. Usuario completa formulario (nombre organización, nombre completo, email, contraseña).
2. Backend crea `Organization` + `User` con rol `OWNER` en una transacción.
3. Contraseña se hashea con **bcrypt** (cost factor 10-12) antes de guardar.
4. Se emite `accessToken` (JWT) + `refreshToken`, igual que en login.

### Login
1. Usuario envía email + contraseña.
2. Backend busca el `User`, compara con `bcrypt.compare`.
3. Si es válido, genera:
   - **Access Token** (JWT, vida corta: ~15 min): payload con `userId`, `organizationId`, `role`.
   - **Refresh Token** (vida larga: ~7 días): se guarda hasheado en la tabla `RefreshToken`, se envía al cliente en **cookie `httpOnly`, `secure`, `sameSite=strict`**.
4. El `accessToken` se devuelve en el body de la respuesta (el frontend lo guarda en memoria/Zustand, **no** en localStorage, para reducir riesgo de XSS).

### Refresh
1. Cuando el `accessToken` expira, el frontend llama a `/auth/refresh` (la cookie se envía automáticamente).
2. Backend valida el refresh token contra el hash guardado y su `expiresAt`.
3. Si es válido: revoca el token usado (rotación) y emite un par nuevo (access + refresh). Esto mitiga *replay attacks*.
4. Si es inválido/expirado: 401, el frontend redirige a login.

### Logout
- Revoca el `refreshToken` actual (`revokedAt = now()`), limpia la cookie.

### Recuperar contraseña
1. `POST /auth/forgot-password` con email → si existe, genera un token de un solo uso (JWT corto o UUID con expiración de 1h) y lo envía por email (o lo loguea en consola en desarrollo, dado que es un proyecto de portfolio sin proveedor de email real inicialmente).
2. `POST /auth/reset-password` con `{ token, newPassword }` → valida, actualiza `passwordHash`, invalida todos los refresh tokens existentes del usuario (fuerza a re-loguearse en todos los dispositivos).

## Seguridad adicional

- Rate limiting en `/auth/login` y `/auth/forgot-password` (ej. `express-rate-limit`) para mitigar fuerza bruta.
- Bloqueo temporal tras N intentos fallidos (opcional, fase 2).
- Todas las contraseñas: mínimo 8 caracteres, validado con Zod tanto en frontend como backend.

## Roles y permisos (RBAC)

| Rol | Descripción |
|---|---|
| **Owner** | Acceso completo. Único que puede eliminar la organización o transferir ownership. |
| **Admin** | Administración general: gestiona usuarios, roles, configuración, y todos los datos comerciales. |
| **Sales** | Gestión comercial: CRUD sobre Customers, Companies, Contacts, Deals, Tasks propias/asignadas. No gestiona usuarios ni configuración. |
| **Viewer** | Solo lectura sobre todos los módulos comerciales. No puede crear, editar ni eliminar. |

### Matriz de permisos (resumen)

| Recurso | Owner | Admin | Sales | Viewer |
|---|---|---|---|---|
| Users (gestión) | ✅ | ✅ | ❌ | ❌ |
| Settings organización | ✅ | ✅ | ❌ | ❌ |
| Companies / Customers / Contacts (CRUD) | ✅ | ✅ | ✅ (CU, no D) | Solo lectura |
| Deals (CRUD) | ✅ | ✅ | ✅ (CU, no D) | Solo lectura |
| Tasks (propias) | ✅ | ✅ | ✅ | Solo lectura |
| Eliminar registros | ✅ | ✅ | ❌ | ❌ |
| Ver Dashboard/Analytics | ✅ | ✅ | ✅ | ✅ |

> Este permiso granular se puede modelar en el campo `Role.permissions` (JSON) para no hardcodear la lógica en el middleware, permitiendo a futuro roles custom.

## Implementación técnica

### Middleware de autenticación (`auth.middleware.ts`)
1. Extrae el `Bearer token` del header.
2. Verifica firma y expiración del JWT.
3. Adjunta `req.user = { id, organizationId, role }`.
4. Si falla: 401.

### Middleware de autorización (`role.middleware.ts`)
- Función factory: `requireRole(['ADMIN', 'OWNER'])` que se usa como middleware en las rutas que lo necesiten.
- Compara `req.user.role` contra los roles permitidos; si no matchea, 403.

### Scoping por tenant
- Un middleware o helper de repository inyecta automáticamente `where: { organizationId: req.user.organizationId }` en cada query, para que ningún usuario pueda ver datos de otra organización aunque adivine un ID.

## Variables de entorno relacionadas

Ver detalle completo en [08-variables-entorno.md](./08-variables-entorno.md):

```
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```
