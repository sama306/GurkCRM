import { type ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

/*
 * NOTA: AppProvider NO envuelve QueryClientProvider a propósito.
 *
 * Cada isla client:load de Astro es un root React independiente.
 * El QueryClientProvider estaría aislado en este árbol y no llegaría
 * al contenido del <slot />. Además, al usarse como <AppProvider client:load />
 * (self-closing), nunca tiene children — el provider sería dead code.
 *
 * Cada página isla que necesite TanStack Query debe usar su propio
 * QueryProvider como raíz (ver src/components/providers/QueryProvider.tsx).
 */

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
