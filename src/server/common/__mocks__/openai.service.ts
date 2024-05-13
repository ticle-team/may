import { OpenAIAssistant } from '@/server/common/openai.service';

export type OpenAIAssistantMock = jest.Mocked<OpenAIAssistant>;
export function createOpenAIAssistantMock(): OpenAIAssistantMock {
  // @ts-ignore
  return {
    getAssistant: jest.fn(),
    createThread: jest.fn(),
    deleteThread: jest.fn(),
    createMessage: jest.fn(),
    deleteMessage: jest.fn(),
    getMessages: jest.fn(),
    runStream: jest.fn(),
    run: jest.fn(),
  };
}
