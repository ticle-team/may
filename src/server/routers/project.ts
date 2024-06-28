import { authedProcedure, baseProcedure, router } from '../trpc';
import { z } from 'zod';
import {
  createProjectSchema,
  deleteProjectSchema,
  getProjectSchema,
  project,
} from '@/models/project';
import { stack } from '@/models/stack';
import Container from 'typedi';
import { ProjectService } from '@/server/domain/project/project.service';

export default router({
  create: authedProcedure
    .input(createProjectSchema)
    .output(project)
    .mutation(({ input }) =>
      Container.get(ProjectService).createProject(input),
    ),
  delete: authedProcedure
    .input(deleteProjectSchema)
    .mutation(({ input }) =>
      Container.get(ProjectService).deleteProject(input.projectId),
    ),
  get: baseProcedure
    .input(getProjectSchema)
    .output(project)
    .query(({ input }) =>
      Container.get(ProjectService).getProject(input.projectId),
    ),
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
