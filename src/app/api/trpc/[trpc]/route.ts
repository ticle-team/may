import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';
import { cookies } from 'next/headers';
import { createNextContext } from '@/server/context';
import { getLogger } from '@/logger';

const logger = getLogger('app.api.trpc.route');

const handler = async (req: Request) => {
  const cookieStore = cookies();
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (opts) => await createNextContext(cookieStore, opts),
    onError: ({ error, path }) => {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        logger.error(`unexpected error occurred on RPC [${path}]`, {
          error,
        });
      } else {
        logger.error(`exception caught on RPC [${path}]`, {
          error,
        });
      }
    },
  });
};

export { handler as GET, handler as POST };
