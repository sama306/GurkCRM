# 11. Roadmap Sugerido

> Dividido en fases pensadas para ir mostrando avances concretos y deployables, en lugar de construir todo en paralelo.

## Fase 0 — Setup

- [ ] Crear repo en GitHub, estructura `frontend/` + `backend/` + `docs/`.
- [ ] Configurar backend base: Express + TypeScript + estructura de carpetas ([02-arquitectura.md](./02-arquitectura.md)).
- [ ] Configurar Prisma + conexión a SQL Server local (Docker recomendado para desarrollo).
- [ ] Configurar frontend base: Astro + React + TypeScript + Tailwind + shadcn/ui.
- [ ] ESLint + Prettier + Husky en ambos proyectos.
- [ ] `.env.example` en ambas carpetas.

## Fase 1 — Base de datos y Auth (backend)

- [ ] Escribir `schema.prisma` completo a partir de [03-modelo-datos.md](./03-modelo-datos.md).
- [ ] Generar y correr migraciones.
- [ ] Seed de datos ficticios (Organization, Users, Companies, Customers, Deals, Tasks).
- [ ] Endpoints de `/auth` (register, login, refresh, logout, forgot/reset password).
- [ ] Middlewares de auth y roles.

## Fase 2 — Auth (frontend) + Landing

- [ ] Landing Page (Hero, Features, Pricing, FAQ, Contacto).
- [ ] Páginas de Login / Registro / Recuperar contraseña.
- [ ] Store de auth (Zustand) + cliente HTTP con interceptor de refresh.
- [ ] Middleware de protección de rutas `/app/*`.

## Fase 3 — Módulos core del CRM

- [ ] Backend: endpoints CRUD de Companies, Contacts, Customers, Deals, Tasks.
- [ ] Frontend: listados con tabla + filtros + paginación para cada módulo.
- [ ] Frontend: formularios de creación/edición (React Hook Form + Zod) para cada módulo.
- [ ] Frontend: Kanban de Deals con drag & drop.

## Fase 4 — Dashboard MVP

- [ ] Endpoint `/dashboard/summary`.
- [ ] Widgets de resumen (clientes activos, oportunidades, ventas, tareas pendientes).

## Fase 5 — Roles y configuración

- [ ] Gestión de usuarios y roles (Admin/Owner).
- [ ] Pantalla de configuración de cuenta y organización.
- [ ] Modo claro/oscuro.

## Fase 6 — Deploy del MVP

- [ ] Deploy backend (Railway/Render) + base de datos.
- [ ] Deploy frontend (Vercel).
- [ ] Checklist de [09-deployment.md](./09-deployment.md).
- [ ] README principal del repo con capturas y link al deploy.

> En este punto ya tenés un CRM funcional y deployado para mostrar en el portfolio. Todo lo siguiente son diferenciadores (Fase 2 del proyecto).

## Fase 7 — Diferenciadores (post-MVP)

- [ ] Calendario visual.
- [ ] Comentarios en Customers/Deals.
- [ ] Archivos adjuntos (definir proveedor de storage).
- [ ] Notificaciones in-app.
- [ ] Analytics avanzado con Recharts (gráficos de ventas, conversión, actividad mensual).
- [ ] Auditoría de acciones (entidad `Activity` + vista de historial).
- [ ] Exportar PDF/Excel.
- [ ] Búsqueda global.
- [ ] Command Palette y atajos de teclado.
- [ ] Pulido de animaciones (Framer Motion) y accesibilidad.

## Próximos pasos inmediatos (según pediste)

1. Prompt para generar el `schema.prisma` completo a partir de [03-modelo-datos.md](./03-modelo-datos.md).
2. Prompt para el script de seed con datos ficticios (`@faker-js/faker`) según lo descrito en la sección final de ese mismo documento.
