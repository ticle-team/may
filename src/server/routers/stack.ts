import { authedProcedure, router } from '../trpc';
import { z } from 'zod';
import { instance, stack } from '@/models/stack';
import { vapiRelease } from '@/models/vapi';
import Container from 'typedi';
import { StackService } from '@/server/domain/stack/stack.service';

export default router({
  delete: authedProcedure
    .input(
      z.object({
        stackId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  get: authedProcedure
    .input(
      z.object({
        stackId: z.number(),
      }),
    )
    .output(stack)
    .query(({ ctx, input }) =>
      Container.get(StackService).getStack(ctx, input.stackId),
    ),
  instances: router({
    list: authedProcedure
      .input(
        z.object({
          stackId: z.number(),
        }),
      )
      .output(
        z.object({
          instances: z.array(instance),
          after: z.number().nullish(),
        }),
      )
      .query(({ input: { stackId } }) =>
        Container.get(StackService).getInstancesInStack(stackId),
      ),
  }),
  vapis: router({
    list: authedProcedure
      .input(
        z.object({
          stackId: z.number(),
        }),
      )
      .output(
        z.object({
          vapis: z.array(vapiRelease),
          after: z.number().nullish(),
        }),
      )
      .query(async () => {
        return {
          vapis: [],
          after: 0,
        };
      }),
    install: authedProcedure
      .input(
        z.object({
          stackId: z.number(),
          vapiReleaseId: z.number(),
        }),
      )
      .mutation(async () => {
        return;
      }),
  }),
});
