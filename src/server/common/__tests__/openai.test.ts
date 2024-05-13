import { loadEnvConfig } from '@next/env';
import { Container } from 'typedi';
import { createOpenAI, OpenAIAssistant } from '@/server/common/openai.service';

process.env = {
  ...process.env,
  ...loadEnvConfig(process.cwd(), true).combinedEnv,
};
describe('given openai client', () => {
  const stackCreationAssistantID =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID || '';

  afterEach(() => {
    Container.reset();
  });

  it('when stack creation, then ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const resp = await openai.getAssistant(stackCreationAssistantID);

    expect(resp.id).toBe(stackCreationAssistantID);
  });

  it.skip('when stack creation though assistant, then response is ok', async () => {
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

    const { messages } = await openai.getMessages(thread.id);
    const lastMessage = messages[0];
    expect(lastMessage.role).toBe('assistant');
    expect(lastMessage.content).not.toBe('');
    console.log(lastMessage.content);

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);

  it.skip('when stack creation through assistant and run stream, then answer is ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(thread.id, '안녕하세요');
    expect(message.id).not.toBe('');

    const stream = openai.runStream(thread.id, assistant.id);
    const answer = await new Promise((resolve) => {
      const answers: string[] = [];
      stream.on('textCreated', () => {
        console.log('text created');
      });
      stream.on('textDelta', ({ value }) => {
        console.log(value);
        if (value !== undefined && value !== '') {
          answers.push(value);
        }
      });
      stream.on('textDone', () => {
        const answer = answers.join('');
        resolve(answer);
      });
    });

    expect(answer).not.toBe('');
    console.log(answer);

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);
});
