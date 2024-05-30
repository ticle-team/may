import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { resetSchema } from '@/migrate';
import { ProjectService } from '@/server/domain/project/project.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { createStoaCloudServiceMock } from '@/server/common/__mocks__/stoacloud.service';
import * as uuid from 'uuid';

describe('given ProjectService', () => {
  let projectService: ProjectService;
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
    projectService = Container.get(ProjectService);
  });

  afterEach(async () => {
    const prisma = Container.get(PrismaService);
    await prisma.shapleStack.deleteMany({});
    await prisma.shapleProject.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('should create a project and return the project details', async () => {
    // given
    const createdProject = {
      id: mockData.id,
      name: mockData.name,
      description: mockData.description,
      stacks: [],
      createdAt: '2024-05-30T12:38:55.605056Z',
      updatedAt: '2024-05-31T12:38:55.605056Z',
    };
    mockStoaCloudService.createProject.mockResolvedValue(createdProject);

    // when
    const createProjectRequest = {
      orgId: 1,
      name: mockData.name,
      description: mockData.description,
    };
    const result = await projectService.createProject(createProjectRequest);

    // then
    expect(result).not.toBeNull();
    expect(result.id).toEqual(createdProject.id);
    expect(result.name).toEqual(createdProject.name);
    expect(result.description).toEqual(createdProject.description);
    expect(result.createdAt).toEqual(createdProject.createdAt);
    expect(result.updatedAt).toEqual(createdProject.updatedAt);
  });

  it('should retrieve and return a project', async () => {
    // given
    const selectedProject = {
      id: mockData.id,
      name: mockData.name,
      description: mockData.description,
      stacks: [],
      createdAt: '2024-05-30T12:38:55.605056Z',
      updatedAt: '2024-05-31T12:38:55.605056Z',
    };
    mockStoaCloudService.getProject.mockResolvedValue(selectedProject);

    // when
    const result = await projectService.getProject(selectedProject.id);

    // then
    expect(result).not.toBeNull();
    expect(result.id).toEqual(selectedProject.id);
    expect(result.name).toEqual(selectedProject.name);
    expect(result.description).toEqual(selectedProject.description);
    expect(result.createdAt).toEqual(selectedProject.createdAt);
    expect(result.updatedAt).toEqual(selectedProject.updatedAt);
  });

  it('should delete a project', async () => {
    // given
    const selectedProject = {
      id: mockData.id,
      name: mockData.name,
      description: mockData.description,
      stacks: [],
      createdAt: '2024-05-30T12:38:55.605056Z',
      updatedAt: '2024-05-31T12:38:55.605056Z',
    };
    mockStoaCloudService.getProject.mockResolvedValue(selectedProject);
    const retrieveResult = await projectService.getProject(selectedProject.id);

    // when
    await projectService.deleteProject(retrieveResult.id);
  });
});
