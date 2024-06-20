import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { resetSchema } from '@/migrate';
import { OrganizationService } from '@/server/domain/organization/organization.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { createStoaCloudServiceMock } from '@/server/common/__mocks__/stoacloud.service';
import * as uuid from 'uuid';
import { stoacloud } from '@/protos/stoacloud';

describe('given OrganizationService', () => {
  let organizationService: OrganizationService;
  let mockStoaCloudService: any;
  let mockData = {
    orgId: 1,
    id: 1,
    name: `test-project-${uuid.v4()}`,
    description: 'test description 1',
  };

  beforeEach(async () => {
    await resetSchema();
    mockStoaCloudService = createStoaCloudServiceMock();
    Container.set(StoaCloudService, mockStoaCloudService);
    organizationService = Container.get(OrganizationService);
  });

  afterEach(async () => {
    const prisma = Container.get(PrismaService);
    await prisma.$disconnect();

    Container.reset();
  });

  it('should retrieve and return a project list', async () => {
    // given
    const createdProjects = [
      stoacloud.v1.Project.fromObject({
        id: mockData.id,
        name: mockData.name,
        description: mockData.description,
        stacks: [],
        createdAt: { seconds: 10, nanos: 1 },
        updatedAt: { seconds: 10, nanos: 1 },
      }),
    ];
    mockStoaCloudService.getProjects.mockResolvedValue(createdProjects);

    // when
    const getProjectsRequest = {
      orgId: 1,
      page: 1,
      perPage: 10,
    };
    const { projects: result } =
      await organizationService.getProjects(getProjectsRequest);

    // then
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(createdProjects[0].id);
    expect(result[0].name).toEqual(createdProjects[0].name);
    expect(result[0].description).toEqual(createdProjects[0].description);
  });
});
