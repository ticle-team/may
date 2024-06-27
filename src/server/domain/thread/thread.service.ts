import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { TRPCError } from '@trpc/server';
import { getLogger } from '@/logger';
import { UserStore } from '@/server/domain/user/user.store';
import { Thread } from '@prisma/client';
import { Context } from '@/server/context';

const logger = getLogger('ThreadService');

@Service()
export class ThreadService {
  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
    private readonly userStore: UserStore,
  ) {}

  async create(ctx: Context, projectId: number) {
    const ownerId = ctx.user?.id;
    if (!ownerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }
    const user = await this.userStore.getUser(ctx, ownerId);
    const thread = await this.openaiAssistant.createThread();
    return await this.threadStore.createThread(
      ctx,
      user.id,
      thread.id,
      projectId,
    );
  }

  async cancel(ctx: Context, threadId: number) {
    const thread = await this.threadStore.findThreadById(ctx, threadId);
    await this.openaiAssistant.cancel(thread.openaiThreadId);
  }

  async addUserMessage(ctx: Context, threadId: number, message: string) {
    const { openaiThreadId } = await this.threadStore.findThreadById(
      ctx,
      threadId,
    );
    return this.openaiAssistant.createMessage(openaiThreadId, message);
  }

  async delete(ctx: Context, threadId: number) {
    const { openaiThreadId } = await this.threadStore.findThreadById(
      ctx,
      threadId,
    );
    const { deleted } = await this.openaiAssistant.deleteThread(openaiThreadId);
    if (!deleted) {
      logger.error('failed to delete thread', { threadId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete thread',
      });
    }

    return this.threadStore.deleteThreadById(ctx, threadId);
  }

  async getTextMessages(
    ctx: Context,
    threadId: number,
    options?: {
      before?: string;
      limit?: number;
    },
  ) {
    const { openaiThreadId } = await this.threadStore.findThreadById(
      ctx,
      threadId,
    );
    const { messages, after } = await this.openaiAssistant.getTextMessages(
      openaiThreadId,
      options,
    );

    return {
      messages,
      after,
    };
  }

  async get(ctx: Context, threadId: number) {
    return this.threadStore.findThreadById(ctx, threadId);
  }

  async save(ctx: Context, thread: Thread) {
    return this.threadStore.updateThread(ctx, thread.id, thread);
  }
}
