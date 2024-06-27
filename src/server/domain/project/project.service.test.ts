import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { resetSchema } from '@/migrate';
import { ProjectService } from '@/server/domain/project/project.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { createStoaCloudServiceMock } from '@/server/common/__mocks__/stoacloud.service';
import * as uuid from 'uuid';
import { project } from '@/models/project';
import { stoacloud } from '@/protos/stoacloud';
import { google } from '@/protos/google/protobuf/timestamp';

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
    await prisma.$disconnect();

    Container.reset();
  });

  it('should create a project and return the project details', async () => {
    // given
    const createdProject = stoacloud.v1.Project.fromObject({
      id: mockData.id,
      name: mockData.name,
      description: mockData.description,
      stacks: [],
      createdAt: google.protobuf.Timestamp.fromObject({
        seconds: 1680000000,
        nanos: 0,
      }),
      updatedAt: google.protobuf.Timestamp.fromObject({
        seconds: 1680000000,
        nanos: 0,
      }),
    });
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
    expect(result.createdAt).toEqual(
      new Date(createdProject.createdAt.seconds * 1000),
    );
    expect(result.updatedAt).toEqual(
      new Date(createdProject.updatedAt.seconds * 1000),
    );
  });

  it('should retrieve and return a project', async () => {
    // given
    const selectedProject = {
      id: 2,
      createdAt: new Date('2024-06-05T05:31:38.7425Z'),
      updatedAt: new Date('2024-06-05T05:31:38.7425Z'),
      name: 'test1',
      description: 'test1',
      stacks: [
        {
          id: 1,
          createdAt: new Date('2024-06-05T05:55:23.338072Z'),
          updatedAt: new Date('2024-06-05T05:55:23.523317Z'),
          projectId: 2,
          project: null,
          gitRepo: '',
          gitBranch: '',
          name: 'MySNS',
          domain: '5xm64tjweavzel9ley7rna2a3.local.shaple.io',
          scheme: 'http',
          siteUrl: 'http://localhost:3000',
          description: 'Social Networking Service stack',
          authEnabled: true,
          auth: {
            jwtSecret: 'AGe0rYSrkglFRjJsCPJSq8koxhjgitut',
          },
          adminApiKey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.eir4W8W4FWHjrgck4N68N3ieB59463Qpr1-_TVYk800',
          anonApiKey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.80qKP_y-Md9uLsUOoqRFCkVqD5BvkThhIB_-8Y8bvrc',
          storageEnabled: true,
          storage: {
            s3Bucket: '5xm64tjweavzel9ley7rna2a3.local.shaple.io',
            tenantId: 'Storage',
          },
          postgrestEnabled: true,
          postgrest: {
            schemas: ['public'],
          },
          vapis: null,
        },
      ],
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
    project.parse(result);

    expect(mockStoaCloudService.getProject).toHaveBeenCalledTimes(1);
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
