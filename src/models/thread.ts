import { z } from 'zod';

export const thread = z.object({
  id: z.number(),
  shapleProjectId: z.number().nullable(),
  shapleStackId: z.number().nullable(),
});

export type Thread = z.infer<typeof thread>;
