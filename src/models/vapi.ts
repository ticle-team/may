import { z } from 'zod';
import { stoacloud } from '@/protos/stoacloud';

export const vapiPackage = z.object({
  id: z.number(),
  name: z.string(),
  gitBranch: z.string(),
  gitRepo: z.string(),
  author: z.object({
    id: z.number(),
    name: z.string(),
    profileUrl: z.string(),
  }),
  overallRank: z.number(),
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

export function parseVapiReleaseFromProto(
  vapiRelProto: stoacloud.v1.VapiRelease,
): VapiRelease {
  return {
    id: vapiRelProto.id,
    version: vapiRelProto.version,
    access: vapiAccessToString(vapiRelProto.access),
    packageId: vapiRelProto.packageId,
  };
}

export function parseVapiPackageFromProto(
  vapiPackProto: stoacloud.v1.VapiPackage,
): VapiPackage {
  const author = vapiPackProto.author;
  return {
    id: vapiPackProto.id,
    name: vapiPackProto.name,
    gitBranch: vapiPackProto.gitBranch,
    gitRepo: vapiPackProto.gitRepo,
    author: {
      id: author.id,
      name: author.name,
      profileUrl: author.profileUrl,
    },
    overallRank: vapiPackProto.overallRank,
  };
}
