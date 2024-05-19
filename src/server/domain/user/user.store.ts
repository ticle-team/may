import { Service } from 'typedi';
import { Prisma } from '@prisma/client';

@Service()
export class UserStore {
  async getUser(tx: Prisma.TransactionClient, ownerId: string) {
    const user = await tx.user.findFirst({
      where: {
        ownerId: ownerId,
      },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (user) {
      return user;
    }

    return tx.user.create({
      data: {
        ownerId: ownerId,
      },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });
  }
}
