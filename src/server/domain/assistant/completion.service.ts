import { OpenAIAssistant, OpenAIChat } from '@/server/common/openai.service';
import { Service } from 'typedi';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import {
  CreatingStackStateInfoJson,
  creatingStackStateInfoJson,
} from '@/models/thread';
import { RunnableSequence } from '@langchain/core/runnables';
import { SystemMessage } from '@langchain/core/messages';
import { getLogger } from '@/logger';
import { getGenerateStackCreatingStateInfoPrompt } from '@/server/domain/assistant/prompts';

const logger = getLogger('CompletionService');

@Service()
export class CompletionService {
  constructor(
    private readonly openaiChat: OpenAIChat,
    private readonly openaiAssistant: OpenAIAssistant,
  ) {}

  async generateCreatingStackStateInfo(
    openaiThreadId: string,
  ): Promise<CreatingStackStateInfoJson> {
    const { messages } = await this.openaiAssistant.getTextMessages(
      openaiThreadId,
      {
        limit: 30,
      },
    );
    const context = messages
      .map((c) => {
        return `${c.role}: ${JSON.stringify(c.text)}`;
      })
      .toReversed()
      .join('\n');
    logger.debug(`context: ${context}`);
    const promptTemplateText = getGenerateStackCreatingStateInfoPrompt(context);
    const outputParser = StructuredOutputParser.fromZodSchema(
      creatingStackStateInfoJson,
    );
    const chain = RunnableSequence.from([this.openaiChat, outputParser]);

    return await chain
      .withRetry({
        stopAfterAttempt: 3,
      })
      .invoke([new SystemMessage(promptTemplateText)]);
  }
}
