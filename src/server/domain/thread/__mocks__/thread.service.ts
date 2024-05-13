import { ThreadService } from '@/server/domain/thread/thread.service';

export type ThreadServiceMock = jest.Mocked<ThreadService>;
export function createThreadServiceMock(): ThreadServiceMock {
  // @ts-ignore
  return {
    create: jest.fn(),
    getTextMessages: jest.fn(),
    addUserMessage: jest.fn(),
  };
}
