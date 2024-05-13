'use client';

import { httpLink, splitLink, wsLink } from '@trpc/client';
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
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() => {
    const wsClient = createWSClient({
      url: `${process.env.NEXT_PUBLIC_WS_URL}/api/trpc`,
    });
    return trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: wsLink({
            client: wsClient,
          }),
          false: httpLink({
            url: `/api/trpc`,
          }),
        }),
      ],
      transformer: superjson,
    });
  });
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
