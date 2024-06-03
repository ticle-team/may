import { Stack } from '@/models/stack';
import { VapiRelease } from '@/models/vapi';
import { StarIcon } from '@heroicons/react/20/solid';
import Badge from '@/app/_components/Badge';
import { ExclamationCircleIcon } from '@/app/_components/Icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  stack: Stack;
  vapi: VapiRelease | null;
  onClickUninstallVapiBtn: () => void;
};

const VapiDetail = ({ stack, vapi, onClickUninstallVapiBtn }: Props) => {
  const convertToDocsUrl = (
    githubRepo: string,
    githubBranch: string,
    vapiName: string,
  ) => {
    if (!githubRepo || !vapiName) return '';
    return `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/${vapiName}/docs.yml`;
  };

  return (
    <>
      {vapi && (
        <div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-y-2">
              <div className="flex gap-x-5 items-center">
                <span className="text-base font-semibold text-gray-900">
                  {vapi.pkg?.name}
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
            <SwaggerUI
              url={convertToDocsUrl(
                stack.githubRepo,
                stack.githubBranch ?? 'main',
                vapi.pkg?.name ?? '',
              )}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VapiDetail;
