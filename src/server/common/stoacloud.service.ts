import { Service } from 'typedi';
import { Axios, AxiosError, isAxiosError } from 'axios';
import { Stack } from '@/models/stack';
import { Project } from '@/models/project';
import { TRPCError } from '@trpc/server';
import {
  InstallAuthInput,
  InstallPostgrestInput,
  InstallStorageInput,
  InstallVapiInput,
  RegisterVapisInput,
  RegisterVapisOutput,
  SearchVapisInput,
  SearchVapisOutput,
  StoaCloudError,
} from '@/models/stoacloud';
import { camelToSnake, snakeToCamel } from '@/util/cases';
import { getLogger } from '@/logger';

const logger = getLogger('server.common.stoacloud.service');

@Service()
export class StoaCloudService {
  private readonly axios = new Axios({
    baseURL: process.env.STOACLOUD_API_URL,
    headers: {
      'X-StoaCloud-Client': 'may',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    responseType: 'json',
    validateStatus: (status) => {
      return status >= 200 && status < 300;
    },
  });

  constructor() {
    this.axios.interceptors.request.use(
      (req) => {
        logger.info('call stoacloud API', { req });
        if (req.data) {
          if (req.headers.get('Content-Type') === 'application/json') {
            req.data = JSON.stringify(camelToSnake(req.data));
          }
        }
        return req;
      },
      (err) => {
        logger.error('failure request interceptor of stoacloud API', { err });
        throw err;
      },
    );
    this.axios.interceptors.response.use(
      (res) => {
        if (res.data) {
          if (res.config.responseType === 'json') {
            res.data = snakeToCamel(JSON.parse(res.data));
          }
        }
        return res;
      },
      (err) => {
        logger.error('failure stoacloud API', { err });
        if (isAxiosError<StoaCloudError>(err)) {
          err = err as AxiosError<StoaCloudError>;
          const error = err.response?.data?.error;

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error,
          });
        }

        throw err;
      },
    );
  }

  async createProject(name: string, description: string) {
    const { data: project } = await this.axios.post<Project>('/v1/projects', {
      name,
      description,
    });

    return project;
  }

  async deleteProject(projectId: number) {
    await this.axios.delete(`/v1/projects/${projectId}`);
  }

  async getProject(projectId: number) {
    const { data } = await this.axios.get<Project>(`/v1/projects/${projectId}`);

    return data;
  }

  async createStack(
    siteUrl: string,
    projectId: number,
    name: string,
    description: string,
  ) {
    const { data: stack } = await this.axios.post<Stack>('/v1/stacks', {
      siteUrl,
      projectId: projectId,
      name,
      description,
    });

    return stack;
  }

  async getStack(stackId: number) {
    const { data: stack } = await this.axios.get<Stack>(
      `/v1/stacks/${stackId}`,
    );
    return stack;
  }

  async installAuth(stackId: number, input: InstallAuthInput) {
    await this.axios.post(`/v1/stacks/${stackId}/auth`, input);
  }

  async uninstallAuth(stackId: number) {
    await this.axios.delete(`/v1/stacks/${stackId}/auth`);
  }

  async installStorage(stackId: number, input: InstallStorageInput) {
    await this.axios.post(`/v1/stacks/${stackId}/storage`, input);
  }

  async uninstallStorage(stackId: number) {
    await this.axios.delete(`/v1/stacks/${stackId}/storage`);
  }

  async installPostgrest(stackId: number, input: InstallPostgrestInput) {
    await this.axios.post(`/v1/stacks/${stackId}/postgrest`, input);
  }

  async uninstallPostgrest(stackId: number) {
    await this.axios.delete(`/v1/stacks/${stackId}/postgrest`);
  }

  async deleteStack(stackId: number) {
    await this.axios.delete(`/v1/stacks/${stackId}`);
  }

  async installVapi(stackId: number, input: InstallVapiInput) {
    await this.axios.post(`/v1/stacks/${stackId}/vapis`, input);
  }

  async uninstallVapi(stackId: number, vapiId: number) {
    await this.axios.delete(`/v1/stacks/${stackId}/vapis/${vapiId}`);
  }

  async getVapiRelease(id: number) {
    await this.axios.get(`/v1/vapi-releases/${id}`);
  }

  async getVapiPackage(id: number) {
    await this.axios.get(`/v1/vapis/${id}`);
  }

  async searchVapis(input: SearchVapisInput) {
    const { data } = await this.axios.get<SearchVapisOutput>(
      '/v1/vapis:search',
      {
        params: input,
      },
    );

    return data;
  }

  async registerVapis(
    jwt: string,
    githubToken: string | null,
    input: RegisterVapisInput,
  ) {
    const { data } = await this.axios.post<RegisterVapisOutput[]>(
      '/v1/vapis:deploy',
      input,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          ...(githubToken
            ? {
                'X-Github-Token': githubToken,
              }
            : {}),
        },
      },
    );
    return data;
  }

  async deleteAllVapiReleases(jwt: string, packageId?: number) {
    const requestPath = packageId
      ? `/v1/vapis/${packageId}/releases`
      : '/v1/vapi-releases';
    await this.axios.delete(requestPath, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async deleteAllVapiPackages(jwt: string, projectId?: number) {
    const requestPath = projectId
      ? `/v1/projects/${projectId}/v1/vapis`
      : '/v1/vapis';
    await this.axios.delete(requestPath, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async deleteVapiRelease(jwt: string, releaseId: number) {
    await this.axios.delete(`/v1/vapi-releases/${releaseId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async deleteVapiPackage(jwt: string, packageId: number) {
    await this.axios.delete(`/v1/vapis/${packageId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async addProjectUser(projectId: number, memberId: string) {
    await this.axios.put(`/v1/projects/${projectId}/members/${memberId}`);
  }

  async resetSchema() {
    if (process.env.NODE_ENV == 'production') {
      throw new Error('resetSchema is not allowed in production');
    }

    await this.axios.post('/reset-schema', undefined, {
      responseType: 'text',
    });
  }
}
