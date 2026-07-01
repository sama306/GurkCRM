# 06. Frontend — Estructura y Convenciones

## Estructura de carpetas

```
frontend/
├── src/
│   ├── pages/                     # Rutas de Astro
│   │   ├── index.astro            # Landing
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── forgot-password.astro
│   │   └── app/                   # Rutas protegidas (islas React)
│   │       ├── dashboard.astro
│   │       ├── customers/
│   │       ├── companies/
│   │       ├── deals/
│   │       ├── tasks/
│   │       ├── calendar/
│   │       └── settings/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (button, input, dialog, etc.)
│   │   └── layouts/               # Navbar, Sidebar, Footer
│   ├── features/                  # Un folder por dominio de negocio
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── schemas/           # Zod schemas (login, register, reset)
│   │   ├── customers/
│   │   │   ├── components/        # CustomerTable, CustomerForm, CustomerCard
│   │   │   ├── hooks/             # useCustomers, useCreateCustomer (TanStack Query)
│   │   │   └── schemas/
│   │   ├── companies/
│   │   ├── contacts/
│   │   ├── deals/
│   │   │   ├── components/        # KanbanBoard, DealCard, DealColumn
│   │   │   ├── hooks/
│   │   │   └── schemas/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── settings/
│   ├── hooks/                     # Hooks genéricos (useDebounce, useMediaQuery)
│   ├── services/                  # Cliente HTTP (axios/fetch wrapper) + funciones por módulo
│   │   ├── api-client.ts          # instancia base + interceptores (refresh token)
│   │   ├── customers.service.ts
│   │   ├── deals.service.ts
│   │   └── ...
│   ├── stores/                    # Zustand
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts            # sidebar, tema
│   │   └── filters.store.ts
│   ├── schemas/                   # Zod schemas globales/compartidos
│   ├── types/                     # Tipos TS compartidos (idealmente generados o espejados del backend)
│   ├── layouts/                   # Layouts de Astro (AppLayout, AuthLayout, PublicLayout)
│   ├── middleware/                # Middleware de Astro (protección de rutas /app/*)
│   ├── utils/                     # formatters, constants, helpers
│   └── styles/                    # Tailwind config, globals.css
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

## Por qué Astro + islas de React

- Astro renderiza la Landing como HTML estático (excelente SEO/performance) sin cargar el runtime de React innecesariamente.
- Las páginas internas (`/app/*`) usan **islas de React** (`client:load`) para la interactividad (tablas, formularios, Kanban), evitando enviar JS de más a páginas públicas.
- El área autenticada, en la práctica, se comporta como una SPA: una vez montada la isla raíz del dashboard, la navegación interna puede resolverse con un router de cliente (o con Astro View Transitions) sin recargar toda la página.

## Manejo de estado

| Tipo de estado | Herramienta | Ejemplos |
|---|---|---|
| Estado de servidor (datos remotos) | **TanStack Query** | lista de clientes, detalle de un deal, dashboard KPIs |
| Estado de UI/cliente | **Zustand** | sidebar abierta, tema claro/oscuro, usuario en sesión (derivado del JWT decodificado), filtros de tabla activos |
| Estado de formulario | **React Hook Form** | cualquier formulario de creación/edición |
| Validación | **Zod** | schemas compartidos entre formularios y (idealmente) espejados de los del backend |

### Regla clave
Nunca duplicar en Zustand datos que ya gestiona TanStack Query. Zustand es para estado que "vive" en el cliente, no para cachear respuestas de la API.

## Convención de hooks por feature (ejemplo: customers)

```ts
// features/customers/hooks/useCustomers.ts
export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersService.getAll(filters),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
```

## Manejo del refresh token en el cliente HTTP

`services/api-client.ts` implementa un interceptor:
1. Si una request devuelve 401, intenta `POST /auth/refresh` (cookie httpOnly se envía sola).
2. Si el refresh es exitoso, reintenta la request original con el nuevo access token.
3. Si el refresh falla, limpia el store de auth y redirige a `/login`.

## Protección de rutas

- `src/middleware/` (middleware de Astro) verifica la presencia de sesión válida antes de servir cualquier página bajo `/app/*`.
- Adicionalmente, en el cliente, un componente `<RequireAuth>` o hook `useAuthGuard` protege las islas de React como capa extra.

## Sistema de diseño

- **Tailwind CSS** como base de estilos utilitarios.
- **shadcn/ui** para componentes accesibles y consistentes (Button, Dialog, Dropdown, Table, Toast, etc.), copiados al repo (no es una dependencia de npm tradicional) y customizables.
- **Framer Motion** para transiciones sutiles (apertura de modales, cambios de vista, animaciones del Kanban al soltar una card).
- Modo claro/oscuro implementado con la estrategia `class` de Tailwind + `next-themes`-like store en Zustand (persistido).

## Formularios

- Cada formulario usa `React Hook Form` + `zodResolver`.
- Los schemas de Zod viven en `features/{modulo}/schemas/` y se reutilizan tanto para validar en el submit como para tipar el formulario (`z.infer<typeof schema>`).

## Recomendación de theming/tokens

Ver la skill de diseño frontend del proyecto para lineamientos de tipografía, espaciado y paleta cuando se empiece a maquetar (evitar el look "shadcn default" genérico).
