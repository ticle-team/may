import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';

@Service()
export class UserStore {
  async getUser(tx: Prisma.TransactionClient, ownerId: string) {
    const user = await tx.user.findFirst({
      where: {
        ownerId: ownerId,
      },
    });

    if (user) {
      return user;
    }

    return tx.user.create({
      data: {
        ownerId: ownerId,
      },
    });
  }
}
