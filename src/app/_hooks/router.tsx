'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import PageLoading from '../_components/PageLoading';

export type RouterContextValue = {
  push: (href: string, options?: any) => void;
  replace: (href: string, options?: any) => void;
  prefetch: (href: string, options?: any) => void;
};
export const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: PropsWithChildren<{}>) {
  const router = useNextRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <RouterContext.Provider
      value={{
        push(href: string, options?: any) {
          window.location.href = href;
          setIsNavigating(true);
        },
        replace: router.replace,
        prefetch: router.prefetch,
      }}
    >
      {isNavigating ? <PageLoading /> : children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error('useRouter must be used within a RouterProvider');
  }

  return router;
}
