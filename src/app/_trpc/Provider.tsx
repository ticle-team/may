'use client';

import {
  httpLink,
  splitLink,
  unstable_httpBatchStreamLink,
  wsLink,
} from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

import { trpc } from './client';
import superjson from 'superjson';
import { createWSClient } from '@trpc/react-query';

export default function TRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    return trpc.createClient({
      links: [
        unstable_httpBatchStreamLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    });
  });
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
