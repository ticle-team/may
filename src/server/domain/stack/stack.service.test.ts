import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { resetSchema } from '@/migrate';
import { StackService } from '@/server/domain/stack/stack.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { createStoaCloudServiceMock } from '@/server/common/__mocks__/stoacloud.service';

describe('given StackService', () => {
  let stackService: StackService;
  let mockStoaCloudService: any;

  beforeEach(async () => {
    await resetSchema();
    mockStoaCloudService = createStoaCloudServiceMock();
    Container.set(StoaCloudService, mockStoaCloudService);
    stackService = Container.get(StackService);
  });

  afterEach(async () => {
    const prisma = Container.get(PrismaService);
    await prisma.shapleStack.deleteMany({});
    await prisma.shapleProject.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('should retrieve and return a stack', async () => {
    // given
    const queriedStack = {
      id: 1,
      name: 'New Stack',
      description: 'This is a new stack',
      githubRepo: 'vincent-1014/self_test',
      githubBranch: 'main',
      projectId: 1,
      threadId: 1,
      endpoint: '',
      domain: '',
      authEnabled: true,
      auth: {},
      storageEnabled: true,
      storage: {},
      postgrestEnabled: true,
      postgrest: {},
      vapis: [
        {
          version: '1.0',
          pkg: {
            name: 'task-management',
            version: '1.0',
          },
        },
      ],
    };
    mockStoaCloudService.getStack.mockResolvedValue(queriedStack);

    // when
    const result = await stackService.getStack(queriedStack.id);

    // then
    expect(result).not.toBeNull();
    expect(result.id).toEqual(queriedStack.id);
    expect(result.name).toEqual(queriedStack.name);
    expect(result.description).toEqual(queriedStack.description);
    expect(result.githubRepo).toEqual(queriedStack.githubRepo);
    expect(result.githubBranch).toEqual(queriedStack.githubBranch);
    expect(result.projectId).toEqual(queriedStack.projectId);
    expect(result.threadId).toEqual(queriedStack.threadId);
    expect(result.vapis).toHaveLength(queriedStack.vapis.length);
  });
});
