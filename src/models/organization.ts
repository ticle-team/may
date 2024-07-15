import { z } from 'zod';

export const organization = z.object({
  id: z.number(),
  name: z.string(),
});

export const getProjectsSchema = z.object({
  orgId: z.number(),
  page: z.number().default(1),
  perPage: z.number().default(10),
});

export type GetProjectsRequest = z.infer<typeof getProjectsSchema>;
