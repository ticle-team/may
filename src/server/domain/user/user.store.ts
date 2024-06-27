import { Service } from 'typedi';
import { Context } from '@/server/context';

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
