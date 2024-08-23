import { authedProcedure, baseProcedure, router } from '../trpc';
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
  me: baseProcedure.output(MayUser.nullish()).query(async ({ ctx }) => {
    if (!ctx.session) {
      return null;
    }
    return await Container.get(UserService).getUser(ctx);
  }),
});
