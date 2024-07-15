import { setTimeout } from 'timers/promises';
import { Container } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import * as uuid from 'uuid';
import { createClient, Session, User } from '@shaple/shaple';
import {
  createUser,
  deleteUser,
  shaple,
} from '@/server/domain/user/__mocks__/user.stub';
import { resetSchema } from '@/migrate';
import { PrismaService } from '@/server/common/prisma.service';
import { readFileSync } from 'fs';
import axios from 'axios';
import { stoacloud } from '@/protos/stoacloud';

describe('given stoacloud service', () => {
  beforeEach(async () => {
    await resetSchema();
    await Container.get(StoaCloudService).resetSchema();
  });

  afterEach(() => {
    Container.reset();
  });

  it('when create project, then is OK', async () => {
    const scs = Container.get(StoaCloudService);
    let projectId = 0;
    try {
      const project = await scs.createProject(
        `test-project-${uuid.v4()}`,
        'test description 1',
      );
      projectId = project.id;
      expect(project.id).toBeGreaterThan(0);
    } finally {
      if (projectId > 0) {
        await scs.deleteProject(projectId);
      }
    }
  });

  describe('with temporary project', () => {
    let instanceId = 0;
    let projectId = 0;
    let stackId = 0;
    let scs: StoaCloudService;
    beforeEach(async () => {
      instanceId = 0;
      stackId = 0;
      projectId = 0;
      scs = Container.get(StoaCloudService);
      const project = await scs.createProject(
        `test-project-${uuid.v4()}`,
        'test description 1',
      );
      projectId = project.id;
    });

    afterEach(async () => {
      if (instanceId > 0) {
        await scs.stopInstance(instanceId);
        await scs.deleteInstance(instanceId);
      }
      if (stackId > 0) {
        await scs.deleteStack(stackId);
      }
      if (projectId > 0) {
        await scs.deleteProject(projectId);
      }
      Container.reset();
    });

    it('when create stack, then is OK', async () => {
      let stackId = 0;
      try {
        await scs.createStack(
          'localhost:3000',
          projectId,
          `test-stack-${uuid.v4()}`,
          'test description 2',
        );
      } finally {
        if (stackId > 0) {
          await scs.deleteStack(stackId);
        }
      }
    });

    it('when install auth, then is OK', async () => {
      let stack = await scs.createStack(
        'localhost:3000',
        projectId,
        `test-stack-${uuid.v4()}`,
        'test description 2',
      );
      stackId = stack.id;

      expect(stack.auth).toBeTruthy();
      await scs.installAuth(stackId, {
        mailerAutoConfirm: true,
        smtpSenderName: 'stoacloud',
        smtpAdminEmail: 'stoacloud@stoacloud.io',
        externalEmailEnabled: true,
      });

      stack = await scs.getStack(stackId);
      expect(stack.auth).toBeTruthy();
      const endpoint = `http://${stack.domain}`;
      const anonApiKey = stack.anonApiKey;
      expect(anonApiKey).toBeDefined();

      const instance = await scs.createInstance({
        stackId: stackId,
      });
      expect(instance).toBeDefined();
      instanceId = instance.id;
      await scs.deployStack(instanceId, {
        timeout: '30s',
      });

      let done = false;
      for (let i = 0; i < 10 && !done; i++) {
        try {
          await axios.get(endpoint + '/auth/v1/health');
          done = true;
          break;
        } catch (error) {
          console.warn(error);
        }
        await setTimeout(1000);
      }
      expect(done).toBe(true);

      const shaple = createClient(endpoint, anonApiKey!);
      {
        const { error } = await shaple.auth.signUp({
          email: 'test@test.com',
          password: 'qwer1234',
        });
        expect(error, `status=${error?.status}`).toBeNull();
      }
      {
        const {
          data: { session, user },
          error,
        } = await shaple.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'qwer1234',
        });
        expect(error, `status=${error?.status}`).toBeNull();
        expect(session).toBeDefined();
        expect(user).toBeDefined();
        expect(user?.email).toBe('test@test.com');
      }
    });

    it('when install storage, then is OK', async () => {
      let stack = await scs.createStack(
        'localhost:3000',
        projectId,
        `test-stack-3-${uuid.v4()}`,
        'test description 3',
      );
      stackId = stack.id;
      expect(stack.auth).toBeTruthy();
      await scs.installAuth(stackId, {
        mailerAutoConfirm: true,
        smtpSenderName: 'stoacloud',
        smtpAdminEmail: 'stoacloud@stoacloud.io',
        externalEmailEnabled: true,
      });
      await scs.installStorage(stackId, {
        tenantId: 'test-tenant',
      });

      const { domain, anonApiKey, adminApiKey, storageEnabled } =
        await scs.getStack(stackId);
      expect(adminApiKey).toBeDefined();
      expect(storageEnabled).toBe(true);
      const endpoint = `http://${domain}`;

      const instance = await scs.createInstance({
        stackId: stackId,
      });
      instanceId = instance.id;
      await scs.deployStack(instanceId, {
        timeout: '30s',
      });

      let done = false;
      for (let i = 0; i < 10 && !done; i++) {
        try {
          await Promise.all([
            axios.get(endpoint + '/auth/v1/health'),
            axios.get(endpoint + '/storage/v1/health', {
              headers: {
                Authorization: `Bearer ${anonApiKey}`,
              },
            }),
          ]);
          done = true;
          break;
        } catch (error) {
          console.warn(error);
        }
        await setTimeout(1000);
      }
      expect(done).toBe(true);

      const shaple = createClient(endpoint, adminApiKey!);
      {
        const { error } = await shaple.storage.createBucket('test-bucket');
        expect(error).toBeNull();
      }
      {
        const buffer = Buffer.from('hello world');
        const { error } = await shaple.storage
          .from('test-bucket')
          .upload('test.txt', buffer);
        expect(error).toBeNull();
      }
      {
        const { data, error } = await shaple.storage
          .from('test-bucket')
          .download('test.txt');
        expect(error).toBeNull();
        expect(data).not.toBeNull();

        const text = await data!.text();
        expect(text).toBe('hello world');
      }
    });

    describe('with temporary user', () => {
      const gitPrivateKeyPem = readFileSync(
        './stoacloud/testdata/shaple-testvapis_github_rsa',
      );
      let session: Session;

      beforeEach(async () => {
        session = await createUser();
      });

      afterEach(async () => {
        await deleteUser(session);
      });

      it('when get user, then it is OK', async () => {
        const prisma = Container.get(PrismaService);
        const shapleUser = await scs.getUser({
          session,
          tx: prisma,
          githubToken: null,
        });
        expect(shapleUser).toBeDefined();
        expect(shapleUser.id).toBeGreaterThan(0);
        expect(shapleUser.ownerId).toBe(session.user.id);
      });

      it('when register vapi, then it is OK', async () => {
        const prisma = Container.get(PrismaService);
        await prisma.shapleUser.create({
          data: {
            ownerId: session.user.id,
            gitPrivateKeyPem,
            name: 'dennispark',
          },
        });
        await scs.addProjectMember(projectId, session.user.id);

        await using cleanup = new AsyncDisposableStack();
        const outputs = await scs.registerVapis(session!.access_token, null, {
          projectId: projectId,
          gitBranch: 'main',
          gitRepo: 'paust-team/shaple-testvapis',
        });

        expect(outputs).toHaveLength(2);
        const output = outputs[0];
        expect(output.status).toBe(
          stoacloud.v1.RegisterVapiResult.Status.StatusOK,
        );
        cleanup.defer(async () => {
          for (const output of outputs) {
            await scs.deleteVapiRelease(jwt!, output.releaseId);
          }
        });
      });

      let registerVapiReleaseIds: number[] = [];
      let jwt: string = '';
      describe('with registered vapis', () => {
        beforeEach(async () => {
          const {
            data: { session },
            error,
          } = await shaple.auth.getSession();
          expect(error).toBeNull();
          expect(session).not.toBeNull();

          jwt = session?.access_token ?? '';
          expect(jwt).not.toBe('');

          const outputs = await scs.registerVapis(session!.access_token, null, {
            projectId: projectId,
            gitBranch: 'main',
            gitRepo: 'paust-team/shaple-testvapis',
          });

          expect(outputs).toHaveLength(2);

          registerVapiReleaseIds = outputs.map((output) => output.releaseId);
        });

        afterEach(async () => {
          for (const relId of registerVapiReleaseIds) {
            await scs.deleteVapiRelease(jwt, relId);
          }
        });

        it('get vapi packages by name, then it is OK', async () => {
          const vapis = await scs.getVapiPackages({
            name: 'helloworld',
          });
          expect(vapis).toHaveLength(1);
          expect(vapis[0].name).toBe('helloworld');
          expect(vapis[0].id).not.toBe(0);
        });

        it('get vapi release by package id, then it is OK', async () => {
          const vapis = await scs.getVapiPackages({
            name: 'helloworld',
          });
          expect(vapis).toHaveLength(1);
          expect(vapis[0].name).toBe('helloworld');
          expect(vapis[0].id).not.toBe(0);

          const releases = await scs.getVapiReleasesInPackage(vapis[0].id);
          expect(releases).toHaveLength(1);
          console.log(releases);
        });

        it('get vapi release versioned in package, then it is OK', async () => {
          const vapis = await scs.getVapiPackages({
            name: 'helloworld',
          });
          expect(vapis).toHaveLength(1);
          expect(vapis[0].name).toBe('helloworld');
          expect(vapis[0].id).not.toBe(0);

          const release = await scs.getVapiReleaseInPackage(
            vapis[0].id,
            'latest',
          );
          expect(release.packageId).toBe(vapis[0].id);
          expect(release.version).toBe('0.1.0');
          console.log(release);
        });
      });
    });
  });
});
