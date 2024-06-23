import { z } from 'zod';
import { parseShapleStackFromProto, shapleStack } from '@/models/stack';
import { stoacloud } from '@/protos/stoacloud';

export const project = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  stacks: z.array(shapleStack).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof project>;

export const createProjectSchema = z.object({
  orgId: z.number(),
  name: z.string(),
  description: z.string(),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export const deleteProjectSchema = z.object({
  projectId: z.number(),
});

export type DeleteProjectRequest = z.infer<typeof deleteProjectSchema>;

export const getProjectSchema = z.object({
  projectId: z.number(),
});

export type GetProjectRequest = z.infer<typeof getProjectSchema>;

export function parseShapleProjectFromProto(
  project: stoacloud.v1.Project,
): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    stacks: project.stacks.map(parseShapleStackFromProto),
    createdAt: new Date(
      project.createdAt.seconds * 1000 + project.createdAt.nanos / 1000000,
    ),
    updatedAt: new Date(
      project.updatedAt.seconds * 1000 + project.updatedAt.nanos / 1000000,
    ),
  };
}
