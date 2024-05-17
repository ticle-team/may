import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { PrismaService } from '@/server/common/prisma.service';
import {
  createOpenAIAssistantMock,
  OpenAIAssistantMock,
} from '@/server/common/__mocks__/openai.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { Thread, ThreadDeleted } from 'openai/resources/beta';
import { Message } from 'openai/resources/beta/threads';
import { resetSchema } from '@/migrate';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { UserStore } from '../../user/user.store';

describe('given ThreadService with real ThreadStore', () => {
  const ownerId = '123123';
  let mockOpenAI: OpenAIAssistantMock;
  beforeEach(async () => {
    mockOpenAI = createOpenAIAssistantMock();
    Container.set(OpenAIAssistant, mockOpenAI);

    const prisma = Container.get(PrismaService);
  });

  afterEach(async () => {
    const prisma = Container.get(PrismaService);
    await prisma.user.deleteMany({});
    await prisma.thread.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('create thread', async () => {
    const openaiThreadId = '123123';
    mockOpenAI.createThread.mockResolvedValue({ id: openaiThreadId } as Thread);
    mockOpenAI.deleteThread.mockResolvedValue({
      deleted: true,
    } as ThreadDeleted);
    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(ownerId);
    expect(thread.openaiThreadId).toBe(openaiThreadId);
    await threadService.delete(thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });

  it('send message', async () => {
    const openaiThreadId = '123123';
    const messageId = 'message-1';
    mockOpenAI.createThread.mockResolvedValue({ id: openaiThreadId } as Thread);
    mockOpenAI.createMessage.mockResolvedValue({ id: messageId } as Message);
    mockOpenAI.deleteThread.mockResolvedValue({
      deleted: true,
    } as ThreadDeleted);

    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(ownerId);
    expect(thread.openaiThreadId).toBe(openaiThreadId);
    await threadService.addUserMessage(thread.id, '안녕하세요');

    await threadService.delete(thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.createMessage).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });
});

describe('given ThreadStore', () => {
  beforeEach(async () => {
    await resetSchema();
  });

  afterEach(() => {
    Container.reset();
  });

  it('when creating thread, then ok', async () => {
    const threadStore = Container.get(ThreadStore);
    const prisma = Container.get(PrismaService);
    const userStore = Container.get(UserStore);
    const user = await userStore.getUser(prisma, '123123');
    const thread = await threadStore.createThread(
      prisma,
      user.id,
      'openai-thread-id',
      1,
    );
    expect(thread.id).toBeGreaterThan(0);
  });
});
