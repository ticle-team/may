import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { PrismaService } from '@/server/common/prisma.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { getLogger } from '@/logger';

const logger = getLogger('server.domain.stack.service');

@Service()
export class StackService {
  constructor(
    private readonly stoacloudService: StoaCloudService,
    private readonly prisma: PrismaService,
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
  ) {}

  async *createStackByToolCall(
    toolCallId: string,
    runId: string,
    threadId: number,
    args: string,
    projectId: number,
  ) {
    logger.debug('call createStackByToolCall', { args });
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);

    const { name, description, dependencies } = JSON.parse(args);

    let stackId: number;
    try {
      const data = await this.stoacloudService.createStack(
        'http://localhost:3000', // TODO: change real site url
        projectId,
        name,
        description,
      );
      stackId = data.id;
    } catch (err) {
      logger.error('failed to create stack', { e: err });
      yield* this.openaiAssistant.submitToolOutputsStream(
        openaiThreadId,
        runId,
        toolCallId,
        JSON.stringify({
          status: 'error',
          description: 'failed to create stack',
        }),
      );
      return;
    }

    // TODO: need to implement install vapis given by vapi name
    // try {
    //   for (const { id: vapiId } of dependencies) {
    //     await this.stoacloudService.installVapi(stackId, {
    //       vapiId,
    //     });
    //   }
    // } catch (e) {
    //   logger.error('failed to install dependencies', { e });
    //   this.stoacloudService.deleteStack(stackId).catch((err) => {
    //     logger.error('failed to delete stack', { err });
    //   });
    //   yield* this.openaiAssistant.submitToolOutputsStream(
    //     openaiThreadId,
    //     runId,
    //     toolCallId,
    //     JSON.stringify({
    //       status: 'error',
    //       description: 'failed to install dependencies',
    //     }),
    //   );
    //   return;
    // }

    let generator: ReturnType<OpenAIAssistant['submitToolOutputsStream']>;
    try {
      generator = await this.prisma.$transaction(async (tx) => {
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
    } catch (error) {
      logger.error('failed to update thread or submit tool', { error });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      yield* this.openaiAssistant.submitToolOutputsStream(
        openaiThreadId,
        runId,
        toolCallId,
        JSON.stringify({
          status: 'failed',
          description: 'failed to update thread',
        }),
      );
      return;
    }

    try {
      yield* generator;
    } catch (err) {
      logger.error('received error while generating', { err });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
    }
  }
}
