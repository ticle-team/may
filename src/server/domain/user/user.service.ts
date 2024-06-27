import { getLogger } from '@/logger';
import { Service } from 'typedi';
import { UserStore } from '@/server/domain/user/user.store';
import { Context } from '@/server/context';
import { TRPCError } from '@trpc/server';

const logger = getLogger('UserService');

@Service()
export class UserService {
  constructor(private readonly userStore: UserStore) {}

  async getUser(ctx: Context) {
    const ownerId = ctx.user?.id;
    if (!ownerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }
    return this.userStore.getUser(ctx, ownerId);
  }
}
