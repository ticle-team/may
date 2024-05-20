import { Container } from 'typedi';
import { PrismaService } from '@/server/common/prisma.service';
import { resetSchema } from '@/migrate';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { UserStore } from '@/server/domain/user/user.store';

describe('given ThreadStore', () => {
  beforeEach(async () => {
    await resetSchema();
  });

  afterEach(() => {
    Container.reset();
  });

  it('when creating thread, then ok', async () => {
    const threadStore = Container.get(ThreadStore);
    const prisma = Container.get(PrismaService);
    const userStore = Container.get(UserStore);
    const user = await userStore.getUser(prisma, '123123');
    const thread = await threadStore.createThread(
      prisma,
      user.id,
      'openai-thread-id',
    );
    expect(thread.id).toBeGreaterThan(0);
  });
});
