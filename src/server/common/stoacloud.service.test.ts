import { Container } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import * as uuid from 'uuid';
import { createClient, User } from '@shaple/shaple';
import delay from 'delay';
import { createUser, deleteUser, shaple } from '@/server/domain/user/user.stub';
import { resetSchema } from '@/migrate';
import { PrismaService } from '@/server/common/prisma.service';
import { readFileSync } from 'fs';

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
    let projectId = 0;
    let stackId = 0;
    let scs: StoaCloudService;
    beforeEach(async () => {
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
        waiting: true,
        waitTimeout: '30s',
        mailer: {
          autoConfirm: true,
        },
        smtp: {
          senderName: 'stoacloud',
          adminEmail: 'stoacloud@stoacloud.io',
        },
        external: {
          emailEnabled: true,
        },
      });
      await delay(500);

      stack = await scs.getStack(stackId);
      expect(stack.auth).toBeTruthy();
      const endpoint = `http://${stack.domain}`;
      const anonApiKey = stack.anonApiKey;
      expect(anonApiKey).toBeDefined();

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
        waiting: true,
        waitTimeout: '30s',
        mailer: {
          autoConfirm: true,
        },
        smtp: {
          senderName: 'stoacloud',
          adminEmail: 'stoacloud@stoacloud.io',
        },
        external: {
          emailEnabled: true,
        },
      });
      await scs.installStorage(stackId, {
        waiting: true,
        waitTimeout: '30s',
        tenantId: 'test-tenant',
      });
      await delay(750);

      const { domain, adminApiKey, storageEnabled } =
        await scs.getStack(stackId);
      expect(adminApiKey).toBeDefined();
      expect(storageEnabled).toBe(true);

      const shaple = createClient(`http://${domain}`, adminApiKey!);
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
      let user: User;

      beforeEach(async () => {
        const prisma = Container.get(PrismaService);
        user = await createUser();
        await prisma.shapleUser.create({
          data: {
            ownerId: user.id,
            gitPrivateKeyPem,
          },
        });
        await scs.addProjectUser(projectId, user.id);
      });

      afterEach(async () => {
        await deleteUser(user);
      });

      it('when register vapi, then it is OK', async () => {
        const prisma = Container.get(PrismaService);

        const {
          data: { session },
          error,
        } = await shaple.auth.getSession();
        expect(error).toBeNull();
        expect(session).not.toBeNull();

        const jwt = session?.access_token;
        expect(jwt).toBeDefined();

        let outputs;
        try {
          outputs = await scs.registerVapis(session!.access_token, null, {
            projectId: projectId,
            gitBranch: 'main',
            gitRepo: 'paust-team/shaple-testvapis',
          });

          expect(outputs).toHaveLength(2);
          const output = outputs[0];
          expect(output.deployStatus).toBe('ok');
        } finally {
          if (outputs) {
            for (const output of outputs) {
              await scs.deleteVapiRelease(jwt!, output.releaseId);
            }
          }
        }
      });
    });
  });
});
