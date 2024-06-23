import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { CreateProjectRequest, Project } from '@/models/project';
import { getLogger } from '@/logger';
import { stoacloud } from '@/protos/stoacloud';
import { StackService } from '@/server/domain/stack/stack.service';

const logger = getLogger('server.domain.stack.service');

@Service()
export class ProjectService {
  constructor(
    private readonly stoaCloudService: StoaCloudService,
    private readonly stackService: StackService,
  ) {}

  async createProject(request: CreateProjectRequest) {
    const project = await this.stoaCloudService.createProject(
      request.name,
      request.description,
    );
    return project;
  }

  async deleteProject(projectId: number) {
    await this.stoaCloudService.deleteProject(projectId);
  }

  async getProject(projectId: number) {
    const project = await this.stoaCloudService.getProject(projectId);
    return project;
  }
}
