import { z } from 'zod';

export const organization = z.object({
  id: z.number(),
  name: z.string(),
});
