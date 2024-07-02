import 'reflect-metadata';

import { router } from '@/server/trpc';
import threadRouter from '@/server/routers/thread';
import instanceRouter from '@/server/routers/instance';
import stackRouter from '@/server/routers/stack';
import orgRouter from '@/server/routers/organization';
import projectRouter from '@/server/routers/project';
import userRouter from '@/server/routers/user';
import vapiRouter from '@/server/routers/vapi';

export const appRouter = router({
  thread: threadRouter,
  instance: instanceRouter,
  stack: stackRouter,
  project: projectRouter,
  org: orgRouter,
  user: userRouter,
  vapi: vapiRouter,
});
