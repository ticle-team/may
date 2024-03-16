import { router } from '@/server/trpc';
import { appRouter } from '@/server/routers';

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
