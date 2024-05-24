import { Container } from 'typedi';
import { createThreadServiceMock } from '@/server/domain/thread/__mocks__/thread.service';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { AssistantService } from '@/server/domain/assistant/assistant.service';
import { createAssistantServiceMock } from '@/server/domain/assistant/__mocks__/assistant.service';
import { createCaller } from '@/server';
import delay from 'delay';
import { createClient } from '@shaple/shaple';
import { resetSchema } from '@/migrate';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';
import { StoaCloudService } from '@/server/common/stoacloud.service';

describe('given thread trpc with mock objects', () => {
  const threadService = createThreadServiceMock();
  const assistantService = createAssistantServiceMock();

  const shaple = createClient(
    process.env.NEXT_PUBLIC_SHAPLE_URL ?? '',
    process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY ?? '',
  );

  let caller: ReturnType<typeof createCaller>;
  let user;
  beforeEach(async () => {
    await resetSchema();
    await Container.get(StoaCloudService).resetSchema();

    Container.set(ThreadService, threadService);
    Container.set(AssistantService, assistantService);

    user = await createUser();

    caller = createCaller({
      user,
    });
  });

  afterEach(async () => {
    Container.reset();
    await deleteUser(user!);
    jest.clearAllMocks();
  });

  it('when calling thread as a subscription, should return messages streaming', async () => {
    const threadId = 2;
    const projectId = 1;
    assistantService.runForCreationStack.mockImplementationOnce(
      async function* () {
        yield { event: 'text', text: 'h' };
        await delay(100);
        yield { event: 'text', text: 'e' };
        await delay(100);
        yield { event: 'text', text: 'l' };
        await delay(100);
        yield { event: 'text', text: 'l' };
        await delay(100);
        yield { event: 'text', text: 'o' };
        await delay(100);
        yield { event: 'done' };
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
          answers.push(ev.text);
          break;
        case 'done':
          completed = true;
          break;
      }
    }

    outputs.return();

    expect(completed).toBe(true);
    expect(answers).toEqual(['h', 'e', 'l', 'l', 'o']);

    expect(assistantService.runForCreationStack).toHaveBeenCalledWith(threadId);
  });
});
