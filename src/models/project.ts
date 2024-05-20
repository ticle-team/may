import { z } from 'zod';

export const project = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});

export type Project = z.infer<typeof project>;
