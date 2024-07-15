import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { resetSchema } from '@/migrate';
import { OrganizationService } from '@/server/domain/organization/organization.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import * as uuid from 'uuid';
import { Session } from '@shaple/shaple';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';
import { Context } from '@/server/context';

describe('given OrganizationService', () => {
  let organizationService: OrganizationService;
  let stoaCloudService: StoaCloudService;
  let session: Session;
  let prisma: PrismaService;

  beforeEach(async () => {
    session = await createUser();
    await resetSchema();
    stoaCloudService = Container.get(StoaCloudService);
    organizationService = Container.get(OrganizationService);
    prisma = Container.get(PrismaService);
  });

  afterEach(async () => {
    await prisma.$disconnect();
    await stoaCloudService.resetSchema();
    Container.reset();
    await deleteUser(session);
  });

  it('should retrieve and return a project list', async () => {
    // given
    const mockData = {
      orgId: 1,
      id: 1,
      name: `test-project-${uuid.v4()}`,
      description: 'test description 1',
    };
    const ctx = {
      session,
      tx: prisma,
    } as Context;
    const createdProject = await stoaCloudService.createProject(
      mockData.name,
      mockData.description,
      [session.user.id],
    );
    const createdProjects = [createdProject];

    // when
    const getProjectsRequest = {
      orgId: 1,
      page: 1,
      perPage: 10,
    };
    const { projects: result } = await organizationService.getProjects(
      ctx,
      getProjectsRequest,
    );

    // then
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(createdProjects[0].id);
    expect(result[0].name).toEqual(createdProjects[0].name);
    expect(result[0].description).toEqual(createdProjects[0].description);
  });
});
