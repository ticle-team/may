import { setTimeout } from 'timers/promises';
import { Container } from 'typedi';
import { createThreadServiceMock } from '@/server/domain/thread/__mocks__/thread.service';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { AssistantService } from '@/server/domain/assistant/assistant.service';
import { createAssistantServiceMock } from '@/server/domain/assistant/__mocks__/assistant.service';
import { createCaller } from '@/server';
import { createClient } from '@shaple/shaple';
import { resetSchema } from '@/migrate';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { StackCreationEventText } from '@/models/assistant';
import { PrismaService } from '@/server/common/prisma.service';
import { PrismaClient } from '@prisma/client';
import { Context } from '@/server/context';

describe('given thread trpc with mock objects', () => {
  const threadService = createThreadServiceMock();
  const assistantService = createAssistantServiceMock();

  const shaple = createClient(
    process.env.NEXT_PUBLIC_SHAPLE_URL ?? '',
    process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY ?? '',
  );

  let caller: ReturnType<typeof createCaller>;
  let session;
  let prisma: PrismaClient;
  let ctx: Context;
  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
    await prisma.$connect();
    await Container.get(StoaCloudService).resetSchema();

    Container.set(ThreadService, threadService);
    Container.set(AssistantService, assistantService);

    session = await createUser();

    ctx = {
      tx: prisma,
      session: session,
      githubToken: null,
    };
    caller = createCaller(ctx);
  });

  afterEach(async () => {
    Container.reset();
    await deleteUser(session!);
    jest.clearAllMocks();
    await prisma.$disconnect();
  });

  it('when calling thread as a subscription, should return messages streaming', async () => {
    const threadId = 2;
    const projectId = 1;
    assistantService.runForCreationStack.mockImplementationOnce(
      async function* () {
        yield { id: '', event: 'text', text: 'h' };
        await setTimeout(100);
        yield { id: '', event: 'text', text: 'e' };
        await setTimeout(100);
        yield { id: '', event: 'text', text: 'l' };
        await setTimeout(100);
        yield { id: '', event: 'text', text: 'l' };
        await setTimeout(100);
        yield { id: '', event: 'text', text: 'o' };
        await setTimeout(100);
        yield { id: '', event: 'text.done' };
      },
    );

    const outputs = await caller.thread.runForStackCreation({
      threadId: threadId,
    });

    let completed = false;
    const answers = [] as string[];
    for await (const ev of outputs) {
      switch (ev.event) {
        case 'text':
          const { text } = ev as StackCreationEventText;
          answers.push(text);
          break;
        case 'text.done':
          completed = true;
          break;
      }
    }

    outputs.return();

    expect(completed).toBe(true);
    expect(answers).toEqual(['h', 'e', 'l', 'l', 'o']);

    expect(assistantService.runForCreationStack).toHaveBeenCalledWith(
      ctx,
      threadId,
    );
  });
});
