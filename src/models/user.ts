import { z } from 'zod';
import { organization } from '@/models/organization';

export const user = z.object({
  id: z.number(),
  organizations: organization.array(),
  nickname: z.nullable(z.string()),
  description: z.nullable(z.string().optional()),
});

export type User = z.infer<typeof user>;
