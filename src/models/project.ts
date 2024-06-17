import { z } from 'zod';
import { shapleStack } from '@/models/stack';

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
