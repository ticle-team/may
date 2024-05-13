import { Service } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { undefined } from 'zod';

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
