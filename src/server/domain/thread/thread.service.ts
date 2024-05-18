import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { TRPCError } from '@trpc/server';
import { getLogger } from '@/logger';
import { UserStore } from '@/server/domain/user/user.store';
import { PrismaService } from '@/server/common/prisma.service';

const logger = getLogger('ThreadService');

@Service()
export class ThreadService {
  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly prisma: PrismaService,
    private readonly threadStore: ThreadStore,
    private readonly userStore: UserStore,
  ) {}

  async create(
    ownerId: string, // this is a string, gotrue user id
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.userStore.getUser(tx, ownerId);
      const thread = await this.openaiAssistant.createThread();
      return await this.threadStore.createThread(tx, user.id, thread.id);
    });
  }

  async addUserMessage(threadId: number, message: string) {
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);
    return this.openaiAssistant.createMessage(openaiThreadId, message);
  }

  async delete(threadId: number) {
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);
    const { deleted } = await this.openaiAssistant.deleteThread(openaiThreadId);
    if (!deleted) {
      logger.error('failed to delete thread', { threadId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete thread',
      });
    }
    return this.prisma.$transaction(async (tx) => {
      return this.threadStore.deleteThreadById(tx, threadId);
    });
  }

  async getTextMessages(
    threadId: number,
    options?: {
      before?: string;
      limit?: number;
    },
  ) {
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);
    const { messages, after } = await this.openaiAssistant.getTextMessages(
      openaiThreadId,
      options,
    );

    return {
      messages,
      after,
    };
  }
}
