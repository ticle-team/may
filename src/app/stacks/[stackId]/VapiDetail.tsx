import { VapiRelease } from '@/models/vapi';
import { StarIcon } from '@heroicons/react/20/solid';
import Badge from '@/app/_components/Badge';
import { ExclamationCircleIcon } from '@/app/_components/Icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  vapi: VapiRelease | null;
  docsContent: string | null;
  loading: boolean;
  onClickUninstallVapiBtn: () => void;
};

const VapiDetail = ({
  vapi,
  docsContent,
  loading,
  onClickUninstallVapiBtn,
}: Props) => {
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
            {loading && (
              <div className="flex justify-center my-10">
                <span className="text-xl font-medium text-primary-600 animate-pulse">
                  Loading...
                </span>
              </div>
            )}
            {!loading && !docsContent && (
              <div className="flex justify-center my-10">
                <span className="font-normal text-sm text-gray-400">
                  No VAPI definition provided.
                </span>
              </div>
            )}
            {!loading && docsContent && <SwaggerUI spec={docsContent} />}
          </div>
        </div>
      )}
    </>
  );
};

export default VapiDetail;
