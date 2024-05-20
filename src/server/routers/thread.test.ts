import { Container } from 'typedi';
import { createThreadServiceMock } from '@/server/domain/thread/__mocks__/thread.service';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { AssistantService } from '@/server/domain/assistant/assistant.service';
import { createAssistantServiceMock } from '@/server/domain/assistant/__mocks__/assistant.service';
import { createCaller } from '@/server';
import delay from 'delay';
import { StackCreationEvent } from '@/models/assistant';
import { createClient } from '@shaple/shaple';
import { resetSchema } from '@/migrate';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';

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
    threadService.addUserMessage.mockResolvedValueOnce({
      id: '12',
    });
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

    const outputs = await caller.thread.messages.addForStackCreation({
      projectId: projectId,
      threadId: threadId,
      message: 'hello',
    });

    let completed = false;
    const answers = [] as string[];
    const subscription = outputs.subscribe({
      next(data: StackCreationEvent) {
        switch (data.event) {
          case 'text':
            answers.push(data.text);
            break;
          case 'done':
            completed = true;
            break;
          default:
            fail(`unexpected event: ${data.event}`);
        }
      },
      error(err) {
        throw err;
      },
      complete() {
        completed = true;
      },
    });

    for (let i = 0; i < 5; i++) {
      await delay(1000);
      if (completed) {
        break;
      }
    }
    subscription.unsubscribe();

    expect(completed).toBe(true);
    expect(answers).toEqual(['h', 'e', 'l', 'l', 'o']);

    expect(assistantService.runForCreationStack).toHaveBeenCalledWith(
      threadId,
      projectId,
    );
    expect(threadService.addUserMessage).toHaveBeenCalledWith(
      threadId,
      'hello',
    );
  });
});
