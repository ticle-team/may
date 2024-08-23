import { Service } from 'typedi';
import {
  CreateInstanceInput,
  DeployStackInput,
  GetProjectsInput,
  GetVapiPackagesInput,
  InstallAuthInput,
  InstallPostgrestInput,
  InstallStorageInput,
  InstallVapiInput,
  RegisterVapisInput,
  SearchVapisInput,
} from '@/models/stoacloud';
import { getLogger } from '@/logger';
import { stoacloud } from '@/protos/stoacloud';
import { credentials, Metadata, ServiceError, status } from '@grpc/grpc-js';
import { google } from '@/protos/google/protobuf/empty';
import { Context } from '@/server/context';
import { TRPCError } from '@trpc/server';

const logger = getLogger('server.common.stoacloud.service');

function createStoaCloudServiceClient() {
  const creds =
    process.env.STOACLOUD_API_GRPC_SECURE == 'true'
      ? credentials.createSsl()
      : credentials.createInsecure();

  const addr = process.env.STOACLOUD_API_GRPC_ADDR || 'localhost';
  const port = process.env.STOACLOUD_API_GRPC_PORT || '50051';
  return new stoacloud.v1.StoaCloudServiceClient(`${addr}:${port}`, creds, {
    'grpc.service_config': '{"loadBalancingConfig":[{"round_robin":{}}]}',
  });
}

function translateGrpcError(e: Error): TRPCError | Error {
  if (!('code' in e && 'details' in e && 'metadata' in e)) {
    return e;
  }

  const err = e as ServiceError;
  switch (err.code) {
    case status.NOT_FOUND:
      return new TRPCError({
        message: err.message,
        code: 'NOT_FOUND',
        cause: err,
      });
    case status.ALREADY_EXISTS:
      return new TRPCError({
        message: err.message,
        code: 'CONFLICT',
        cause: err,
      });
    case status.PERMISSION_DENIED:
      return new TRPCError({
        message: err.message,
        code: 'FORBIDDEN',
        cause: err,
      });
    default:
      return new TRPCError({
        message: err.message,
        code: 'INTERNAL_SERVER_ERROR',
        cause: err,
      });
  }
}

@Service()
export class StoaCloudService {
  private readonly client = createStoaCloudServiceClient();

