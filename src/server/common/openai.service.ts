import { Service } from 'typedi';
import { AzureOpenAI, OpenAI } from 'openai';
import { ChatMessage } from '@/models/ai';
import { TextContentBlock } from 'openai/resources/beta/threads';
import { TRPCError } from '@trpc/server';
import { ChatOpenAI } from '@langchain/openai';
import { AzureChatOpenAI } from '@langchain/azure-openai';

@Service()
export class OpenAIAssistant {
  private readonly openai = new AzureOpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://api.openai.com',
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
      limit: 5,
    });
    if (data.length == 0) {
      return;
    }

    const run = data.filter(({ status }) => {
      return (
        status == 'in_progress' ||
        status == 'queued' ||
        status == 'requires_action'
      );
    })[0];
    if (!run) {
      return;
    }
    await this.openai.beta.threads.runs
      .cancel(threadId, run.id)
      .catch(() => {});
  }

  async *submitToolOutputsStream(
    threadId: string,
    runId: string,
    toolOutputs: {
      toolCallId: string;
      output: string;
    }[],
  ): AsyncGenerator<OpenAI.Beta.AssistantStreamEvent> {
    const stream = await this.openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      {
        tool_outputs: toolOutputs.map(({ toolCallId, output }) => ({
          tool_call_id: toolCallId,
          output: output,
        })),
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

function createChatOpenAI() {
  return new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureOpenAIApiDeploymentName:
      process.env.AZURE_OPENAI_CHAT_COMPLETION_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: '2024-05-13',
  });
}

@Service({ factory: createChatOpenAI })
export class OpenAIChat extends ChatOpenAI {}
