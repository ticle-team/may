import { Service } from 'typedi';
import { Axios, AxiosError, isAxiosError } from 'axios';
import { Stack } from '@/models/stack';
import { Project } from '@/models/project';
import { TRPCError } from '@trpc/server';
import {
  EnableOrUpdateAuthInput,
  EnableOrUpdatePostgrestInput,
  EnableOrUpdateStorageInput,
  EnableVapiInput,
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
    const { data: project } = await this.axios.post<Project>('/projects', {
      name,
      description,
    });

    return project;
  }

  async deleteProject(projectId: number) {
    await this.axios.delete(`/projects/${projectId}`);
  }

  async getProject(projectId: number) {
    const { data } = await this.axios.get<Project>(`/projects/${projectId}`);

    return data;
  }

  async createStack(
    siteUrl: string,
    projectId: number,
    name: string,
    description: string,
  ) {
    const { data: stack } = await this.axios.post<Stack>('/stacks', {
      siteUrl,
      projectId,
      name,
      description,
    });

    return stack;
  }

  async getStack(stackId: number) {
    const { data: stack } = await this.axios.get<Stack>(`/stacks/${stackId}`);
    return stack;
  }

  async installAuth(stackId: number, input: EnableOrUpdateAuthInput) {
    await this.axios.post(`/stacks/${stackId}/auth`, input);
  }

  async uninstallAuth(stackId: number) {
    await this.axios.delete(`/stacks/${stackId}/auth`);
  }

  async installStorage(stackId: number, input: EnableOrUpdateStorageInput) {
    await this.axios.post(`/stacks/${stackId}/storage`, input);
  }

  async uninstallStorage(stackId: number) {
    await this.axios.delete(`/stacks/${stackId}/storage`);
  }

  async installPostgrest(stackId: number, input: EnableOrUpdatePostgrestInput) {
    await this.axios.post(`/stacks/${stackId}/postgrest`, input);
  }

  async uninstallPostgrest(stackId: number) {
    await this.axios.delete(`/stacks/${stackId}/postgrest`);
  }

  async deleteStack(stackId: number) {
    await this.axios.delete(`/stacks/${stackId}`);
  }

  async installVapi(stackId: number, input: EnableVapiInput) {
    await this.axios.post(`/stacks/${stackId}/vapis`, input);
  }

  async uninstallVapi(stackId: number, vapiId: number) {
    await this.axios.delete(`/stacks/${stackId}/vapis/${vapiId}`);
  }

  async getVapiRelease(id: number) {
    await this.axios.get(`/vapi-releases/${id}`);
  }

  async getVapiPackage(id: number) {
    await this.axios.get(`/vapis/${id}`);
  }

  async searchVapis(input: SearchVapisInput) {
    const { data } = await this.axios.get<SearchVapisOutput>('/vapis:search', {
      params: input,
    });

    return data;
  }
}
