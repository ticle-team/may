import { router, authedProcedure, baseProcedure } from '../trpc';
import { z } from 'zod';
import { organization } from '@/models/organization';
import { project } from '@/models/project';

export default router({
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    )
    .output(organization)
    .mutation(async () => {
      return {
        id: 0,
        name: '',
        description: '',
      };
    }),
  projects: router({
    list: baseProcedure
      .input(
        z.object({
          orgId: z.number(),
          limit: z.number(),
        }),
      )
      .output(
        z.object({
          projects: z.array(project),
          after: z.number().nullish(),
        }),
      )
      .query(async () => {
        return {
          projects: [],
          after: null,
        };
      }),
  }),
  delete: authedProcedure
    .input(
      z.object({
        orgId: z.number(),
      }),
    )
    .mutation(async () => {
      return;
    }),
  get: baseProcedure
    .input(
      z.object({
        orgId: z.number(),
      }),
    )
    .output(organization)
    .query(async () => {
      return {
        id: 0,
        name: '',
        description: '',
      };
    }),
});
