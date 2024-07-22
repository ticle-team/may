import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from '@/server/context';
import { ZodError } from 'zod';
import { getLogger } from '@/logger';
import { Prisma } from '@prisma/client';

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
  async ({ type, ctx: { tx: prisma }, next }) => {
    if ('$transaction' in prisma && type === 'mutation') {
      return await prisma.$transaction(
        async (tx) => {
          return await next({
            ctx: {
              tx,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 15 * 60 * 1000,
          timeout: 15 * 60 * 1000,
        },
      );
    } else {
      return await next({
        ctx: {
          tx: prisma,
        },
      });
    }
  },
);

export const authedProcedure = baseProcedure.use(
  async ({ ctx: { session }, next }) => {
    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Requires authentication',
      });
    }

    return await next({
      ctx: { session: session! },
    });
  },
);
