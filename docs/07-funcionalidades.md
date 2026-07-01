# 07. Funcionalidades por Módulo

> Marcado `[MVP]` o `[Fase 2]` según la clasificación sugerida en [01-overview.md](./01-overview.md).

## Landing Page `[MVP]`

- **Hero**: propuesta de valor, CTA a registro.
- **Features**: grid de funcionalidades destacadas del CRM.
- **Pricing**: planes (puede ser estático/ficticio, sin cobro real real).
- **FAQ**: acordeón de preguntas frecuentes.
- **Contacto**: formulario simple (puede enviar a un webhook o solo loguear, sin backend de email real en el MVP).

## Autenticación `[MVP]`

- Registro (crea Organization + User Owner).
- Login.
- Recuperar contraseña.
- "Recordarme" (extiende la duración del refresh token).
- JWT + Refresh Token (ver [05-autenticacion-roles.md](./05-autenticacion-roles.md)).

## Dashboard `[MVP básico / Fase 2 avanzado]`

- Resumen general: clientes activos, oportunidades abiertas, ventas del mes `[MVP]`.
- Actividad reciente `[MVP]`.
- Tareas pendientes (widget) `[MVP]`.
- Próximas reuniones (requiere Calendario) `[Fase 2]`.
- Gráficos de ventas/conversión con Recharts `[Fase 2]`.
- Dashboard en tiempo real (WebSockets/polling) `[Fase 2]`.

## Clientes (Customers) `[MVP]`

- Crear / Editar / Eliminar (soft delete).
- Buscar y filtrar (por estado, responsable).
- Exportar (CSV en MVP; PDF/Excel en Fase 2).
- Campos: nombre, empresa (relación opcional), email, teléfono, dirección, estado, notas.

## Empresas (Companies) `[MVP]`

- CRUD completo.
- Un `Customer` puede pertenecer a una `Company`.
- Campos: nombre, industria, sitio web, dirección, tamaño, estado.

## Contactos (Contacts) `[MVP]`

- Una `Company` puede tener múltiples `Contacts`.
- CRUD anidado bajo la empresa.
- Campos: nombre, cargo, email, teléfono, redes sociales.

## Oportunidades (Deals) `[MVP]`

- Pipeline comercial con estados: Nuevo, Contactado, Reunión, Propuesta, Negociación, Ganado, Perdido.
- Campos: valor estimado, fecha, responsable, cliente, empresa, comentarios.
- **Kanban** con drag & drop para mover entre columnas `[MVP]` — actualiza `stage` y `position`.
- Motivo de pérdida (`lostReason`) cuando pasa a "Perdido" `[Fase 2, opcional en MVP]`.

## Tareas `[MVP]`

- Cada usuario puede crear tareas.
- Campos: título, descripción, prioridad, fecha límite, estado, responsable.
- Vinculación opcional a un Customer o Deal.

## Calendario `[Fase 2]`

- Visualización de reuniones, llamadas, tareas y eventos en formato calendario (mes/semana).
- Puede alimentarse inicialmente de las `Tasks` con `dueDate` antes de tener un modelo de eventos propio.

## Comentarios `[Fase 2]`

- Cada `Customer` y `Deal` puede tener comentarios.
- Se almacena usuario, fecha y comentario (ver entidad `Comment` polimórfica).

## Archivos `[Fase 2]`

- Adjuntar PDFs, imágenes, documentos, contratos a `Customer` o `Deal`.
- Requiere definir proveedor de storage (ver nota abajo).

## Notificaciones `[Fase 2]`

- Nuevos clientes, tareas asignadas, comentarios, recordatorios.
- MVP puede limitarse a notificaciones in-app (polling); push/email real quedan para después.

## Dashboard Analytics `[Fase 2]`

- Gráficos de ventas, clientes, conversión, oportunidades, actividad mensual — con Recharts.

## Configuración `[MVP básico]`

- Empresa: logo, nombre, colores, zona horaria `[MVP básico: nombre/zona horaria; branding completo Fase 2]`.
- Cuenta: perfil, seguridad (cambio de contraseña) `[MVP]`.
- Roles: gestión de usuarios y sus roles `[MVP]`.

## Roles `[MVP]`

Ver matriz completa en [05-autenticacion-roles.md](./05-autenticacion-roles.md): Owner, Admin, Sales, Viewer.

## Sistema de búsqueda `[Fase 2]`

- Búsqueda global por Cliente, Empresa, Contacto, Oportunidad, Usuario.
- MVP puede tener búsqueda simple por módulo (ya cubierta en cada listado); la búsqueda global unificada queda para Fase 2.

## Tema `[MVP]`

- Light mode / Dark mode.

## Responsive `[MVP]`

- Compatible con Desktop, Tablet y Mobile.

## Funcionalidades avanzadas `[Fase 2]`

- Exportar PDF / Exportar Excel.
- Filtros avanzados, ordenamiento, paginación (paginación y filtros básicos sí van en MVP; "avanzados" refiere a combinaciones complejas).
- Auditoría de acciones / historial de actividad (entidad `Activity`).
- Atajos de teclado.
- Command Palette (tipo `Cmd+K`).
- Animaciones suaves (Framer Motion ya se usa desde el MVP en transiciones básicas; refinamiento en Fase 2).

## Nota sobre almacenamiento de archivos

Para la funcionalidad de **Archivos** vas a necesitar un proveedor de storage externo, ya que SQL Server no es ideal para guardar binarios grandes. Opciones a evaluar más adelante: **Cloudinary** (fácil, gratis en tier bajo, bueno para imágenes/PDFs) o **AWS S3 / Supabase Storage**. Esto se define cuando llegues a esa etapa, no es necesario resolverlo ahora.
