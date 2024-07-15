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
import { Session } from '@shaple/shaple';
import { Context } from '@/server/context';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';

describe('given ProjectService', () => {
  let projectService: ProjectService;
  let stoaCloudService: StoaCloudService;
  let mockData = {
    orgId: 1,
    id: 1,
    name: `test-project-${uuid.v4()}`,
    description: 'test description 1',
  };

  beforeEach(async () => {
    await resetSchema();
    stoaCloudService = Container.get(StoaCloudService);
    projectService = Container.get(ProjectService);
  });

  afterEach(async () => {
    const prisma = Container.get(PrismaService);
    await prisma.$disconnect();

    Container.reset();
    await stoaCloudService.resetSchema();
  });

  it('should create a project and return the project details', async () => {
    await using stack = new AsyncDisposableStack();
    const prisma = Container.get(PrismaService);
    const session = await createUser();
    stack.defer(async () => {
      await deleteUser(session);
    });
    // given
    const ctx = {
      session: session,
      tx: prisma,
    } as Context;

    // when
    const createProjectRequest = {
      orgId: 1,
      name: mockData.name,
      description: mockData.description,
    };
    const result = await projectService.createProject(
      ctx,
      createProjectRequest,
    );
    stack.defer(async () => {
      await projectService.deleteProject(result.id);
    });

    // then
    expect(result).not.toBeNull();
    expect(result.id).not.toEqual(0);
    expect(result.name).toEqual(mockData.name);
    expect(result.description).toEqual(mockData.description);
  });

  it('should retrieve and return a project', async () => {
    // given
    const project = await stoaCloudService.createProject(
      mockData.name,
      mockData.description,
      [],
    );

    // when
    const result = await projectService.getProject(project.id);

    // then
    expect(result).not.toBeNull();
    expect(result.id).toEqual(project.id);
    expect(result.name).toEqual(project.name);
    expect(result.description).toEqual(project.description);
  });

  it('should delete a project', async () => {
    // given
    const project = await stoaCloudService.createProject(
      mockData.name,
      mockData.description,
      [],
    );
    const retrieveResult = await projectService.getProject(project.id);

    // when
    await projectService.deleteProject(retrieveResult.id);
  });
});