  async getVapiDocsUrl(jwt: string | null, vapiReleaseId: number) {
    const md = new Metadata();
    md.set('authorization', `Bearer ${jwt}`);

    const { url } = await this.client
      .GetVapiDocsUrl(
        stoacloud.v1.GetVapiDocsUrlRequest.fromObject({
          releaseId: vapiReleaseId,
        }),
        md,
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
    return url;
  }

  async createProject(name: string, description: string, userIds: string[]) {
    return await this.client
      .CreateProject(
        stoacloud.v1.CreateProjectRequest.fromObject({
          name,
          description,
          userIds,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async deleteProject(projectId: number) {
    await this.client
      .DeleteProject(stoacloud.v1.ProjectId.fromObject({ id: projectId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getProject(projectId: number) {
    return await this.client
      .GetProjectById(stoacloud.v1.ProjectId.fromObject({ id: projectId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getProjects({
    name = undefined,
    perPage,
    page,
    memberId = undefined,
  }: GetProjectsInput) {
    const { projects } = await this.client
      .GetProjects(
        stoacloud.v1.GetProjectsRequest.fromObject({
          name,
          perPage,
          page,
          memberId,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });

    return projects;
  }

  async createStack(
    siteUrl: string,
    projectId: number,
    name: string,
    description: string,
  ) {
    return await this.client
      .CreateStack(
        stoacloud.v1.CreateStackRequest.fromObject({
          siteUrl,
          projectId,
          name,
          description,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getStack(stackId: number) {
    return await this.client
      .GetStackById(stoacloud.v1.StackId.fromObject({ id: stackId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async installAuth(stackId: number, input: InstallAuthInput) {
    await this.client.InstallAuth(
      stoacloud.v1.InstallAuthRequest.fromObject({
        ...input,
        id: stackId,
        isUpdate: input.isUpdate,
      }),
    );
  }

  async uninstallAuth(stackId: number) {
    await this.client.UninstallAuth(
      stoacloud.v1.StackId.fromObject({ id: stackId }),
    );
  }

  async installStorage(stackId: number, input: InstallStorageInput) {
    await this.client
      .InstallStorage(
        stoacloud.v1.InstallStorageRequest.fromObject({
          ...input,
          id: stackId,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async uninstallStorage(stackId: number) {
    await this.client
      .UninstallStorage(stoacloud.v1.StackId.fromObject({ id: stackId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async installPostgrest(stackId: number, input: InstallPostgrestInput) {
    await this.client
      .InstallPostgrest(
        stoacloud.v1.InstallPostgrestRequest.fromObject({
          ...input,
          id: stackId,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async uninstallPostgrest(stackId: number) {
    await this.client
      .UninstallPostgrest(stoacloud.v1.StackId.fromObject({ id: stackId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async deleteStack(stackId: number) {
    await this.client
      .DeleteStack(stoacloud.v1.StackId.fromObject({ id: stackId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async installVapi(stackId: number, input: InstallVapiInput) {
    await this.client
      .InstallVapi(
        stoacloud.v1.InstallVapiRequest.fromObject({
          ...input,
          stackId,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async uninstallVapi(stackId: number, vapiId: number) {
    await this.client
      .UninstallVapi(
        stoacloud.v1.UninstallVapiRequest.fromObject({
          stackId,
          vapiId,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getVapiReleasesInPackage(packageId: number) {
    const { releases } = await this.client
      .GetVapiReleasesInPackage(
        stoacloud.v1.VapiPackageId.fromObject({ id: packageId }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });

    return releases;
  }

  async getVapiReleaseInPackage(packageId: number, version: string) {
    return await this.client
      .GetVapiReleaseByVersionInPackage(
        stoacloud.v1.GetVapiReleaseByVersionInPackageRequest.fromObject({
          packageId,
          version,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getVapiPackages(input: GetVapiPackagesInput) {
    const res = await this.client
      .GetVapiPackages(stoacloud.v1.GetVapiPackagesRequest.fromObject(input))
      .catch((e) => {
        throw translateGrpcError(e);
      });

    return res.packages;
  }

  async searchVapis(input: SearchVapisInput) {
    return await this.client
      .SearchVapis(stoacloud.v1.SearchVapisRequest.fromObject(input))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async registerVapis(
    { session, githubToken }: Context,
    input: RegisterVapisInput,
  ) {
    const md = new Metadata();
    if (session?.access_token) {
      md.set('authorization', `Bearer ${session.access_token}`);
    }
    if (githubToken) {
      md.set('x-github-token', githubToken || '');
    }

    const res = await this.client
      .RegisterVapi(
        stoacloud.v1.RegisterVapiRequest.fromObject({
          ...input,
        }),
        md,
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });

    return res.results;
  }

  async deleteAllVapiReleases(jwt: string, packageId?: number) {
    const md = new Metadata();
    md.set('authorization', `Bearer ${jwt}`);

    if (packageId) {
      await this.client
        .DeleteAllVapiReleasesInPackage(
          stoacloud.v1.VapiPackageId.fromObject({ id: packageId! }),
          md,
        )
        .catch((e) => {
          throw translateGrpcError(e);
        });
    } else {
      await this.client
        .DeleteAllVapiReleases(new google.protobuf.Empty(), md)
        .catch((e) => {
          throw translateGrpcError(e);
        });
    }
  }

  async deleteVapiRelease({ session }: Context, releaseId: number) {
    try {
      const md = new Metadata();
      if (session) {
        md.set('authorization', `Bearer ${session?.access_token}`);
      }

      await this.client
        .DeleteVapiRelease(
          stoacloud.v1.VapiReleaseId.fromObject({ id: releaseId }),
          md,
        )
        .catch((e) => {
          throw translateGrpcError(e);
        });
    } catch (err) {
      logger.error('error deleting vapi release', { err });
      throw err;
    }
  }

  async addProjectMember(projectId: number, memberId: string) {
    return await this.client
      .AddProjectMember(
        stoacloud.v1.AddProjectMemberRequest.fromObject({
          id: projectId,
          memberId,
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async resetSchema() {
    if (process.env.NODE_ENV == 'production') {
      throw new Error('resetSchema is not allowed in production');
    }

    await this.client.ResetSchema(new google.protobuf.Empty());
  }

  async createInstance(input: CreateInstanceInput) {
    if (!input.zone) {
      input.zone = stoacloud.v1.InstanceZone.InstanceZoneDefault;
    }

    return await this.client
      .CreateInstance(stoacloud.v1.CreateInstanceRequest.fromObject(input))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async stopInstance(instanceId: number) {
    await this.client
      .StopInstance(stoacloud.v1.InstanceId.fromObject({ id: instanceId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async deleteInstance(instanceId: number) {
    await this.client
      .DeleteInstance(stoacloud.v1.InstanceId.fromObject({ id: instanceId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async deployStack(instanceId: number, input?: DeployStackInput) {
    await this.client
      .DeployStack(
        stoacloud.v1.DeployStackRequest.fromObject({
          id: instanceId,
          ...(input ?? {}),
        }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getInstancesInStack(stackId: number) {
    const { instances } = await this.client
      .GetStackInstances(stoacloud.v1.StackId.fromObject({ id: stackId }))
      .catch((e) => {
        throw translateGrpcError(e);
      });

    return instances;
  }

  async getVapiPackage(packageId: number) {
    return await this.client
      .GetVapiPackageById(
        stoacloud.v1.VapiPackageId.fromObject({ id: packageId }),
      )
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }

  async getUser({ session }: Context) {
    if (!session) {
      throw new Error('Unauthorized');
    }

    const md = new Metadata();
    md.set('authorization', `Bearer ${session.access_token}`);

    return await this.client
      .GetUser(google.protobuf.Empty.fromObject({}), md)
      .catch((e) => {
        throw translateGrpcError(e);
      });
  }
}
