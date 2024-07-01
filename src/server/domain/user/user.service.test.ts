import { resetSchema } from '@/migrate';
import { Container } from 'typedi';
import { UserService } from '@/server/domain/user/user.service';
import { PrismaService } from '@/server/common/prisma.service';
import { User } from '@shaple/shaple';

describe('given UserService with real UserStore', () => {
  const ownerId = '123123';
  const userService = Container.get(UserService);
  let prisma: PrismaService;

  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('when getting new user, then should create new user', async () => {
    const ctx = {
      user: {
        id: ownerId,
      } as User,
      tx: prisma,
    };
    const existingUser = await prisma.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(existingUser).toBeNull();

    const user = await userService.getUser(ctx);
    expect(user.ownerId).toBe(ownerId);
    expect(user.nickname).toBeNull();
    expect(user.description).toBeNull();
    expect(user.memberships).toHaveLength(0);

    const newUser = await prisma.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(newUser).not.toBeNull();
  });
});
