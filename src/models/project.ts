import { z } from 'zod';
import { user } from '@/models/user';

export const project = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});
