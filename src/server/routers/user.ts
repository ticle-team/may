import { router, authedProcedure } from '../trpc';
import { organization } from '@/models/organization';
import { z } from 'zod';
import { user as MayUser } from '@/models/user';
import { Container } from 'typedi';
import { UserService } from '@/server/domain/user/user.service';

export default router({
  orgs: router({
    list: authedProcedure
      .input(
        z.object({
          limit: z.number(),
        }),
      )
      .output(
        z.object({
          orgs: z.array(organization),
          after: z.number(),
        }),
      )
      .query(async () => {
        return {
          orgs: [],
          after: 0,
        };
      }),
  }),
  me: authedProcedure.output(MayUser).query(async ({ ctx: { user } }) => {
    const mayUser = await Container.get(UserService).getUser(user.id);
    return {
      id: mayUser.id,
      organizations: mayUser.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
      })),
      nickname: mayUser.nickname,
      description: mayUser.description,
    };
  }),
});
