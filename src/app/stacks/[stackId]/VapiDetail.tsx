import { VapiRelease } from '@/models/vapi';
import { StarIcon } from '@heroicons/react/20/solid';
import Badge from '@/app/_components/Badge';
import { ExclamationCircleIcon } from '@/app/_components/Icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { tempApiSpec } from '@/app/stacks/[stackId]/_tempApiSpec';

type Props = {
  vapi: VapiRelease | null;
  docsUrl: string | null;
  loading: boolean;
  onClickUninstallVapiBtn: () => void;
};

const VapiDetail = ({
  vapi,
  docsUrl,
  loading,
  onClickUninstallVapiBtn,
}: Props) => {
  const { data: docsContent, isLoading: isDocsContentLoading } = useQuery({
    queryKey: ['vapiDocsContent', docsUrl],
    queryFn: async () => {
      if (!docsUrl) return null;

      const res = await fetch(docsUrl);
      if (!res.ok) throw new Error('Failed to fetch VAPI docs');

      return await res.text();
    },
  });

  const docsLoading = useMemo(
    () => isDocsContentLoading || loading,
    [loading, isDocsContentLoading],
  );

  return (
    <>
      {vapi && (
        <div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-y-2">
              <div className="flex gap-x-5 items-center">
                <span className="text-base font-semibold text-gray-900">
                  {vapi.package?.name}
                </span>
                <StarIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex gap-x-3">
                <Badge color="pink">{vapi.version}</Badge>
                <ExclamationCircleIcon />
              </div>
            </div>
            <button
              className="font-normal text-sm text-blue-500"
              onClick={onClickUninstallVapiBtn}
            >
              Uninstall
            </button>
          </div>
          <div>
            {docsLoading && (
              <div className="flex justify-center my-10">
                <span className="text-xl font-medium text-primary-600 animate-pulse">
                  Loading...
                </span>
              </div>
            )}
            {!docsLoading && !docsContent && (
              <div className="flex relative justify-center my-10">
                <SwaggerUI spec={tempApiSpec} />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/30 backdrop-blur">
                  <span className="text-2xl font-medium text-secondary-600">
                    No document provided
                  </span>
                </div>
              </div>
            )}
            {!docsLoading && docsContent && <SwaggerUI spec={docsContent} />}
          </div>
        </div>
      )}
    </>
  );
};

export default VapiDetail;
