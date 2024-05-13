import { z } from 'zod';

export const vapiPackage = z.object({
  name: z.string(),
});

export type VapiPackage = z.infer<typeof vapiPackage>;

export const vapiRelease = z.object({
  version: z.string(),
  pkg: vapiPackage.nullable(),
});

export type VapiRelease = z.infer<typeof vapiRelease>;
