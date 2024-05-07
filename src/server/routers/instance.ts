import { router, authedProcedure } from '../trpc';
import { z } from 'zod';
import { instance } from '@/models/stack';

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
  get: authedProcedure
    .input(
      z.object({
        instanceId: z.number(),
      }),
    )
    .output(instance)
    .query(async () => {
      return {
        id: 0,
        stackId: 0,
        state: 'pending',
        zone: '',
      };
    }),
});
