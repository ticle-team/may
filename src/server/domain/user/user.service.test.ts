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
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';

describe('given UserService with real UserStore', () => {
  let userService: UserService;
  let prisma: PrismaService;
  let stoaCloudService: StoaCloudService;

  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    await prisma.$connect();
    stoaCloudService = Container.get(StoaCloudService);
    userService = Container.get(UserService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
    await stoaCloudService.resetSchema();
  });

  it('when getting new user, then should create new user', async () => {
    await using stack = new AsyncDisposableStack();
    const session = await createUser();
    stack.defer(async () => {
      await deleteUser(session);
    });
    const ctx = {
      session: session,
      tx: prisma,
      githubToken: null,
    };

    const existingUser = await prisma.user.findUnique({
      where: {
        ownerId: session.user.id,
      },
    });
    expect(existingUser).toBeNull();

    const user = await userService.getUser(ctx);
    expect(user.ownerId).toBe(session.user.id);

    const newUser = await prisma.user.findUnique({
      where: {
        ownerId: session.user.id,
      },
    });
    expect(newUser).not.toBeNull();
  });
});
