import { AssistantService } from '@/server/domain/assistant/assistant.service';

export type AssistantServiceMock = jest.Mocked<AssistantService>;
export function createAssistantServiceMock(): AssistantServiceMock {
  // @ts-ignore
  return {
    runForCreationStack: jest.fn(),
  };
}
