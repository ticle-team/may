import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from '@/server/context';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const { createCallerFactory, router, procedure: baseProcedure } = t;
export const authedProcedure = baseProcedure.use(({ ctx: { user }, next }) => {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Requires authentication',
    });
  }

  return next({
    ctx: { user: user! },
  });
});
