import { authedProcedure, router } from '@/server/trpc';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { Container } from 'typedi';
import { thread } from '@/models/thread';
import { z } from 'zod';
import { getLogger } from '@/logger';
import { chatMessage } from '@/models/ai';
import { AssistantService } from '@/server/domain/assistant/assistant.service';

const logger = getLogger('server.routers.thread');

export default router({
  create: authedProcedure
    .input(z.object({ projectId: z.number() }))
    .output(thread)
    .mutation(({ ctx, input: { projectId } }) =>
      Container.get(ThreadService).create(ctx, projectId),
    ),
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
      .query(async ({ ctx, input: { threadId, cursor, limit } }) => {
        const threadService = Container.get(ThreadService);
        const { messages, after } = await threadService.getTextMessages(
          ctx,
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
      .mutation(async ({ ctx, input: { threadId, message } }) => {
        const threadService = Container.get(ThreadService);

        await threadService.addUserMessage(ctx, threadId, message);
      }),
  }),
  runForStackCreation: authedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .query(async function* ({ ctx, input: { threadId } }) {
      const assistantService = Container.get(AssistantService);

      const generator = assistantService.runForCreationStack(ctx, threadId);
      yield* generator;
    }),
  get: authedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .output(thread)
    .query(async ({ ctx, input: { threadId } }) => {
      const threadService = Container.get(ThreadService);
      return await threadService.get(ctx, threadId);
    }),
  cancel: authedProcedure
    .input(
      z.object({
        threadId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { threadId } }) => {
      const threadService = Container.get(ThreadService);
      await threadService.cancel(ctx, threadId);
    }),
});
