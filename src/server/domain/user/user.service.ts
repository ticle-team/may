import { getLogger } from '@/logger';
import { Service } from 'typedi';
import { UserStore } from '@/server/domain/user/user.store';
import { Context } from '@/server/context';
import { TRPCError } from '@trpc/server';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { User } from '@/models/user';

const logger = getLogger('UserService');

@Service()
export class UserService {
  constructor(
    private readonly userStore: UserStore,
    private readonly stoaCloudService: StoaCloudService,
  ) {}

  async getUser(ctx: Context): Promise<User> {
    const ownerId = ctx.session?.user?.id;
    if (!ownerId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    let user = await this.userStore.getUser(ctx, ownerId);
    if (!user) {
      const { id: shapleUserId } = await this.stoaCloudService.getUser(ctx);
      if (shapleUserId == 0) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user from Shaple Cloud',
        });
      }
      user = await this.userStore.createUser(ctx, {
        ownerId,
        shapleUserId,
      });
    }

    return {
      id: user.id,
      organizations: user.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
      })),
      name: user.shapleUser.name,
      description: user.description,
      ownerId: user.ownerId,
    };
  }
}
