import { Container } from 'typedi';
import { resetSchema } from '@/migrate';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { UserStore } from '@/server/domain/user/user.store';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { PrismaService } from '@/server/common/prisma.service';
import { PrismaClient } from '@prisma/client';

describe('given ThreadStore', () => {
  let prisma: PrismaClient;
  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    await prisma.$connect();
    await Container.get(StoaCloudService).resetSchema();
  });

  afterEach(async () => {
    await prisma.$disconnect();
    Container.reset();
  });

  it('when creating thread, then ok', async () => {
    const ctx = {
      user: null,
      tx: prisma,
    };
    const threadStore = Container.get(ThreadStore);
    const userStore = Container.get(UserStore);

    const user = await userStore.getUser(ctx, '123123');
    const project = await prisma.shapleProject.create({
      data: {},
    });
    const thread = await threadStore.createThread(
      ctx,
      user.id,
      'openai-thread-id',
      project.id,
      'none',
    );
    expect(thread.id).toBeGreaterThan(0);
  });
});
