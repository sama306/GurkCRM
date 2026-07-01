# 01. Overview del Proyecto

## Nombre

**GurkCRM** — CRM SaaS para gestión de clientes, oportunidades comerciales, tareas y equipos.

## Objetivo general

Desarrollar una aplicación SaaS profesional que permita a pequeñas y medianas empresas administrar todo su proceso comercial desde un único lugar, sirviendo como pieza principal de portfolio para aplicar a posiciones de Frontend / Full Stack Developer.

## Objetivos técnicos

- Arquitectura escalable y desacoplada (Clean Architecture / capas).
- Código limpio, tipado end-to-end con TypeScript.
- Componentes reutilizables y diseño responsive (desktop, tablet, mobile).
- Buen rendimiento y accesibilidad (a11y).
- SEO en la Landing Page.
- Buenas prácticas de programación (SOLID, Repository Pattern, DTOs, validaciones).

## Público objetivo

- Agencias digitales
- Empresas de desarrollo
- Estudios jurídicos
- Consultoras
- Freelancers
- Empresas de servicios
- Equipos comerciales

## Alcance funcional (resumen)

- Landing Page pública (Hero, Features, Pricing, FAQ, Contacto).
- Autenticación (registro, login, recuperar contraseña, JWT + Refresh Token).
- Dashboard con resumen general y analytics.
- Gestión de Clientes, Empresas y Contactos.
- Pipeline de Oportunidades (Kanban con drag & drop).
- Tareas y Calendario.
- Comentarios y archivos adjuntos.
- Notificaciones.
- Configuración de cuenta/empresa.
- Roles y permisos (Owner, Admin, Sales, Viewer).
- Búsqueda global.
- Modo claro/oscuro.

El detalle funcional completo está en [07-funcionalidades.md](./07-funcionalidades.md).

## Estrategia de alcance: MVP vs. Fase 2

Para que el proyecto sea completable como portfolio en un tiempo razonable, se recomienda dividirlo en un **MVP** (funcional, deployable, demostrable) y una **Fase 2** de features avanzadas. Ver el detalle de fases en [11-roadmap.md](./11-roadmap.md).

**MVP (imprescindible):**
- Auth (registro/login/JWT/refresh)
- CRUD de Clientes, Empresas, Contactos
- Pipeline de Oportunidades (CRUD + Kanban básico)
- Tareas (CRUD)
- Dashboard con métricas básicas
- Roles y permisos básicos
- Landing Page

**Fase 2 (diferenciadores):**
- Calendario visual
- Comentarios y archivos adjuntos
- Notificaciones en tiempo real
- Analytics avanzado con gráficos (Recharts)
- Auditoría de acciones / historial
- Exportar PDF/Excel
- Command Palette y atajos de teclado
- Búsqueda global

## Stack tecnológico (resumen)

| Capa | Tecnología |
|---|---|
| Frontend | Astro, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Formularios/Validación | React Hook Form + Zod |
| Estado | Zustand (estado local/UI), TanStack Query (estado de servidor) |
| Gráficos | Recharts |
| Iconos | Lucide React |
| Backend | Node.js + Express.js |
| Base de datos | Microsoft SQL Server |
| ORM | Prisma ORM |
| Auth | JWT + Refresh Tokens + Bcrypt |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway / Render / VPS |
| Deploy DB | SQL Server administrado o en VPS |

Ver detalle de justificación de cada tecnología en [02-arquitectura.md](./02-arquitectura.md).
