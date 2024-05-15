import {
  FetchCreateContextFnOptions,
  fetchRequestHandler,
} from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';
import { cookies } from 'next/headers';
import { createNextContext } from '@/server/context';

const handler = async (req: Request) => {
  const cookieStore = cookies();
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (opts: FetchCreateContextFnOptions) =>
      await createNextContext(cookieStore, opts),
    onError: (opts: any) => {
      if (opts.error.code === 'INTERNAL_SERVER_ERROR') {
        console.log(`unexpected error occurred on RPC [${opts.path}]`, {
          cause: opts.error.cause?.message,
        });
      } else {
        console.log(`exception caught on RPC [${opts.path}]`, {
          code: opts.error.code,
        });
      }
    },
  });
};

export { handler as GET, handler as POST };
