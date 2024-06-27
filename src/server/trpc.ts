import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from '@/server/context';
import { ZodError } from 'zod';
import { getLogger } from '@/logger';

const logger = getLogger('server.trpc');

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Awaited<Context>>().create({
  transformer: superjson,
  experimental: {
    iterablesAndDeferreds: true,
  },
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const { createCallerFactory, router } = t;
export const baseProcedure = t.procedure.use(
  ({ ctx: { tx: prisma }, next }) => {
    return prisma.$transaction(async (_) => {
      return await next({
        ctx: {
          tx: prisma,
        },
      });
    });
  },
);

export const authedProcedure = baseProcedure.use(
  async ({ ctx: { user }, next }) => {
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Requires authentication',
      });
    }

    return await next({
      ctx: { user: user! },
    });
  },
);
