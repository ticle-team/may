import { z } from 'zod';

export const user = z.object({
  id: z.number(),
  orgIds: z.array(z.number()),
});

export type User = z.infer<typeof user>;
