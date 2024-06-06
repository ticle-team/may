import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { getLogger } from '@/logger';
import { StackService } from '@/server/domain/stack/stack.service';
import { TextDeltaBlock } from 'openai/resources/beta/threads/messages';
import { TRPCError } from '@trpc/server';
import { StackCreationEvent } from '@/models/assistant';
import { ThreadService } from '@/server/domain/thread/thread.service';

const logger = getLogger('AssistantService');

@Service()
export class AssistantService {
  private readonly stackCreationAssistantId =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID || '';

  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadService: ThreadService,
    private readonly stackService: StackService,
  ) {}

  async *runForCreationStack(threadId: number) {
    yield { event: 'begin' };
    const thread = await this.threadService.get(threadId);
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
            case 'thread.run.requires_action':
              const { id: runId, required_action } = data;
              for (const {
                id: toolCallId,
                type,
                function: { arguments: funcArguments, name: funcName },
              } of required_action?.submit_tool_outputs?.tool_calls ?? []) {
                if (type != 'function') {
                  continue;
                }

                switch (funcName) {
                  case 'deploy_stack': {
                    if (!thread.shapleProjectId) {
                      throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Project ID is required for stack deployment',
                      });
                    }
                    const { stackId, generator } =
                      await self.stackService.createStackByToolCall(
                        toolCallId,
                        runId,
                        threadId,
                        funcArguments,
                        thread.shapleProjectId,
                      );

                    thread.shapleStackId = stackId;
                    await self.threadService.save(thread);
                    yield* handleStream(generator);
                    yield { event: 'deploy', stackId };
                    break;
                  }
                  case 'create_vapis': {
                    const generator =
                      self.openaiAssistant.submitToolOutputsStream(
                        thread.openaiThreadId,
                        runId,
                        toolCallId,
                        JSON.stringify({
                          success: false,
                          message: 'Not implemented yet',
                        }),
                      );
                    yield* handleStream(generator);
                    break;
                  }
                }
              }
              break;
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
    yield { event: 'end' };
  }
}
