import { Service } from 'typedi';
import { Context } from '@/server/context';
import { Prisma } from '.prisma/client';

@Service()
export class UserStore {
  async getUser({ tx }: Context, ownerId: string) {
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
        shapleUser: true,
      },
    });

    return user;
  }

  createUser({ tx }: Context, data: Prisma.UserUncheckedCreateInput) {
    return tx.user.create({
      data: data,
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
        shapleUser: true,
      },
    });
  }
}
