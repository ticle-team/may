import { Service } from 'typedi';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { Context } from '@/server/context';

@Service()
export class ThreadStore {
  constructor() {}

  async createThread(
    { tx }: Context,
    authorId: number,
    openaiThreadId: string,
    shapleProjectId: number,
    state: string,
  ) {
    return await tx.thread.create({
      data: {
        authorId,
        openaiThreadId,
        shapleProjectId,
        state,
      },
    });
  }

  updateThread(
    { tx }: Context,
    threadId: number,
    thread: Prisma.ThreadUpdateInput | Prisma.ThreadUncheckedUpdateInput,
  ) {
    return tx.thread.update({
      where: {
        id: threadId,
      },
      data: thread,
    });
  }

  async findThreadById({ tx }: Context, threadId: number) {
    const thread = await tx.thread.findUnique({
      where: {
        id: threadId,
      },
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Thread not found',
      });
    }

    return thread;
  }

  async deleteThreadById({ tx }: Context, threadId: number) {
    await tx.thread.delete({
      where: {
        id: threadId,
      },
    });
  }

  async findThreadByStackId({ tx }: Context, stackId: number) {
    return await tx.thread.findFirst({
      where: {
        shapleStackId: stackId,
      },
    });
  }
}
