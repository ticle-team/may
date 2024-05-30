import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { GetProjectsRequest } from '@/models/organization';

@Service()
export class OrganizationService {
  constructor(private readonly stoaCloudService: StoaCloudService) {}

  async getProjects(request: GetProjectsRequest) {
    // TODO: Implement getProjects feature using OrganizationStore and GetProjectsRequest
    const projects = await this.stoaCloudService.getProjects({
      page: request.page,
      perPage: request.perPage,
    });
    return {
      projects: projects,
      after: null,
    };
  }
}
