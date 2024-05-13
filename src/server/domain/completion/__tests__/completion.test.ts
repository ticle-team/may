import {
  createThreadServiceMock,
  ThreadServiceMock,
} from '@/server/domain/thread/__mocks__/thread.service';
import {
  createOpenAICompletionsMock,
  OpenAICompletionsMock,
} from '@/server/common/__mocks__/openai.service';
import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { OpenAICompletions } from '@/server/common/openai.service';
import { ChatMessage } from '@/models/ai';
import { CompletionService } from '@/server/domain/completion/completion.service';

describe('given completion service', () => {
  let threadService: ThreadServiceMock;
  let com: OpenAICompletionsMock;

  beforeEach(() => {
    threadService = createThreadServiceMock();
    com = createOpenAICompletionsMock();

    Container.set(ThreadService, threadService);
    Container.set(OpenAICompletions, com);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('when create readme for stack, then readme is created', async () => {
    const history: ChatMessage[] = [
      { role: 'user', text: 'hello.' },
      {
        role: 'assistant',
        text: 'what is your name?',
      },
      {
        role: 'user',
        text: 'my name is bob.',
      },
    ];
    threadService.getTextMessages.mockResolvedValueOnce({
      messages: history,
      after: undefined,
    });
    com.chat.mockResolvedValueOnce({
      id: '1',
      created: new Date(),
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'hello bob.',
          },
          logprobs: null,
          index: 0,
          finishReason: 'stop',
        },
      ],
    });

    const completionService = Container.get(CompletionService);
    const answer = await completionService.createReadmeForStack(
      1,
      `{
stackName: "NewSNS",
baseAPIs: ["Auth", "Storage"],
vapis: [
    "User Management",
    "Feed Management",
    "Follow Management",
    "Like Management for Feed",
    "Comment Management for Feed",
    "Report Management for Feed"
  ]
}`,
    );
    expect(answer).toBe('hello bob.');

    expect(com.chat).toHaveBeenCalled();
    expect(threadService.getTextMessages).toHaveBeenCalledWith(1, undefined);
  });
});
