import { Container } from 'typedi';
import { resetSchema } from '@/migrate';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { UserStore } from '@/server/domain/user/user.store';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { PrismaService } from '@/server/common/prisma.service';
import { PrismaClient } from '@prisma/client';
import { Context } from '@/server/context';
import { UserService } from '@/server/domain/user/user.service';
import { Session } from '@shaple/shaple';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';

describe('given ThreadStore', () => {
  let prisma: PrismaClient;
  let session: Session;
  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    await prisma.$connect();
    session = await createUser();
  });

  afterEach(async () => {
    await prisma.$disconnect();
    await Container.get(StoaCloudService).resetSchema();
    Container.reset();
    await deleteUser(session);
  });

  it('when creating thread, then ok', async () => {
    const ctx = {
      session: session,
      tx: prisma,
    } as Context;
    const threadStore = Container.get(ThreadStore);
    const userService = Container.get(UserService);

    const user = await userService.getUser(ctx);
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
