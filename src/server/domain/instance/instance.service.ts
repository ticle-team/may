import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { instance } from '@/models/stack';

@Service()
export class InstanceService {
  constructor(private readonly stoaCloudService: StoaCloudService) {}

  async createInstance(
    stackId: number,
    zone: string | null,
    name: string | null,
  ) {
    const inst = await this.stoaCloudService.createInstance({
      stackId,
      zone,
      name,
    });
    instance.parse(inst);
    return inst;
  }

  async deployStack(instanceId: number) {
    await this.stoaCloudService.deployStack(instanceId, {
      timeout: '5m',
    });
  }
}
