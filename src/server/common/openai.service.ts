import { Service } from 'typedi';
import { OpenAI } from 'openai';
import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { ChatMessage } from '@/models/ai';
import { TextContentBlock } from 'openai/resources/beta/threads';

@Service()
export class OpenAIAssistant {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  getAssistant(assistantId: string) {
    return this.openai.beta.assistants.retrieve(assistantId);
  }

  createThread() {
    return this.openai.beta.threads.create();
  }

  deleteThread(id: string) {
    return this.openai.beta.threads.del(id);
  }

  async createMessage(threadId: string, message: string) {
    const { id: messageId } = await this.openai.beta.threads.messages.create(
      threadId,
      {
        role: 'user',
        content: message,
      },
    );

    return {
      id: messageId,
    };
  }

  deleteMessage(threadId: string, messageId: string) {
    return this.openai.beta.threads.messages.del(threadId, messageId);
  }

  async getTextMessages(
    threadId: string,
    options?: {
      before?: string;
      limit?: number;
    },
  ) {
    const resp = await this.openai.beta.threads.messages.list(threadId, {
      before: options?.before,
      limit: options?.limit,
    });

    let messages = [];
    for (const { role, content } of resp.data) {
      const text = content
        .filter(({ type }) => type === 'text')
        .map((t) => (t as TextContentBlock).text.value)
        .join('');
      messages.push({ role, text });
    }

    return {
      messages: messages as ChatMessage[],
      after: resp.nextPageParams()?.after ?? undefined,
    };
  }

  async *runStream(threadId: string, assistantId: string) {
    const stream = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      stream: true,
    });

    try {
      for await (const t of stream) {
        yield t;
      }
    } finally {
      stream.controller.abort();
    }
  }

  run(threadId: string, assistantId: string) {
    return this.openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
  }

  async *submitToolOutputsStream(
    threadId: string,
    runId: string,
    toolCallId: string,
    output: string,
  ) {
    const stream = await this.openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      {
        tool_outputs: [
          {
            tool_call_id: toolCallId,
            output: output,
          },
        ],
        stream: true,
      },
    );

    try {
      for await (const t of stream) {
        yield t;
      }
    } finally {
      stream.controller.abort();
    }
  }
}

@Service()
export class OpenAICompletions {
  private readonly client = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT!,
    new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
  );

  chat(messages: ChatMessage[]) {
    return this.client.getChatCompletions(
      process.env.AZURE_OPENAI_CHAT_COMPLETION_DEPLOYMENT_NAME!,
      messages.map(({ role, text }) => ({
        role,
        content: text,
      })),
    );
  }
}
