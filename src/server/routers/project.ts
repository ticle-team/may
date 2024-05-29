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

const projectService = Container.get(ProjectService);
export default router({
  create: authedProcedure
    .input(createProjectSchema)
    .output(project)
    .mutation(({ input }) => projectService.createProject(input)),
  delete: authedProcedure
    .input(deleteProjectSchema)
    .mutation(({ input }) => projectService.deleteProject(input.projectId)),
  get: baseProcedure
    .input(getProjectSchema)
    .output(project)
    .query(({ input }) => projectService.getProject(input.projectId)),
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
