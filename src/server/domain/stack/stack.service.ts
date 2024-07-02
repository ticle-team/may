import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { getLogger } from '@/logger';
import _ from 'lodash';
import {
  Instance,
  parseShapleStackFromProto,
  parseZoneFromProto,
  Stack,
} from '@/models/stack';
import { Context } from '@/server/context';
import { threadStateInfo } from '@/models/thread';

const logger = getLogger('server.domain.stack.service');

@Service()
export class StackService {
  constructor(
    private readonly stoacloudService: StoaCloudService,
    private readonly openaiAssistant: OpenAIAssistant,
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
            message: 'failed to create stack',
          },
        };
      });
    if (err) {
      return { stackId: 0, output: err };
    }

    for (const { name } of baseApis) {
      try {
        switch (_.lowerCase(name)) {
          case 'auth': {
            await this.stoacloudService.installAuth(stackId, {
              mailerAutoConfirm: true,
              externalEmailEnabled: true,
            });
            break;
          }
          case 'storage': {
            await this.stoacloudService.installStorage(stackId, {
              tenantId: name,
            });
            break;
          }
          case 'database': {
            await this.stoacloudService.installPostgrest(stackId, {
              schemas: ['public'],
            });
            break;
          }
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
    }

    const vapiReleases = [];
    for (const { name } of vapis) {
      try {
        const vapiPackages = await this.stoacloudService.getVapiPackages({
          name,
        });

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
      const output = {
        success: true,
      };

      return { stackId, output };
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

    const stack = parseShapleStackFromProto(shapleStack);
    return {
      ...stack,
      vapis:
        stack.vapis?.map((vapi, i) => {
          if (!vapi?.vapi) {
            return vapi;
          }
          vapi.vapi.package = vapiPackages[i];
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
