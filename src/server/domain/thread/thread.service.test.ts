import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import {
  createOpenAIAssistantMock,
  OpenAIAssistantMock,
} from '@/server/common/__mocks__/openai.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { resetSchema } from '@/migrate';
import { createPrismaClient } from '@/server/prisma';

describe('given ThreadService with real ThreadStore', () => {
  const ownerId = '123123';
  let mockOpenAI: OpenAIAssistantMock;
  let prisma = createPrismaClient();
  beforeEach(async () => {
    await resetSchema();
    await prisma.$connect();

    mockOpenAI = createOpenAIAssistantMock();
    Container.set(OpenAIAssistant, mockOpenAI);
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.thread.deleteMany({});
    await prisma.$disconnect();

    Container.reset();
  });

  it('create thread', async () => {
    const ctx = {
      user: null,
      tx: prisma,
    };
    const openaiThreadId = '123123';
    mockOpenAI.createThread.mockResolvedValue({ id: openaiThreadId });
    mockOpenAI.deleteThread.mockResolvedValue({
      deleted: true,
    });

    const project = await prisma.shapleProject.create({
      data: {},
    });

    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(ctx, ownerId, project.id);
    expect(thread.openaiThreadId).toBe(openaiThreadId);
    await threadService.delete(ctx, thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });

  it('send message', async () => {
    const ctx = {
      user: null,
      tx: prisma,
    };
    const openaiThreadId = '123123';
    const messageId = 'message-1';
    mockOpenAI.createThread.mockResolvedValue({ id: openaiThreadId });
    mockOpenAI.createMessage.mockResolvedValue({ id: messageId });
    mockOpenAI.deleteThread.mockResolvedValue({
      deleted: true,
    });

    const project = await prisma.shapleProject.create({
      data: {},
    });

    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(ctx, ownerId, project.id);
    expect(thread.openaiThreadId).toBe(openaiThreadId);
    await threadService.addUserMessage(ctx, thread.id, '안녕하세요');

    await threadService.delete(ctx, thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.createMessage).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });
});
