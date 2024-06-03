import { VapiRelease } from '@/models/vapi';
import { StarIcon } from '@heroicons/react/20/solid';
import Badge from '@/app/_components/Badge';
import { ExclamationCircleIcon } from '@/app/_components/Icons';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useState } from 'react';
import DialogModal from '@/app/_components/Dialog';

type Props = {
  vapi: VapiRelease | null;
  docsContent: string | null;
  docsLoading: boolean;
  onUninstallVapi: (vapiId: number) => Promise<void>;
};

const VapiDetail = ({
  vapi,
  docsContent,
  docsLoading,
  onUninstallVapi,
}: Props) => {
  const [showDeleteVapiDialog, setShowDeleteVapiDialog] =
    useState<boolean>(false);
  const [isUninstallVapiLoading, setUninstallVapiLoading] = useState(false);

  const handleUninstallVapi = async () => {
    if (isUninstallVapiLoading) return;
    setUninstallVapiLoading(true);

    try {
      // TODO: vapiId must be modified
      await onUninstallVapi(1);
    } finally {
      setUninstallVapiLoading(false);
    }
  };

  return (
    <>
      <DialogModal
        open={showDeleteVapiDialog}
        setOpen={setShowDeleteVapiDialog}
        title="VAPI를 삭제하시겠습니까?"
        type="confirm"
        confirmText="Delete"
        onConfirm={handleUninstallVapi}
        cancelText="Cancel"
      />
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
              onClick={() => setShowDeleteVapiDialog(true)}
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
              <div className="flex justify-center my-10">
                <span className="font-normal text-sm text-gray-400">
                  No VAPI definition provided.
                </span>
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
