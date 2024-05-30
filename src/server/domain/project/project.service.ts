import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { CreateProjectRequest } from '@/models/project';

@Service()
export class ProjectService {
  constructor(private readonly stoaCloudService: StoaCloudService) {}

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
