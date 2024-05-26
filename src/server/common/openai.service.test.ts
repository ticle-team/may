import { loadEnvConfig } from '@next/env';
import { Container } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { TextDeltaBlock } from 'openai/src/resources/beta/threads/messages';
import { getLogger } from '@/logger';

const logger = getLogger('openai.service.test.ts');

process.env = {
  ...process.env,
  ...loadEnvConfig(process.cwd(), true).combinedEnv,
};
describe('given openai assistant', () => {
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

    const { messages } = await openai.getTextMessages(thread.id);
    const lastMessage = messages[0];
    expect(lastMessage.role).toBe('assistant');
    expect(lastMessage.text).not.toBe('');
    console.log(lastMessage.text);

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);

  it.skip('when stack creation through assistant and run stream with cancel, then answer is ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(thread.id, '안녕하세요');
    expect(message.id).not.toBe('');

    const stream = await openai.runStream(thread.id, assistant.id);
    const answers: string[] = [];
    let num = 0;
    for await (const { event, data } of stream) {
      switch (event) {
        case 'thread.message.created':
          console.log('text created');
          break;
        case 'thread.message.delta':
          const content = data.delta.content;
          expect(content).toBeDefined();

          for (const block of content!) {
            if (block.type !== 'text') {
              continue;
            }

            const { text } = block as TextDeltaBlock;
            console.log('text: ', text?.value);
            answers.push(text?.value ?? '');
          }
          num += 1;
          if (num == 2) {
            await stream.return();
          }
          break;
        case 'thread.message.completed':
          console.log('text done');
          break;
        case 'error':
          console.error(data);
          break;
      }
    }
    const answer = answers.join('');

    expect(answer).not.toBe('');

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);

  it.skip('when thread cancel when creating message, then ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(
      thread.id,
      'SNS 서비스를 만들어주고 기획서를 최대한 자세하게 작성해줘.',
    );
    expect(message.id).not.toBe('');

    const stream = await openai.runStream(thread.id, assistant.id);
    const answers: string[] = [];
    let cancelled = false;
    let num = 0;
    for await (const { event, data } of stream) {
      switch (event) {
        case 'thread.message.created':
          console.log('text created');
          break;
        case 'thread.message.delta':
          const content = data.delta.content;
          expect(content).toBeDefined();

          for (const block of content!) {
            if (block.type !== 'text') {
              continue;
            }

            const { text } = block as TextDeltaBlock;
            console.log('text: ', text?.value);
            answers.push(text?.value ?? '');
          }
          num += 1;
          if (num == 2) {
            await openai.cancel(thread.id);
          }
          break;
        case 'thread.message.completed':
          console.log('text done');
          break;
        case 'error':
          console.error(data);
          break;
        case 'thread.run.cancelled':
          cancelled = true;
          break;
      }
    }
    const answer = answers.join('');

    expect(answer).not.toBe('');
    expect(cancelled).toBe(true);

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  });
});
