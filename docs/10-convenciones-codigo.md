# 10. Convenciones de Código y Buenas Prácticas

## Naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de componentes React | PascalCase | `CustomerTable.tsx` |
| Archivos de hooks | camelCase con prefijo `use` | `useCustomers.ts` |
| Archivos de servicios | kebab-case + `.service.ts` | `customers.service.ts` |
| Archivos de schemas Zod | kebab-case + `.schema.ts` | `customer.schema.ts` |
| Variables y funciones | camelCase | `getCustomerById` |
| Tipos e Interfaces | PascalCase | `CustomerDTO`, `DealStage` |
| Constantes globales | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Tablas de base de datos (Prisma model) | PascalCase singular | `Customer`, `Deal` |
| Rutas de la API | kebab-case, plural | `/companies`, `/refresh-token` |

## Estructura de commits (Conventional Commits)

```
<tipo>(<alcance opcional>): <descripción corta>

[cuerpo opcional]
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`.

Ejemplos:
```
feat(deals): agregar drag & drop al kanban de oportunidades
fix(auth): corregir expiración incorrecta del refresh token
docs: agregar documentación de modelo de datos
refactor(customers): mover lógica de filtrado al repository
```

## Branching

- `main`: rama estable, deployable.
- `develop` (opcional para portfolio, puede omitirse y trabajar directo con feature branches → main).
- `feature/nombre-corto`: una rama por funcionalidad (ej. `feature/kanban-deals`, `feature/auth-jwt`).

## ESLint + Prettier

- Configuración compartida (o espejada) entre `frontend/` y `backend/`.
- Reglas base recomendadas: `eslint:recommended`, `@typescript-eslint/recommended`, `eslint-config-prettier` (para que Prettier gane en formateo y ESLint no pelee con él).
- Prettier: comillas simples, punto y coma obligatorio, `printWidth: 100`, `trailingComma: all`.
- Hook de pre-commit sugerido con **Husky + lint-staged** para correr lint/format automáticamente antes de cada commit.

## TypeScript

- `strict: true` en `tsconfig.json` de ambos proyectos, sin excepciones.
- Evitar `any`; usar `unknown` + type guards cuando el tipo no se conoce de antemano.
- Tipos de dominio (`Customer`, `Deal`, etc.) centralizados y, si es posible, generados/espejados desde los DTOs del backend para que frontend y backend no diverjan.

## Buenas prácticas de backend

- Un `service` nunca accede a `req`/`res` directamente — solo recibe parámetros primitivos/DTOs.
- Un `repository` nunca contiene lógica de negocio, solo queries.
- Los errores de dominio se lanzan como clases custom (`NotFoundError`, `ValidationError`, `ForbiddenError`) capturadas por el `error.middleware.ts` central, que las traduce a la respuesta HTTP estándar (ver [04-api-endpoints.md](./04-api-endpoints.md)).
- Toda validación de input pasa por Zod antes de llegar al controller.

## Buenas prácticas de frontend

- Componentes pequeños y enfocados (evitar componentes de +300 líneas; extraer subcomponentes).
- Lógica de datos siempre en hooks (`useCustomers`, no `fetch` directo dentro del componente).
- Nada de estado de servidor duplicado en Zustand (ver [06-frontend-estructura.md](./06-frontend-estructura.md)).
- Accesibilidad: labels asociados a inputs, roles ARIA en componentes custom, contraste de color adecuado en ambos temas.

## README del repositorio (plantilla sugerida)

El `README.md` en la raíz del repo (distinto a esta carpeta `docs/`) debería incluir:

1. Nombre y descripción corta del proyecto.
2. Capturas de pantalla / GIF del Kanban y Dashboard.
3. Link al deploy en vivo.
4. Stack tecnológico (badges).
5. Instrucciones de instalación local (`frontend/` y `backend/` por separado).
6. Link a esta carpeta `docs/` para documentación técnica extendida.
7. Roles de usuario demo (si se deja un usuario público para explorar).
