import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { GetProjectsRequest } from '@/models/organization';
import { getLogger } from '@/logger';
import { Project } from '@/models/project';

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

    const projects: Project[] = protoProjects.map((prjProto): Project => {
      return {
        id: prjProto.id,
        name: prjProto.name,
        description: prjProto.description,
        stacks: prjProto.stacks,
        createdAt: new Date(
          prjProto.createdAt.seconds * 1000 +
            prjProto.createdAt.nanos / 1000000,
        ),
        updatedAt: new Date(
          prjProto.updatedAt.seconds * 1000 +
            prjProto.updatedAt.nanos / 1000000,
        ),
      };
    });

    logger.debug('call getProjects', { projects });
    return {
      projects: projects,
      after: null,
    };
  }
}
