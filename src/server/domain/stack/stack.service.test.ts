import { Container } from 'typedi';
import { resetSchema } from '@/migrate';
import { StackService } from '@/server/domain/stack/stack.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import {
  createStoaCloudServiceMock,
  StoaCloudServiceMock,
} from '@/server/common/__mocks__/stoacloud.service';
import {
  createThreadStoreMock,
  ThreadStoreMock,
} from '@/server/domain/thread/__mocks__/thread.store';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { PrismaClient, Thread } from '@prisma/client';
import { stoacloud } from '@/protos/stoacloud';
import { PrismaService } from '@/server/common/prisma.service';
import VapiPackageAccess = stoacloud.v1.VapiPackageAccess;

describe('given StackService', () => {
  let stackService: StackService;
  let mockStoaCloudService: StoaCloudServiceMock;
  let mockThreadStore: ThreadStoreMock;
  let prisma: PrismaClient;
  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    mockStoaCloudService = createStoaCloudServiceMock();
    mockThreadStore = createThreadStoreMock();
    Container.set(StoaCloudService, mockStoaCloudService);
    Container.set(ThreadStore, mockThreadStore);
    stackService = Container.get(StackService);

    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.$disconnect();

    Container.reset();
  });

  it('should retrieve and return a stack', async () => {
    await using cleanup = new DisposableStack();
    // given
    const expectedStack = stoacloud.v1.Stack.fromObject({
      id: 1,
      name: 'New Stack',
      description: 'This is a new stack',
      gitRepo: 'vincent-1014/self_test',
      gitBranch: 'main',
      projectId: 1,
      domain: '',
      scheme: 'http',
      createdAt: { seconds: 0, nanos: 0 },
      updatedAt: { seconds: 0, nanos: 0 },
      authEnabled: true,
      auth: {},
      storageEnabled: true,
      storage: {},
      postgrestEnabled: true,
      postgrest: {},
      siteUrl: 'localhost:3000',
      adminApiKey: '',
      anonApiKey: '',
      vapis: [
        {
          vapiId: 1,
          vapi: {
            id: 1,
            version: '1.0.0',
            access: VapiPackageAccess.VapiPackageAccessPublic,
            packageId: 1,
          },
        },
      ],
    });
    mockStoaCloudService.getStack.mockResolvedValue(expectedStack);
    cleanup.defer(() => {
      expect(mockStoaCloudService.getStack).toHaveBeenCalledTimes(1);
    });
    const expectedThread: Thread = {
      id: 1,
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: 0,
      openaiThreadId: '',
      shapleStackId: 1,
      shapleProjectId: 1,
      stateInfo: {
        current_step: 6,
        name: 'New Stack',
        description: 'This is a new stack',
        dependencies: {
          base_apis: [],
          vapis: [
            {
              id: 1,
              name: 'vapi',
            },
          ],
        },
      },
      state: 'stack_created',
    };
    mockThreadStore.findThreadByStackId.mockResolvedValue(expectedThread);
    cleanup.defer(() => {
      expect(mockThreadStore.findThreadByStackId).toHaveBeenCalledTimes(1);
    });
    // when
    const result = await stackService.getStack(
      { user: null, tx: prisma },
      expectedStack.id,
    );

    // then
    expect(result).not.toBeNull();
    expect(result.id).toEqual(expectedStack.id);
    expect(result.name).toEqual(expectedStack.name);
    expect(result.description).toEqual(expectedStack.description);
    expect(result.gitRepo).toEqual(expectedStack.gitRepo);
    expect(result.gitBranch).toEqual(expectedStack.gitBranch);
    expect(result.projectId).toEqual(expectedStack.projectId);
    expect(result.thread!.id).toEqual(expectedThread.id);
    expect(result.vapis).toHaveLength(expectedStack.vapis.length);
  });
});
