import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { PrismaService } from '@/server/common/prisma.service';
import { OpenAIAssistant } from '@/server/common/openai.service';
import { ThreadStore } from '@/server/domain/thread/thread.store';
import { getLogger } from '@/logger';
import _ from 'lodash';
import {
  Instance,
  parseShapleStackFromProto,
  parseZoneFromProto,
  ShapleStack,
  Stack,
  StackVapi,
} from '@/models/stack';
import { vapiAccessToString, VapiPackage } from '@/models/vapi';
import { stoacloud } from '@/protos/stoacloud';

const logger = getLogger('server.domain.stack.service');

@Service()
export class StackService {
  constructor(
    private readonly stoacloudService: StoaCloudService,
    private readonly prisma: PrismaService,
    private readonly openaiAssistant: OpenAIAssistant,
    private readonly threadStore: ThreadStore,
  ) {}

  async createStackByToolCall(
    toolCallId: string,
    runId: string,
    threadId: number,
    args: string,
    projectId: number,
  ) {
    logger.debug('call createStackByToolCall', { args });
    const { openaiThreadId } = await this.threadStore.findThreadById(threadId);

    const { name, description, dependencies } = JSON.parse(args);

    let stackId: number;
    try {
      const data = await this.stoacloudService.createStack(
        'http://localhost:3000', // TODO: change real site url
        projectId,
        name,
        description,
      );
      stackId = data.id;
    } catch (err) {
      logger.error('failed to create stack', { e: err });
      const generator = this.openaiAssistant.submitToolOutputsStream(
        openaiThreadId,
        runId,
        toolCallId,
        JSON.stringify({
          success: false,
          message: 'failed to create stack',
        }),
      );

      return {
        stackId: 0,
        generator,
      };
    }

    logger.debug('install dependencies', { dependencies });
    const { vapis, base_apis: baseApis } = dependencies;

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
        const generator = this.openaiAssistant.submitToolOutputsStream(
          openaiThreadId,
          runId,
          toolCallId,
          JSON.stringify({
            success: false,
            message: 'failed to install base api',
          }),
        );
        return {
          stackId,
          generator,
        };
      }
    }

    try {
      for (const { name } of vapis) {
        const vapiPackages = await this.stoacloudService.getVapiPackages({
          name,
        });

        // TODO: handle case when multi vapiPackages found
        const vapiRelease = await this.stoacloudService.getVapiReleaseInPackage(
          vapiPackages[0].id,
          'latest',
        );
        await this.stoacloudService.installVapi(stackId, {
          vapiId: vapiRelease.id,
        });
      }
    } catch (e) {
      logger.error('failed to install dependencies', { e });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      const generator = this.openaiAssistant.submitToolOutputsStream(
        openaiThreadId,
        runId,
        toolCallId,
        JSON.stringify({
          success: false,
          message: 'failed to install dependencies',
        }),
      );
      return {
        stackId,
        generator,
      };
    }

    let generator;
    try {
      generator = await this.prisma.$transaction(async (tx) => {
        await tx.thread.update({
          where: {
            id: threadId,
          },
          data: {
            shapleStackId: stackId,
          },
        });

        return this.openaiAssistant.submitToolOutputsStream(
          openaiThreadId,
          runId,
          toolCallId,
          JSON.stringify({
            success: true,
          }),
        );
      });
    } catch (error) {
      logger.error('failed to update thread or submit tool', { error });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      const generator = this.openaiAssistant.submitToolOutputsStream(
        openaiThreadId,
        runId,
        toolCallId,
        JSON.stringify({
          success: false,
          message: 'failed to update thread',
        }),
      );

      return {
        stackId,
        generator,
      };
    }

    try {
      return {
        stackId,
        generator,
      };
    } catch (err) {
      logger.error('received error while generating', { err });
      this.stoacloudService.deleteStack(stackId).catch((err) => {
        logger.error('failed to delete stack', { err });
      });
      throw err;
    }
  }

  async getStack(stackId: number) {
    const [shapleStack, thread] = await Promise.all([
      this.stoacloudService.getStack(stackId),
      this.threadStore.findThreadByStackId(stackId),
    ]);

    const stack: Stack = {
      ...parseShapleStackFromProto(shapleStack),
      thread: thread,
    };
    return stack;
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
