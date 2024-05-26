import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import { PrismaService } from '@/server/common/prisma.service';
import {
  createOpenAIAssistantMock,
  OpenAIAssistantMock,
} from '@/server/common/__mocks__/openai.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { resetSchema } from '@/migrate';

describe('given ThreadService with real ThreadStore', () => {
  const ownerId = '123123';
  let mockOpenAI: OpenAIAssistantMock;
  beforeEach(async () => {
    await resetSchema();

    mockOpenAI = createOpenAIAssistantMock();
    Container.set(OpenAIAssistant, mockOpenAI);
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
    mockOpenAI.createThread.mockResolvedValue({ id: openaiThreadId });
    mockOpenAI.deleteThread.mockResolvedValue({
      deleted: true,
    });

    const prisma = Container.get(PrismaService);
    const project = await prisma.shapleProject.create({
      data: {},
    });

    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(ownerId, project.id);
    expect(thread.openaiThreadId).toBe(openaiThreadId);
    await threadService.delete(thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });

  it('send message', async () => {
    const openaiThreadId = '123123';
    const messageId = 'message-1';
    mockOpenAI.createThread.mockResolvedValue({ id: openaiThreadId });
    mockOpenAI.createMessage.mockResolvedValue({ id: messageId });
    mockOpenAI.deleteThread.mockResolvedValue({
      deleted: true,
    });

    const prisma = Container.get(PrismaService);
    const project = await prisma.shapleProject.create({
      data: {},
    });

    const threadService = Container.get(ThreadService);
    const thread = await threadService.create(ownerId, project.id);
    expect(thread.openaiThreadId).toBe(openaiThreadId);
    await threadService.addUserMessage(thread.id, '안녕하세요');

    await threadService.delete(thread.id);

    expect(mockOpenAI.createThread).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.createMessage).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.deleteThread).toHaveBeenCalledTimes(1);
  });
});
