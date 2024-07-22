import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { GetProjectsRequest } from '@/models/organization';
import { getLogger } from '@/logger';
import { parseShapleProjectFromProto, Project } from '@/models/project';
import { ProjectService } from '@/server/domain/project/project.service';
import { Context } from '@/server/context';
import { UserService } from '@/server/domain/user/user.service';

const logger = getLogger('server.domain.organization.service');

@Service()
export class OrganizationService {
  constructor(
    private readonly stoaCloudService: StoaCloudService,
    private readonly userService: UserService,
  ) {}

  async getProjects(ctx: Context, request: GetProjectsRequest) {
    const me = await this.userService.getUser(ctx);
    const protoProjects = await this.stoaCloudService.getProjects({
      page: request.page,
      perPage: request.perPage,
      memberId: me.ownerId,
    });

    const projects: Project[] = protoProjects.map(parseShapleProjectFromProto);

    logger.debug('call getProjects', { projects });
    return {
      projects: projects,
      after: null,
    };
  }
}
