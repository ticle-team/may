import { z } from 'zod';
import { stoacloud } from '@/protos/stoacloud';

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
  package: vapiPackage.nullish(),
});

export type VapiRelease = z.infer<typeof vapiRelease>;

export function vapiAccessToString(access: number): string {
  switch (access) {
    case stoacloud.v1.VapiPackageAccess.VapiPackageAccessPublic:
      return 'public';
    case stoacloud.v1.VapiPackageAccess.VapiPackageAccessPrivate:
      return 'private';
    default:
      return 'unknown';
  }
}
