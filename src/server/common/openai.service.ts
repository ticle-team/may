import { Service } from 'typedi';
import { OpenAI } from 'openai';

export function createOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
}

@Service()
export class OpenAIAssistant {
  private readonly openai = createOpenAI();

  getAssistant(assistantId: string) {
    return this.openai.beta.assistants.retrieve(assistantId);
  }

  createThread() {
    return this.openai.beta.threads.create();
  }

  deleteThread(id: string) {
    return this.openai.beta.threads.del(id);
  }

  createMessage(threadId: string, message: string) {
    return this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  }

  deleteMessage(threadId: string, messageId: string) {
    return this.openai.beta.threads.messages.del(threadId, messageId);
  }

  async getMessages(threadId: string, before?: string) {
    const resp = await this.openai.beta.threads.messages.list(threadId, {
      before,
    });

    return {
      messages: resp.data,
      after: resp.nextPageParams()?.after ?? null,
    };
  }

  runStream(threadId: string, assistantId: string) {
    return this.openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });
  }

  run(threadId: string, assistantId: string) {
    return this.openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
  }
}
