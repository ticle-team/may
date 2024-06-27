import { Container } from 'typedi';
import { resetSchema } from '@/migrate';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { UserStore } from '@/server/domain/user/user.store';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { createPrismaClient } from '@/server/prisma';

describe('given ThreadStore', () => {
  let prisma = createPrismaClient();
  beforeEach(async () => {
    await resetSchema();
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
    );
    expect(thread.id).toBeGreaterThan(0);
  });
});
