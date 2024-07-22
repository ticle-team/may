import { Container } from 'typedi';
import { ThreadService } from '@/server/domain/thread/thread.service';
import {
  createOpenAIAssistantMock,
  OpenAIAssistantMock,
} from '@/server/common/__mocks__/openai.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { resetSchema } from '@/migrate';
import { Session, User } from '@shaple/shaple';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@/server/common/prisma.service';
import { Context } from '@/server/context';
import {
  createUser,
  deleteUser,
} from '@/server/domain/user/__mocks__/user.stub';

describe('given ThreadService with real ThreadStore', () => {
  const ownerId = '123123';
  let mockOpenAI: OpenAIAssistantMock;
  let prisma: PrismaClient;
  let session: Session;
  beforeEach(async () => {
    session = await createUser();
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
    await deleteUser(session);
  });

  it('create thread', async () => {
    const ctx = {
      session,
      tx: prisma,
    } as Context;
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
      session,
      tx: prisma,
    } as Context;
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
