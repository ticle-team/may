import { Service } from 'typedi';
import {
  OpenAIAssistant,
  OpenAICompletions,
} from '@/server/common/openai.service';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { TRPCError } from '@trpc/server';
import { PromptService } from '@/server/domain/completion/prompt.service';
import { ChatMessage } from '@/models/ai';

@Service()
export class CompletionService {
  constructor(
    private readonly com: OpenAICompletions,
    private readonly promptService: PromptService,
  ) {}

  async createReadmeForStack(context: ChatMessage[], args: string) {
    if (context.length == 0) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to run deploy stack. history is empty',
      });
    }

    context = context.reverse();
    if (context[context.length - 1].role != 'user') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'Failed to run deploy stack. history does not end with user message',
      });
    }

    const prompt = this.promptService.makeForDeployStack(context, args);

    const { choices } = await this.com.chat([
      {
        role: 'system',
        text: prompt,
      },
      {
        role: 'user',
        text: 'start',
      },
    ]);

    return choices[0].message?.content ?? '';
  }
}
