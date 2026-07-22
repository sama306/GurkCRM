# GurkCRM

CRM SaaS moderno para la gestión de clientes, oportunidades comerciales, tareas y equipos — pensado para agencias digitales, estudios jurídicos, consultoras y equipos comerciales que necesitan centralizar todo su proceso de ventas en un solo lugar.

Proyecto full stack de portfolio, construido de cero para demostrar arquitectura de software, diseño de bases de datos relacionales, autenticación segura, y buenas prácticas de desarrollo moderno.

**🔗 Demo en vivo:** [gurk-crm.vercel.app](https://gurk-crm.vercel.app)

> El backend corre en un plan gratuito que se "duerme" tras inactividad — la primera request puede tardar hasta 1 minuto en responder.

## Usuarios de demo

| Rol | Email | Contraseña |
|---|---|---|
| Owner | owner@gurkcrm.demo | Demo1234 |
| Admin | admin@gurkcrm.demo | Demo1234 |
| Sales | sales@gurkcrm.demo | Demo1234 |
| Viewer | viewer@gurkcrm.demo | Demo1234 |

Cada rol tiene permisos distintos — probá loguearte con más de uno para ver las diferencias (por ejemplo, Viewer no puede crear ni editar nada; Sales no puede eliminar Companies/Customers/Deals).

## Funcionalidades

- **Autenticación completa**: registro, login, recuperación de contraseña, JWT con refresh tokens rotativos y revocación segura.
- **Multi-tenancy real**: cada organización es un tenant completamente aislado — probado exhaustivamente contra fugas de datos entre organizaciones.
- **Roles y permisos granulares**: Owner, Admin, Sales, Viewer, con jerarquía (por ejemplo, un Admin no puede modificar a otro Admin ni a un Owner) y permisos a nivel de dato (Sales solo edita sus propias tareas).
- **Gestión comercial completa**: Empresas, Contactos, Clientes, Oportunidades y Tareas, cada uno con búsqueda, filtros y paginación.
- **Pipeline visual (Kanban)**: drag & drop de oportunidades entre etapas, con actualización optimista y reordenamiento verificado bajo concurrencia real.
- **Dashboard con métricas en vivo**: resumen de clientes activos, oportunidades abiertas, ventas del mes y actividad reciente.
- **Exportación a CSV** de clientes con los filtros aplicados.
- **Invitación de usuarios por email**: un Admin/Owner invita a alguien con un rol asignado; la persona invitada acepta y queda logueada dentro de la misma organización, sin crear un tenant nuevo.
- **Diseño responsive**, con sidebar colapsable y sistema de diseño propio.

> **Nota sobre envío de emails:** los flujos de recuperación de contraseña e invitación de usuarios generan el link correspondiente pero no lo envían por email real — el link se loguea en la consola del servidor (`EMAIL_PROVIDER=console`). Es una decisión deliberada para este proyecto de portfolio, que evita depender de un proveedor externo de email y de verificar un dominio propio. La arquitectura del backend ya está preparada para conectar un proveedor real (Resend, SendGrid, etc.) el día que se necesite, sin cambios estructurales.

## Stack tecnológico

**Frontend:** Astro · React · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · Zustand · React Hook Form · Zod · Framer Motion · dnd-kit

**Backend:** Node.js · Express · TypeScript · Prisma ORM · Microsoft SQL Server · JWT · Bcrypt

**Infraestructura:** Vercel (frontend) · Render (backend) · Azure SQL Database

## Arquitectura

- Backend organizado en capas (routes → controller → service → repository → Prisma), siguiendo Clean Architecture y Repository Pattern.
- Frontend por features, con separación estricta entre estado de servidor (TanStack Query) y estado de cliente (Zustand).
- Validación compartida con Zod entre frontend y backend.
- Documentación técnica completa en [`/docs`](./docs), incluyendo modelo de datos, especificación de API, y decisiones de arquitectura.

## Correr el proyecto localmente

### Backend
```bash
cd backend
npm install
# Configurar backend/.env según docs/08-variables-entorno.md
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Configurar frontend/.env según docs/08-variables-entorno.md
npm run dev
```

Documentación técnica extendida disponible en [`/docs`](./docs), incluyendo modelo de datos completo, especificación de la API, flujo de autenticación, y roadmap del proyecto.
