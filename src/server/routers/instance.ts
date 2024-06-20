import { authedProcedure, router } from '../trpc';
import { z } from 'zod';
import { instance } from '@/models/stack';
import { InstanceService } from '@/server/domain/instance/instance.service';
import { Container } from 'typedi';

const instanceService = Container.get(InstanceService);
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
      instanceService.createInstance(stackId, zone ?? null, name ?? null),
    ),
  deployStack: authedProcedure
    .input(
      z.object({
        instanceId: z.number(),
      }),
    )
    .mutation(async ({ input: { instanceId } }) => {
      await instanceService.deployStack(instanceId);
    }),
});
