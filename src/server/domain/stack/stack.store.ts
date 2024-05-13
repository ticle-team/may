import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { Prisma } from '@prisma/client';

@Service()
export class StackStore {
  constructor(private readonly prisma: PrismaService) {}

  async createStack(
    tx: Prisma.TransactionClient,
    threadId: number,
    shapleStackId: number,
  ) {
    return tx.stack.create({
      data: {
        threadId,
        stackId: shapleStackId,
      },
    });
  }
}
