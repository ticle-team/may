import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import { Instance, instance, parseZoneFromProto } from '@/models/stack';
import { stoacloud } from '@/protos/stoacloud';

@Service()
export class InstanceService {
  constructor(private readonly stoaCloudService: StoaCloudService) {}

  async createInstance(
    stackId: number,
    zoneStr: string | null,
    name: string | null,
  ): Promise<Instance> {
    let zone = stoacloud.v1.InstanceZone.InstanceZoneDefault;
    switch (zoneStr) {
      case 'oci-ap-seoul-1':
        zone = stoacloud.v1.InstanceZone.InstanceZoneOciApSeoul;
        break;
      case 'default':
        zone = stoacloud.v1.InstanceZone.InstanceZoneDefault;
        break;
      case 'multi':
        zone = stoacloud.v1.InstanceZone.InstanceZoneMulti;
        break;
    }

    const inst = await this.stoaCloudService.createInstance({
      stackId,
      name: name ?? undefined,
      zone,
    });

    return {
      id: inst.id,
      stackId: inst.stackId,
      state: inst.state,
      zone: parseZoneFromProto(inst.zone),
    };
  }

  async deployStack(instanceId: number) {
    await this.stoaCloudService.deployStack(instanceId, {
      timeout: '5m',
    });
  }
}
