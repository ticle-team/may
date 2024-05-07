import { router, authedProcedure } from '../trpc';
import { organization } from '@/models/organization';
import { z } from 'zod';

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
});
