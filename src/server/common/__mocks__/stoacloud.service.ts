import { StoaCloudService } from '@/server/common/stoacloud.service';

export type StoaCloudServiceMock = jest.Mocked<StoaCloudService>;

export function createStoaCloudServiceMock(): StoaCloudServiceMock {
  // @ts-ignore
  return {
    createProject: jest.fn(),
    deleteProject: jest.fn(),
    getProject: jest.fn(),
    getProjects: jest.fn(),
    createStack: jest.fn(),
    deleteStack: jest.fn(),
    getStack: jest.fn(),
    installAuth: jest.fn(),
    uninstallAuth: jest.fn(),
    installStorage: jest.fn(),
    uninstallStorage: jest.fn(),
    installPostgrest: jest.fn(),
    uninstallPostgrest: jest.fn(),
    installVapi: jest.fn(),
    uninstallVapi: jest.fn(),
    getVapiPackage: jest.fn(),
    getUser: jest.fn(),
  };
}
