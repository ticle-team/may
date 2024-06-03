import { z } from 'zod';

export const vapiPackage = z.object({
  id: z.number(),
  name: z.string(),
  gitBranch: z.string(),
  gitRepo: z.string(),
});

export type VapiPackage = z.infer<typeof vapiPackage>;

export const vapiRelease = z.object({
  access: z.string(),
  id: z.number(),
  version: z.string(),
  packageId: z.number(),
});

export type VapiRelease = z.infer<typeof vapiRelease>;
