import { resetSchema } from '@/migrate';
import { Container } from 'typedi';
import { UserService } from '@/server/domain/user/user.service';
import { PrismaService } from '@/server/common/prisma.service';
import { Session, User } from '@shaple/shaple';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import {
  createStoaCloudServiceMock,
  StoaCloudServiceMock,
} from '@/server/common/__mocks__/stoacloud.service';
import { stoacloud } from '@/protos/stoacloud';

describe('given UserService with real UserStore', () => {
  const ownerId = '123123';
  let userService: UserService;
  let prisma: PrismaService;
  let stoaCloudService: StoaCloudServiceMock;

  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    await prisma.$connect();
    stoaCloudService = createStoaCloudServiceMock();
    Container.set(StoaCloudService, stoaCloudService);
    userService = Container.get(UserService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('when getting new user, then should create new user', async () => {
    using stack = new DisposableStack();
    const ctx = {
      session: {
        user: {
          id: ownerId,
        },
      } as Session,
      tx: prisma,
      githubToken: null,
    };
    stoaCloudService.getUser.mockReturnValueOnce(
      Promise.resolve(
        stoacloud.v1.User.fromObject({
          id: 1,
          name: 'dennis',
          ownerId: '123123',
        }),
      ),
    );
    stack.defer(async () => {
      expect(stoaCloudService.getUser).toHaveBeenCalled();
    });
    const existingUser = await prisma.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(existingUser).toBeNull();

    const user = await userService.getUser(ctx);
    expect(user.ownerId).toBe(ownerId);

    const newUser = await prisma.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(newUser).not.toBeNull();
  });
});
