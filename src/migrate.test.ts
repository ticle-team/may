import { resetSchema } from '@/migrate';
import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';

describe('given empty database', () => {
  it('when running migrations, should create tables', async () => {
    await resetSchema();

    const prisma = Container.get(PrismaService);
    await prisma.user.create({
      data: {
        ownerId: '1',
      },
    });
  });
});
