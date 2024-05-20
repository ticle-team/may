import {
  OpenAIAssistant,
  OpenAICompletions,
} from '@/server/common/openai.service';

export type OpenAIAssistantMock = jest.Mocked<OpenAIAssistant>;
export function createOpenAIAssistantMock(): jest.Mocked<OpenAIAssistant> {
  // @ts-ignore
  return {
    getAssistant: jest.fn(),
    createThread: jest.fn(),
    deleteThread: jest.fn(),
    createMessage: jest.fn(),
    deleteMessage: jest.fn(),
    getTextMessages: jest.fn(),
    runStream: jest.fn(),
    run: jest.fn(),
  };
}

export type OpenAICompletionsMock = jest.Mocked<OpenAICompletions>;
export function createOpenAICompletionsMock(): OpenAICompletionsMock {
  // @ts-ignore
  return {
    chat: jest.fn(),
  };
}
