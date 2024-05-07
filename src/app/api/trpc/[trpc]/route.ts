import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';

const handler = async (req: Request) => {
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
    onError({ error, type, path, input, ctx, req }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.log(`unexpected error occurred on RPC [${path}]`, {
          cause: error.cause?.message,
        });
      } else {
        console.log(`exception caught on RPC [${path}]`, { code: error.code });
      }
    },
  });
};

export { handler as GET, handler as POST };
