import { authedProcedure, router } from '../trpc';
import { z } from 'zod';
import { instance } from '@/models/stack';
import { InstanceService } from '@/server/domain/instance/instance.service';
import { Container } from 'typedi';

export default router({
  launch: authedProcedure
    .input(
      z.object({
        instanceId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  pause: authedProcedure
    .input(
      z.object({
        instanceId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  delete: authedProcedure
    .input(
      z.object({
        instanceId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  create: authedProcedure
    .input(
      z.object({
        stackId: z.number(),
        zone: z.string().nullish(),
        name: z.string().nullish(),
      }),
    )
    .output(instance)
    .mutation(({ input: { stackId, zone, name } }) =>
      Container.get(InstanceService).createInstance(
        stackId,
        zone ?? null,
        name ?? null,
      ),
    ),
  deployStack: authedProcedure
    .input(
      z.object({
        instanceId: z.number(),
      }),
    )
    .mutation(({ input: { instanceId } }) =>
      Container.get(InstanceService).deployStack(instanceId),
    ),
});
