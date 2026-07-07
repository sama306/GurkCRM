import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

/*
 * Astro crea un root de React INDEPENDIENTE por cada isla con client:load.
 * Esto significa que el QueryClientProvider dentro de AppProvider (en el layout)
 * NO envuelve el contenido de las páginas — cada isla es un árbol separado.
 *
 * Por eso, toda isla de página que use TanStack Query (useQuery, useMutation)
 * debe incluir su propio QueryProvider como raíz.
 *
 * ⚠️ Si en el futuro una página necesita múltiples islas que compartan cache
 *    de TanStack Query, deben ir dentro de UNA sola isla padre (un solo
 *    client:load que las contenga a todas), en vez de declarar varias
 *    islas sueltas como hijos del slot de Astro.
 */

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
