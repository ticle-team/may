import { authedProcedure, router } from '@/server/trpc';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { Container } from 'typedi';
import { thread } from '@/models/thread';
import { z } from 'zod';
import { AssistantService } from '@/server/domain/assistant/assistant.service';
import { getLogger } from '@/logger';
import { chatMessage } from '@/models/ai';

const logger = getLogger('server.routers.thread');

export default router({
  create: authedProcedure
    .input(z.object({ projectId: z.bigint() }))
    .output(thread)
    .mutation(async ({ ctx: { user }, input: { projectId } }) => {
      const threadService = Container.get(ThreadService);
      return threadService.create(user.id, projectId);
    }),
  messages: router({
    list: authedProcedure
      .input(
        z.object({
          threadId: z.number(),
          limit: z.number().min(1).max(100).default(10),
          cursor: z.string().nullish(),
        }),
      )
      .output(
        z.object({
          messages: z.array(chatMessage),
          nextCursor: z.string().nullish(),
        }),
      )
      .query(async ({ input: { threadId, cursor, limit } }) => {
        const threadService = Container.get(ThreadService);
        const { messages, after } = await threadService.getTextMessages(
          threadId,
          { before: cursor ?? undefined, limit },
        );

        return {
          messages,
          nextCursor: after,
        };
      }),
    add: authedProcedure
      .input(
        z.object({
          threadId: z.number(),
          message: z.string(),
        }),
      )
      .output(z.void())
      .mutation(async ({ input: { threadId, message } }) => {
        const threadService = Container.get(ThreadService);

        await threadService.addUserMessage(threadId, message);
      }),
  }),
  runForStackCreation: authedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .query(async function* ({ input: { threadId } }) {
      const assistantService = Container.get(AssistantService);

      yield* assistantService.runForCreationStack(threadId);
    }),
  get: authedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .output(thread)
    .query(async ({ input: { threadId } }) => {
      const threadService = Container.get(ThreadService);
      const thread = await threadService.get(threadId);
      return {
        id: thread.id,
        shapleProjectId: thread.shapleProjectId,
      };
    }),
  cancel: authedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .mutation(async ({ input: { threadId } }) => {
      const threadService = Container.get(ThreadService);
      await threadService.cancel(threadId);
    }),
});
