import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import {
  CreateProjectRequest,
  parseShapleProjectFromProto,
  Project,
} from '@/models/project';
import { getLogger } from '@/logger';
import { Context } from '@/server/context';
import { UserService } from '@/server/domain/user/user.service';

const logger = getLogger('server.domain.stack.service');

@Service()
export class ProjectService {
  constructor(
    private readonly stoaCloudService: StoaCloudService,
    private readonly userService: UserService,
  ) {}

  async createProject(
    ctx: Context,
    request: CreateProjectRequest,
  ): Promise<Project> {
    const me = await this.userService.getUser(ctx);
    const project = await this.stoaCloudService.createProject(
      request.name,
      request.description,
      [me.ownerId],
    );

    return {
      ...parseShapleProjectFromProto(project),
      stacks: [],
    };
  }

  async deleteProject(projectId: number) {
    await this.stoaCloudService.deleteProject(projectId);
  }

  async getProject(projectId: number): Promise<Project> {
    const projectProto = await this.stoaCloudService.getProject(projectId);
    return parseShapleProjectFromProto(projectProto);
  }
}
