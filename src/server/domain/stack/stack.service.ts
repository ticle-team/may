import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { PrismaService } from '@/server/common/prisma.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';

@Service()
export class StackService {
  constructor(
    private readonly stoacloudService: StoaCloudService,
    private readonly prisma: PrismaService,
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

    const { name, description, dependencies } = JSON.parse(args);
    const { id: stackId } = await this.stoacloudService.createStack(
      'http://localhost:3000', // TODO: change real site url
      projectId,
      name,
      description,
    );

    for (const { id: vapiId } of dependencies) {
      await this.stoacloudService.installVapi(stackId, {
        vapiId,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.thread.update({
        where: {
          id: threadId,
        },
        data: {
          shapleStackId: stackId,
        },
      });
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
