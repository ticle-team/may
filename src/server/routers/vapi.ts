import { authedProcedure, baseProcedure, router } from '@/server/trpc';
import { vapiRelease } from '@/models/vapi';
import { z } from 'zod';
import { Container } from 'typedi';
import { VapiService } from '../domain/vapi/vapi.service';

const vapiRouter = router({
  getLatestReleasesByNames: baseProcedure
    .input(
      z.object({
        names: z.array(z.string()),
      }),
    )
    .output(z.array(vapiRelease))
    .query(({ input }) =>
      Container.get(VapiService).getLatestReleasesByNames(input.names),
    ),
  getVapiDocsUrl: authedProcedure
    .input(
      z.object({
        vapiReleaseId: z.number(),
      }),
    )
    .output(z.string().nullable())
    .query(({ ctx, input }) =>
      Container.get(VapiService).getVapiDocsUrl(ctx, input.vapiReleaseId),
    ),
});

export default vapiRouter;
