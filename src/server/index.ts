import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/routers';

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
