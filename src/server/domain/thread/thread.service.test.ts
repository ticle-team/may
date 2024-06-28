import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import {
  createOpenAIAssistantMock,
  OpenAIAssistantMock,
} from '@/server/common/__mocks__/openai.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { resetSchema } from '@/migrate';
import { User } from '@shaple/shaple';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@/server/common/prisma.service';

describe('given ThreadService with real ThreadStore', () => {
  const ownerId = '123123';
  let mockOpenAI: OpenAIAssistantMock;
  let prisma: PrismaClient;
  beforeEach(async () => {
    await resetSchema();
    prisma = Container.get(PrismaService);
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
      user: {
        id: ownerId,
      } as User,
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
    const thread = await threadService.create(ctx, project.id);
    await threadService.delete(ctx, thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });

  it('send message', async () => {
    const ctx = {
      user: {
        id: ownerId,
      } as User,
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
    const thread = await threadService.create(ctx, project.id);
    await threadService.addUserMessage(ctx, thread.id, '안녕하세요');

    await threadService.delete(ctx, thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.createMessage).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });
});
