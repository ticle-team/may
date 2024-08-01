import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { getLogger } from '@/logger';
import {
  Instance,
  parseShapleStackFromProto,
  parseZoneFromProto,
  Stack,
} from '@/models/stack';
import { Context } from '@/server/context';
import { threadStateInfo } from '@/models/thread';
import _ from 'lodash';
import { parseVapiPackageFromProto } from '@/models/vapi';

const logger = getLogger('server.domain.stack.service');

@Service()
export class StackService {
  constructor(
    private readonly stoacloudService: StoaCloudService,
    private readonly threadStore: ThreadStore,
  ) {}

  async createStackByToolCall(
    ctx: Context,
    projectId: number,
    name: string,
    description: string,
    baseApis: { name: string }[],
    vapis: { name: string }[],
  ) {
    const { stackId, err } = await this.stoacloudService
      .createStack(
        'http://localhost:3000', // TODO: change real site url
        projectId,
        name,
        description,
      )
      .then((data) => {
        return {
          stackId: data.id,
          err: null,
        };
      })
      .catch((err) => {
        logger.error('failed to create stack', { e: err });

        return {
          stackId: 0,
          err: {
            success: false,
            message: 'failed to create stack\n' + err.details,
          },
        };
      });
    if (err) {
      return { stackId: 0, output: err };
    }

    let baseApiNames = baseApis.map((api) => api.name.toLowerCase());
    try {
      if (_.includes(baseApiNames, 'auth')) {
        await this.stoacloudService.installAuth(stackId, {
          mailerAutoConfirm: true,
          externalEmailEnabled: true,
        });
        baseApiNames = baseApiNames.filter((name) => name != 'auth');
        logger.debug('install auth', { stackId });
      }
      if (_.includes(baseApiNames, 'storage')) {
        await this.stoacloudService.installStorage(stackId, {
          tenantId: 'storage',
        });
        baseApiNames = baseApiNames.filter((name) => name != 'storage');
        logger.debug('install storage', { stackId });
      }
      if (_.includes(baseApiNames, 'database')) {
        await this.stoacloudService.installPostgrest(stackId, {
          schemas: ['public'],
        });
        baseApiNames = baseApiNames.filter((name) => name != 'database');
        logger.debug('install database', { stackId });
      }
    } catch (e) {
      logger.error('failed to install base api', { e });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      const output = {
        success: false,
        message: 'failed to install base api',
      };
      return {
        stackId: 0,
        output,
      };
    }

    if (baseApiNames.length > 0) {
      logger.error('unknown base api names', { baseApiNames });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      const output = {
        success: false,
        message: `unknown base api names: ${baseApiNames.map((t) => `'${t}'`).join(', ')}`,
      };
      return {
        stackId: 0,
        output,
      };
    }

    const vapiReleases: { id: number; name: string }[] = [];
    for (const { name } of vapis) {
      try {
        const vapiPackages = await this.stoacloudService.getVapiPackages({
          name,
        });

        if (vapiPackages.length === 0) {
          continue;
        }

        // TODO: handle case when multi vapiPackages found
        const vapiRelease = await this.stoacloudService.getVapiReleaseInPackage(
          vapiPackages[0].id,
          'latest',
        );

        vapiReleases.push({
          id: vapiRelease.id,
          name: name,
        });
      } catch (e) {
        logger.error('failed to find vapis', { e, name });
        this.stoacloudService.deleteStack(stackId).catch((err) => {
          logger.error('failed to delete stack', { err });
        });
        const output = {
          success: false,
          message: `failed to find VAPI(name=${name})`,
        };

        return {
          stackId: 0,
          output,
        };
      }
    }

    for (const { id, name } of vapiReleases) {
      try {
        await this.stoacloudService.installVapi(stackId, {
          vapiId: id,
        });
      } catch (e) {
        logger.error('failed to install dependencies', { e });
        this.stoacloudService.deleteStack(stackId).catch((err) => {
          logger.error('failed to delete stack', { err });
        });
        const output = {
          success: false,
          message: `failed to install VAPI(name=${name})`,
        };
        return {
          stackId: 0,
          output: output,
        };
      }
    }

    try {
      const notInstalledVapis = vapis.filter(
        (v) => vapiReleases.findIndex((r) => r.name === v.name) === -1,
      );
      const output: Record<string, any> = { success: true };
      if (notInstalledVapis.length > 0) {
        output['message'] =
          'skip install vapis: ' +
          notInstalledVapis.map((v) => `'${v.name}'`).join(', ') +
          '. Because they are not found.';
      }

      return {
        stackId,
        output,
      };
    } catch (error) {
      logger.error('failed to update thread or submit tool', { error });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      const output = {
        success: false,
        message: 'failed to update thread',
      };

      return {
        stackId: 0,
        output,
      };
    }
  }

  async getStack(ctx: Context, stackId: number): Promise<Stack> {
    const [shapleStack, thread] = await Promise.all([
      this.stoacloudService.getStack(stackId),
      this.threadStore.findThreadByStackId(ctx, stackId),
    ]);

    const vapiPackages = await Promise.all(
      shapleStack.vapis.map(async ({ vapi }) => {
        return await this.stoacloudService.getVapiPackage(vapi.packageId);
      }),
    );

    if (vapiPackages.length !== shapleStack.vapis.length) {
      throw new Error('failed to get vapi packages');
    }

    const stack = parseShapleStackFromProto(shapleStack);
    return {
      ...stack,
      vapis:
        stack.vapis?.map((vapi, i) => {
          if (!vapi?.vapi) {
            return vapi;
          }
          console.log(i, vapi, vapiPackages);
          vapi.vapi.package = parseVapiPackageFromProto(vapiPackages[i]);
          return vapi;
        }) ?? null,
      thread: thread
        ? {
            ...thread,
            stateInfo: threadStateInfo.parse(thread.stateInfo) ?? null,
          }
        : null,
    };
  }

  async getInstancesInStack(stackId: number) {
    const instances = await this.stoacloudService.getInstancesInStack(stackId);
    return {
      instances: instances.map(
        (instance): Instance => ({
          id: instance.id,
          stackId: instance.stackId,
          state: instance.state,
          zone: parseZoneFromProto(instance.zone),
        }),
      ),
      after: null,
    };
  }
}
