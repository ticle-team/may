import { Service } from 'typedi';
import { OpenAI } from 'openai';
import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { ChatMessage } from '@/models/ai';
import { TextContentBlock } from 'openai/resources/beta/threads';
import { TRPCError } from '@trpc/server';

@Service()
export class OpenAIAssistant {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });

  getAssistant(assistantId: string) {
    return this.openai.beta.assistants.retrieve(assistantId);
  }

  async createThread() {
    try {
      const { id } = await this.openai.beta.threads.create();
      return {
        id,
      };
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create openai thread',
      });
    }
  }

  async deleteThread(id: string) {
    const { deleted } = await this.openai.beta.threads.del(id);
    return {
      deleted,
    };
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
      order: 'desc',
    });

    let messages = resp.data.map<ChatMessage>(({ id, role, content }) => {
      const text = content
        .filter(({ type }) => type === 'text')
        .map((t) => (t as TextContentBlock).text.value)
        .join('');
      return { id, role, text };
    });

    return {
      messages: messages,
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

  async cancel(threadId: string) {
    const { data } = await this.openai.beta.threads.runs.list(threadId, {
      order: 'desc',
    });
    if (data.length == 0) {
      return;
    }

    for (const { id, status } of data) {
      if (
        status != 'in_progress' &&
        status != 'requires_action' &&
        status != 'queued'
      ) {
        continue;
      }

      return this.openai.beta.threads.runs.cancel(threadId, id).catch(() => {});
    }
  }

  async *submitToolOutputsStream(
    threadId: string,
    runId: string,
    toolCallId: string,
    output: string,
  ): AsyncGenerator<OpenAI.Beta.AssistantStreamEvent> {
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
    process.env.AZURE_OPENAI_ENDPOINT || '',
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
