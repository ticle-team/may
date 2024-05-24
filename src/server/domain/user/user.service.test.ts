import { resetSchema } from '@/migrate';
import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { UserService } from '@/server/domain/user/user.service';
import exp from 'node:constants';

describe('given UserService with real UserStore', () => {
  const ownerId = '123123';
  const userService = Container.get(UserService);
  const prismaService = Container.get(PrismaService);

  beforeEach(async () => {
    await resetSchema();
  });

  afterEach(async () => {
    const prisma = Container.get(PrismaService);
    await prisma.user.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('when getting new user, then should create new user', async () => {
    const existingUser = await prismaService.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(existingUser).toBeNull();

    const user = await userService.getUser(ownerId);
    expect(user.ownerId).toBe(ownerId);
    expect(user.nickname).toBeNull();
    expect(user.description).toBeNull();
    expect(user.memberships).toHaveLength(0);

    const newUser = await prismaService.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(newUser).not.toBeNull();
  });
});
