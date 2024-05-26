import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { getLogger } from '@/logger';
import { StackService } from '@/server/domain/stack/stack.service';
import { TextDeltaBlock } from 'openai/src/resources/beta/threads/messages';
import { TRPCError } from '@trpc/server';
import { StackCreationEvent } from '@/models/assistant';

const logger = getLogger('AssistantService');

@Service()
export class AssistantService {
  private readonly stackCreationAssistantId =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID!;

  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
    private readonly stackService: StackService,
  ) {}

  async *runForCreationStack(threadId: number) {
    const { openaiThreadId, shapleProjectId } =
      await this.threadStore.findThreadById(threadId);
    const assistantStream = this.openaiAssistant.runStream(
      openaiThreadId,
      this.stackCreationAssistantId,
    );
    yield { event: 'start' };

    const self = this;
    async function* handleStream(
      stream: typeof assistantStream,
    ): AsyncGenerator<StackCreationEvent, void> {
      try {
        for await (const { event, data } of stream) {
          switch (event) {
            case 'thread.message.created':
              yield { event: 'created' };
              break;
            case 'thread.message.delta':
              const { content } = data.delta;
              if (!content) {
                continue;
              }
              const textPieces = [] as string[];
              for (const block of content) {
                if (block.type != 'text') {
                  continue;
                }

                textPieces.push((block as TextDeltaBlock).text?.value ?? '');
              }
              const text = textPieces.join('');
              if (text == '') {
                continue;
              }

              yield { event: 'text', text: text };
              break;
            case 'thread.message.completed':
              yield { event: 'done' };
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
                  case 'deploy_stack':
                    const generator = handleStream(
                      self.stackService.createStackByToolCall(
                        toolCallId,
                        runId,
                        threadId,
                        funcArguments,
                        shapleProjectId,
                      ),
                    );
                    yield { event: 'deploy' };
                    yield* generator;
                    break;
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
  }
}
