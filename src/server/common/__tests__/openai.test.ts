import { loadEnvConfig } from '@next/env';
import { Container } from 'typedi';
import { createOpenAI, OpenAIAssistant } from '@/server/common/openai.service';

const { combinedEnv: appEnv } = loadEnvConfig(process.cwd(), true);
process.env = { ...process.env, ...appEnv };
describe('openai', () => {
  const stackCreationAssistantID =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID || '';

  afterEach(() => {
    Container.reset();
  });

  it('getAssistant', async () => {
    const openai = Container.get(OpenAIAssistant);
    const resp = await openai.getAssistant(stackCreationAssistantID);

    expect(resp.id).toBe(stackCreationAssistantID);
  });

  it('runs', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(thread.id, '안녕하세요');
    expect(message.id).not.toBe('');

    const run = await openai.run(thread.id, assistant.id);
    expect(
      run.status,
      `lastError: ${run.last_error?.message}, code: ${run.last_error?.code}`,
    ).toBe('completed');

    const messages = await openai.getMessages(thread.id);
    const lastMessage = messages.data[-1];
    expect(lastMessage.role).toBe('assistant');
    console.log(lastMessage.content);

    // const stream = openai.runStream(thread.id, assistant.id);
    // const answer = await new Promise((resolve) => {
    //   const answers: string[] = [];
    //   stream.on('textCreated', ({ value }) => {
    //     console.log(value);
    //     answers.push(value);
    //   });
    //   stream.on('textDelta', ({ value }) => {
    //     console.log(value);
    //     if (value !== undefined && value !== '') {
    //       answers.push(value);
    //     }
    //   });
    //   stream.on('textDone', () => {
    //     const answer = answers.join('');
    //     resolve(answer);
    //   });
    // });

    // expect(answer).not.toBe('');

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);
});

describe('openai api', () => {
  const openai = createOpenAI();

  it('assistant run simple', async () => {
    const assistantId =
      process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID || '';
    expect(assistantId).not.toBe('');
    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: '안녕하세요.',
    });

    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    while (run.status != 'completed' && run.status != 'failed') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (run.status == 'failed') {
      console.log('last error: ', run.last_error);
    }

    expect(run.status).toBe('completed');

    await openai.beta.threads.messages.del(thread.id, message.id);
    await openai.beta.threads.del(thread.id);
  });
});
