import { z } from 'zod';

export const thread = z.object({
  id: z.number(),
  shapleProjectId: z.number().nullish(),
});

export type Thread = z.infer<typeof thread>;
