import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

@Service()
export class ThreadStore {
  constructor(private readonly prisma: PrismaService) {}

  async createThread(
    tx: Prisma.TransactionClient,
    authorId: number,
    openaiThreadId: string,
    shapleProjectId: bigint,
  ) {
    return tx.thread.create({
      data: {
        authorId,
        openaiThreadId,
        shapleProjectId,
      },
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
}
