import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;
  const pathname = url.pathname;

  // Por ahora la protección inversa de /login y /register se maneja
  // del lado del cliente via <GuestGuard /> que llama a initializeAuth().
  // Si en el futuro queremos hacer la verificación desde el servidor,
  // podemos leer la cookie httpOnly del refresh token y llamar a
  // POST /api/v1/auth/refresh desde acá.
  //
  // Rutas a futuro que requerirían autenticación:
  // if (pathname.startsWith("/app")) {
  //   // verificar sesión, redirigir a /login si no está autenticado
  // }

  return next();
});
