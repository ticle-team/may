import { z } from 'zod';
import { stack } from '@/models/stack';

export const project = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  stacks: z.array(stack),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Project = z.infer<typeof project>;
