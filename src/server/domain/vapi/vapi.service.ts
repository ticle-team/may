import { Service } from 'typedi';
import { StoaCloudService } from '@/server/common/stoacloud.service';
import {
  parseVapiPackageFromProto,
  parseVapiReleaseFromProto,
  VapiRelease,
} from '@/models/vapi';
import { Context } from '@/server/context';

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

  async getVapiDocsUrl(
    ctx: Context,
    vapiReleaseId: number,
  ): Promise<string | null> {
    if (vapiReleaseId <= 0) {
      return null;
    }

    const jwt = ctx.session?.access_token ?? null;
    const url = await this.stoacloud.getVapiDocsUrl(jwt, vapiReleaseId);
    if (url === '') {
      return null;
    }

    return url;
  }
}
