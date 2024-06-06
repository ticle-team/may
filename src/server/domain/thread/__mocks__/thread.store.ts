import { ThreadStore } from '../thread.store';

export type ThreadStoreMock = jest.Mocked<ThreadStore>;

export function createThreadStoreMock(): ThreadStoreMock {
  // @ts-ignore
  return {
    createThread: jest.fn(),
    updateThread: jest.fn(),
    findThreadById: jest.fn(),
    deleteThreadById: jest.fn(),
    findThreadByStackId: jest.fn(),
  };
}
