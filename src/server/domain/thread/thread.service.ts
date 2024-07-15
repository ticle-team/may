import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { TRPCError } from '@trpc/server';
import { getLogger } from '@/logger';
import { UserStore } from '@/server/domain/user/user.store';
import { Context } from '@/server/context';
import { Thread, threadStateInfo, threadStates } from '@/models/thread';

const logger = getLogger('ThreadService');

@Service()
export class ThreadService {
  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
    private readonly userStore: UserStore,
  ) {}

  async create(ctx: Context, projectId: number): Promise<Thread> {
    const ownerId = ctx.session?.user?.id;
    if (!ownerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }
    const user = await this.userStore.getUser(ctx, ownerId);
    const openaiThread = await this.openaiAssistant.createThread();
    const thread = await this.threadStore.createThread(
      ctx,
      user.id,
      openaiThread.id,
      projectId,
      threadStates.stackCreating,
    );

    const stateInfo = threadStateInfo.parse(thread.stateInfo);

    return {
      ...thread,
      stateInfo,
    };
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

  async get(ctx: Context, threadId: number): Promise<Thread> {
    const thread = await this.threadStore.findThreadById(ctx, threadId);
    const stateInfo = threadStateInfo.parse(thread.stateInfo);

    return {
      id: thread.id,
      shapleProjectId: thread.shapleProjectId,
      shapleStackId: thread.shapleStackId,
      state: thread.state,
      stateInfo,
    };
  }
}
