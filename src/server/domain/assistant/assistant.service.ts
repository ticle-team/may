import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { getLogger } from '@/logger';
import { StackService } from '@/server/domain/stack/stack.service';
import { TextDeltaBlock } from 'openai/resources/beta/threads/messages';
import { TRPCError } from '@trpc/server';
import { StackCreationEvent } from '@/models/assistant';
import { Context } from '@/server/context';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import {
  CreatingStackStateInfoJson,
  installStackArgs,
  threadStates,
} from '@/models/thread';
import { snakeToCamel } from '@/util/cases';
import { CompletionService } from '@/server/domain/assistant/completion.service';

const logger = getLogger('AssistantService');

@Service()
export class AssistantService {
  private readonly stackCreationAssistantId =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID || '';

  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly completionService: CompletionService,
    private readonly threadStore: ThreadStore,
    private readonly stackService: StackService,
  ) {}

  async *runForCreationStack(ctx: Context, threadId: number) {
    yield { event: 'begin' };
    const thread = await this.threadStore.findThreadById(ctx, threadId);
    const assistantStream = this.openaiAssistant.runStream(
      thread.openaiThreadId,
      this.stackCreationAssistantId,
    );

    const self = this;

    async function* handleStream(
      stream: typeof assistantStream,
    ): AsyncGenerator<StackCreationEvent, void> {
      try {
        for await (const { event, data } of stream) {
          switch (event) {
            case 'thread.message.created':
              yield { id: data.id, event: 'text.created' };
              break;
            case 'thread.message.delta':
              const text =
                data.delta.content
                  ?.filter((block) => block.type == 'text')
                  .map((block) => (block as TextDeltaBlock).text?.value ?? '')
                  .join('') ?? '';
              if (text == '') {
                continue;
              }

              yield { id: data.id, event: 'text', text: text };
              break;
            case 'thread.message.completed':
              yield { id: data.id, event: 'text.done' };
              break;
            case 'thread.run.requires_action': {
              const { id: runId, required_action } = data;
              const toolOutputs: { toolCallId: string; output: string }[] = [];
              for (const {
                id: toolCallId,
                type,
                function: { arguments: funcArgs, name: funcName },
              } of required_action?.submit_tool_outputs?.tool_calls ?? []) {
                if (type != 'function') {
                  continue;
                }

                const args = snakeToCamel(JSON.parse(funcArgs));
                let output: Record<string, any> = {};

                switch (funcName) {
                  case 'deploy_stack': {
                    if (!thread.shapleProjectId) {
                      throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Project ID is required for stack deployment',
                      });
                    }
                    logger.debug('call deploy_stack', { args });

                    const {
                      data: stackInfo,
                      error,
                      success,
                    } = installStackArgs.safeParse(args);
                    if (!success) {
                      logger.error('failed to parse installStackArgs', {
                        error,
                      });
                      output = {
                        success: false,
                        message: 'failed to parse arguments',
                      };
                      break;
                    }

                    const { stackId, output: deployStackOutput } =
                      await self.stackService.createStackByToolCall(
                        ctx,
                        thread.shapleProjectId,
                        stackInfo.name,
                        stackInfo.description,
                        stackInfo.dependencies.baseApis,
                        stackInfo.dependencies.vapis,
                      );
                    output = deployStackOutput;
                    if (stackId == 0) {
                      break;
                    }

                    const stateInfo: CreatingStackStateInfoJson = {
                      current_step: 6,
                      name: stackInfo.name,
                      description: stackInfo.description,
                      dependencies: {
                        vapis: stackInfo.dependencies.vapis,
                        base_apis: stackInfo.dependencies.baseApis,
                      },
                    };

                    await self.threadStore.updateThread(ctx, thread.id, {
                      shapleStackId: stackId,
                      stateInfo,
                      state: threadStates.stackCreated,
                    });
                    break;
                  }
                  case 'create_vapis': {
                    output = {
                      success: false,
                      message: 'Not implemented yet',
                    };
                    break;
                  }
                  default: {
                    logger.error('Unknown tool call', { funcName });
                    output = {
                      success: false,
                      message: `${funcName} is not existed function.`,
                    };
                    break;
                  }
                }

                toolOutputs.push({
                  toolCallId,
                  output: JSON.stringify(output),
                });
              }
              logger.debug('submit tool outputs', { toolOutputs });

              const generator = self.openaiAssistant.submitToolOutputsStream(
                thread.openaiThreadId,
                runId,
                toolOutputs,
              );
              yield* handleStream(generator);
              break;
            }
            case 'error':
              yield {
                event: 'error',
                error: new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: data.message ?? 'Error while processing event',
                }),
              };
          }
        }
      } finally {
        await stream.return();
      }
    }

    yield* handleStream(assistantStream);

    const { state } = await this.threadStore.findThreadById(ctx, thread.id);
    if (state == threadStates.stackCreating) {
      const stateInfoJson =
        await this.completionService.generateCreatingStackStateInfo(
          thread.openaiThreadId,
        );
      logger.debug('update thread stateInfo', { stateInfoJson });
      await this.threadStore.updateThread(ctx, thread.id, {
        stateInfo: stateInfoJson,
      });
    }

    yield { event: 'end' };
  }
}
