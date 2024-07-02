import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import {
  parseVapiPackageFromProto,
  parseVapiReleaseFromProto,
  VapiRelease,
} from '@/models/vapi';

@Service()
export class VapiService {
  constructor(private readonly stoacloud: StoaCloudService) {}

  async getLatestReleasesByNames(names: string[]): Promise<VapiRelease[]> {
    return (
      await Promise.all(
        names.map(async (name) => {
          const vapiPackages = await this.stoacloud.getVapiPackages({
            name,
          });

          if (vapiPackages.length === 0) {
            return null;
          }

          const vapiReleaseProto = await this.stoacloud.getVapiReleaseInPackage(
            vapiPackages[0].id,
            'latest',
          );

          return {
            ...parseVapiReleaseFromProto(vapiReleaseProto),
            package: parseVapiPackageFromProto(vapiPackages[0]),
          };
        }),
      )
    )
      .filter((vapiRelease) => vapiRelease !== null)
      .map((vapiRelease): VapiRelease => vapiRelease!);
  }
}
