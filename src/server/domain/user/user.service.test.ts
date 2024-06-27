import { resetSchema } from '@/migrate';
import { Container } from 'typedi';
import { UserService } from '@/server/domain/user/user.service';
import { createPrismaClient } from '@/server/prisma';

describe('given UserService with real UserStore', () => {
  const ownerId = '123123';
  const userService = Container.get(UserService);
  const prisma = createPrismaClient();

  beforeEach(async () => {
    await resetSchema();
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('when getting new user, then should create new user', async () => {
    const ctx = {
      user: null,
      tx: prisma,
    };
    const existingUser = await prisma.user.findUnique({
      where: {
        ownerId: ownerId,
      },
    });
    expect(existingUser).toBeNull();

    const user = await userService.getUser(ctx, ownerId);
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
