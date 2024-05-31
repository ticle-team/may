import 'reflect-metadata';

import { router } from '@/server/trpc';
import conversationRouter from '@/server/routers/conversation';
import threadRouter from '@/server/routers/thread';
import instanceRouter from '@/server/routers/instance';
import stackRouter from '@/server/routers/stack';
import orgRouter from '@/server/routers/organization';
import projectRouter from '@/server/routers/project';
import userRouter from '@/server/routers/user';

export const appRouter = router({
  thread: threadRouter,
  instance: instanceRouter,
  stack: stackRouter,
  project: projectRouter,
  org: orgRouter,
  user: userRouter,
  conversation: conversationRouter,
});
