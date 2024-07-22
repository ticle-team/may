import { VapiRelease } from '@/models/vapi';
import { stoacloud } from '@/protos/stoacloud';

export type InstallAuthInput = Omit<
  Parameters<typeof stoacloud.v1.InstallAuthRequest.fromObject>[0],
  'id'
>;

export type InstallStorageInput = Omit<
  Parameters<typeof stoacloud.v1.InstallStorageRequest.fromObject>[0],
  'id'
>;

export type InstallPostgrestInput = Omit<
  Parameters<typeof stoacloud.v1.InstallPostgrestRequest.fromObject>[0],
  'id'
>;

export type InstallVapiInput = {
  vapiId: number;
};

export type SearchVapisInput = {
  name?: string;
  version?: string;
  projectName?: string;
  pageNum?: number;
  pageSize?: number;
};

export type SearchVapisOutput = {
  releases: VapiRelease[];
  numTotal: number;
  nextPage?: number;
};

export type RegisterVapisInput = {
  projectId: number;
  gitRepo: string;
  gitBranch: string;
};

export type RegisterVapisOutput = {
  name: string;
  version: string;
  deployStatus: 'ok' | 'fail' | 'skip';
  message?: string;
  releaseId: number;
};

export type GetProjectsInput = {
  name?: string;
  page: number;
  perPage: number;
  memberId?: string;
};

export type CreateInstanceInput = Parameters<
  typeof stoacloud.v1.CreateInstanceRequest.fromObject
>[0];

export type DeployStackInput = Parameters<
  typeof stoacloud.v1.DeployStackRequest.fromObject
>[0];

export type GetVapiPackagesInput = {
  name: string;
};
