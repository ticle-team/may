import { Service } from 'typedi';
import { OpenAIAssistant } from '@/server/common/openai.service';
import EventEmitter from 'node:events';
import { Text, TextDelta } from 'openai/resources/beta/threads/messages';
import { AssistantStream } from 'openai/lib/AssistantStream';
import { ThreadStore } from '@/server/domain/thread/thread.store';

export interface StackCreationEvents {
  text: [string];
  done: [];
}

export class StackCreationStream extends EventEmitter<StackCreationEvents> {
  private closed = false;

  public constructor(private stream: AssistantStream) {
    super();
    this.registerHandlers();
  }

  private registerHandlers() {
    this.stream
      .on('textCreated', this.handleTextCreated)
      .on('textDelta', this.handleTextDelta)
      .on('textDone', this.handleTextDone);
  }

  close() {
    if (this.closed) {
      return;
    }

    this.stream.off('textCreated', this.handleTextCreated);
    this.stream.off('textDelta', this.handleTextDelta);
    this.stream.off('textDone', this.handleTextDone);
    this.closed = true;
  }

  private handleTextCreated({ value }: Text) {
    if (value == '') {
      return;
    }
    this.emit('text', value);
  }

  private handleTextDelta({ value }: TextDelta) {
    if (!value || value == '') {
      return;
    }
    this.emit('text', value);
  }

  private handleTextDone() {
    this.close();
    this.emit('done');
  }
}

@Service()
export class AssistantService {
  private readonly stackCreationAssistantId =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID!;

  constructor(
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
  ) {}

  async createStack(threadId: number) {
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);
    const stream = this.openaiAssistant.runStream(
      openaiThreadId,
      this.stackCreationAssistantId,
    );
    return new StackCreationStream(stream);
  }
}
