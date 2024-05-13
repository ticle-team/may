import { authedProcedure, router } from '@/server/trpc';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { Container } from 'typedi';
import { message, thread } from '@/models/thread';
import { z } from 'zod';
import {
  MessageContent,
  TextContentBlock,
} from 'openai/resources/beta/threads';
import { TRPCError } from '@trpc/server';
import { ShapleClient } from '@shaple/shaple';
import { observable } from '@trpc/server/observable';

export default router({
  create: authedProcedure
    .output(thread)
    .mutation(async ({ ctx: { session, shaple, threadService } }) => {
      const thread = await threadService.create(session.user.id);

      return {
        id: thread.id,
      };
    }),
  messages: router({
    list: authedProcedure
      .input(
        z.object({
          threadId: z.number(),
        }),
      )
      .output(
        z.object({
          messages: z.array(message),
          after: z.string().nullish(),
        }),
      )
      .query(async ({ ctx: { threadService }, input: { threadId } }) => {
        const { messages, after } = await threadService.getMessages(threadId);

        const contents = messages.map(({ role, content }) => {
          const text = content
            .filter(({ type }) => type === 'text')
            .map((t) => (t as TextContentBlock).text)
            .join('');
          return { text, role };
        });

        return {
          messages: contents,
          after,
        };
      }),
    create: authedProcedure
      .input(
        z.object({
          threadId: z.number(),
          message: z.string(),
        }),
      )
      .subscription(
        async ({
          ctx: { threadService, assistantService },
          input: { threadId, message },
        }) => {
          await threadService.addUserMessage(threadId, message);
          const stream = await assistantService.createStack(threadId);

          return observable((emit) => {
            const onText = (text: string) => {
              emit.next({ type: 'text', text });
            };
            const onDone = () => {
              emit.next({ type: 'done' });
              emit.complete();
            };

            stream.on('text', onText);
            stream.on('done', onDone);

            return () => {
              stream.off('text', onText);
              stream.off('done', onDone);
              stream.close();
            };
          });
        },
      ),
  }),
});
