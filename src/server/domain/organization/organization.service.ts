import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { GetProjectsRequest } from '@/models/organization';
import { getLogger } from '@/logger';
import { parseShapleProjectFromProto, Project } from '@/models/project';
import { ProjectService } from '@/server/domain/project/project.service';

const logger = getLogger('server.domain.organization.service');

@Service()
export class OrganizationService {
  constructor(private readonly stoaCloudService: StoaCloudService) {}

  async getProjects(request: GetProjectsRequest) {
    // TODO: Implement getProjects feature using OrganizationStore and GetProjectsRequest
    const protoProjects = await this.stoaCloudService.getProjects({
      page: request.page,
      perPage: request.perPage,
    });

    const projects: Project[] = protoProjects.map(parseShapleProjectFromProto);

    logger.debug('call getProjects', { projects });
    return {
      projects: projects,
      after: null,
    };
  }
}
