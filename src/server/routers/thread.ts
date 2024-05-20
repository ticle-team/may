import { authedProcedure, router } from '@/server/trpc';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { Container } from 'typedi';
import { message, thread } from '@/models/thread';
import { z } from 'zod';
import { AssistantService } from '@/server/domain/assistant/assistant.service';
import { createObservableFromAsyncGenerator } from '@/util/sse';

export default router({
  create: authedProcedure.output(thread).mutation(async ({ ctx: { user } }) => {
    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(user.id);

    return {
      id: thread.id,
    };
  }),
  messages: router({
    list: authedProcedure
      .input(
        z.object({
          threadId: z.number(),
          before: z.string().optional(),
        }),
      )
      .output(
        z.object({
          messages: z.array(message),
          after: z.string().optional(),
        }),
      )
      .query(async ({ input: { threadId, before } }) => {
        const threadService = Container.get(ThreadService);
        const { messages, after } = await threadService.getTextMessages(
          threadId,
          { before },
        );

        return {
          messages,
          after,
        };
      }),
    addForStackCreation: authedProcedure
      .input(
        z.object({
          projectId: z.number(),
          threadId: z.number(),
          message: z.string(),
        }),
      )
      .subscription(async ({ input: { projectId, threadId, message } }) => {
        const threadService = Container.get(ThreadService);
        const assistantService = Container.get(AssistantService);

        await threadService.addUserMessage(threadId, message);
        const source = assistantService.runForCreationStack(
          threadId,
          projectId,
        );

        return createObservableFromAsyncGenerator(source);
      }),
  }),
});
