import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from '@/server/context';
import { ShapleClient } from '@shaple/shaple';

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
export const router = t.router;
export const baseProcedure = t.procedure;
export const authedProcedure = t.procedure.use(
  async ({ ctx: { shaple }, next }) => {
    const {
      data: { session },
      error,
    } = await shaple.auth.getSession();
    if (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error!.message,
      });
    } else if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }

    return next({
      ctx: {
        session,
      },
    });
  },
);
