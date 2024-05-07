import { authedProcedure, baseProcedure, router } from '../trpc';
import { z } from 'zod';
import { project } from '@/models/project';
import { stack } from '@/models/stack';

export default router({
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        orgId: z.number(),
      }),
    )
    .output(project)
    .mutation(async () => {
      return {
        id: 0,
        name: '',
        description: '',
      };
    }),
  delete: authedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  get: baseProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .output(project)
    .query(async () => {
      return {
        id: 0,
        name: '',
        description: '',
      };
    }),
  stacks: router({
    list: baseProcedure
      .input(
        z.object({
          projectId: z.number(),
        }),
      )
      .output(
        z.object({
          stacks: z.array(stack),
          after: z.number().nullish(),
        }),
      )
      .query(async () => {
        return {
          stacks: [],
          after: 0,
        };
      }),
  }),
});
