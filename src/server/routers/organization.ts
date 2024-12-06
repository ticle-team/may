import { authedProcedure, baseProcedure, router } from '../trpc';
import { z } from 'zod';
import { getProjectsSchema, organization } from '@/models/organization';
import { project } from '@/models/project';
import Container from 'typedi';
import { OrganizationService } from '@/server/domain/organization/organization.service';

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
    list: authedProcedure
      .input(getProjectsSchema)
      .output(
        z.object({
          projects: z.array(project),
          after: z.number().nullish(),
        }),
      )
      .query(({ ctx, input }) =>
        Container.get(OrganizationService).getProjects(ctx, input),
      ),
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
