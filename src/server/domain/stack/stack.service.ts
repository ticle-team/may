import { Service } from 'typedi';
import { CompletionService } from '@/server/domain/completion/completion.service';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { PrismaService } from '@/server/common/prisma.service';
import { StackStore } from '@/server/domain/stack/stack.store';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';

@Service()
export class StackService {
  constructor(
    private readonly completionService: CompletionService,
    private readonly stoacloudService: StoaCloudService,
    private readonly prisma: PrismaService,
    private readonly stackStore: StackStore,
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
  ) {}

  async createStackByToolCall(
    toolCallId: string,
    runId: string,
    threadId: number,
    args: string,
    projectId: number,
  ) {
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);
    const { messages } = await this.openaiAssistant.getTextMessages(
      openaiThreadId,
      {
        limit: 20,
      },
    );
    const readmeText = await this.completionService.createReadmeForStack(
      messages,
      args,
    );
    const { name, description, dependencies } = JSON.parse(args);
    const { id } = await this.stoacloudService.createStack(
      '',
      projectId,
      name,
      description,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.stackStore.createStack(tx, threadId, id);
      return this.openaiAssistant.submitToolOutputsStream(
        openaiThreadId,
        runId,
        toolCallId,
        JSON.stringify({
          status: 'ok',
          description: 'Stack created successfully',
        }),
      );
    });
  }
}
