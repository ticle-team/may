import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { TRPCError } from '@trpc/server';
import { Prisma, Thread } from '@prisma/client';

@Service()
export class ThreadStore {
  constructor(private readonly prisma: PrismaService) {}

  async createThread(
    tx: Prisma.TransactionClient,
    authorId: number,
    openaiThreadId: string,
    shapleProjectId: number,
  ) {
    return tx.thread.create({
      data: {
        authorId,
        openaiThreadId,
        shapleProjectId,
      },
    });
  }

  async updateThread(tx: Prisma.TransactionClient, thread: Thread) {
    return tx.thread.update({
      where: {
        id: thread.id,
      },
      data: thread,
    });
  }

  async findThreadById(threadId: number) {
    const thread = await this.prisma.thread.findUnique({
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

  async deleteThreadById(tx: Prisma.TransactionClient, threadId: number) {
    await tx.thread.delete({
      where: {
        id: threadId,
      },
    });
  }

  async findThreadByStackId(stackId: number) {
    return await this.prisma.thread.findFirst({
      where: {
        shapleStackId: stackId,
      },
    });
  }
}
