'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Stack } from '@/models/stack';
import { VapiRelease } from '@/models/vapi';
import { shapleClient } from '@/app/_services/shapleClient';
import { getVapiDocs } from '@/util/utils';
import VapiDetail from './VapiDetail';
import StackFeatures from './StackFeatures';
import DialogModal from '@/app/_components/Dialog';
import { trpc } from '@/app/_trpc/client';

type Props = {
  stack: Stack;
};

export default function StackStructureContainer({ stack }: Props) {
  const [selectedVapi, setSelectedVapi] = useState<VapiRelease | null>(null);
  const [vapiDocsContent, setVapiDocsContent] = useState<string | null>(null);
  const [isVapiDocsloading, setVapiDocsLoading] = useState<boolean>(false);
  const [showDeleteVapiDialog, setShowDeleteVapiDialog] =
    useState<boolean>(false);

  const { data: vapiDocsUrl } = trpc.vapi.getVapiDocsUrl.useQuery({
    vapiReleaseId: selectedVapi?.id ?? 0,
  });

  useEffect(() => {
    setVapiDocsContent(null);
    if (!selectedVapi) return;
    (async () => {
      if (isVapiDocsloading || !selectedVapi || !selectedVapi.package || !stack)
        return;

      try {
        setVapiDocsLoading(true);
        const { data, error } = await shapleClient.auth.getSession();
        if (!data) throw error;
        const githubAccessToken = data?.session?.provider_token;
        // TODO: Implement open guthub Oauth login modal when providerToken is not available or provider is not github

        // TODO: In this function, 'vapi docs' that are inquired through github api must be modified to look up the archived 'vapi docs' later.
        const result = await getVapiDocs({
          vapiName: selectedVapi.package.name,
          githubRepo: selectedVapi.package.gitRepo,
          githubBranch: selectedVapi.package.gitBranch ?? 'main',
          githubAccessToken: githubAccessToken ?? '',
        });

        if (!result) return;
        setVapiDocsContent(result);
      } catch (error) {
        console.error(error);
      } finally {
        setVapiDocsLoading(false);
      }
    })();
  }, [selectedVapi]);

  const handleClickVapi = (vapi: VapiRelease | null) => {
    if (selectedVapi === vapi) {
      return setSelectedVapi(null);
    }
    setSelectedVapi(vapi);
  };

  const handleUninstallVapi = async () => {
    // TODO: Implement VAPI uninstall feature
  };

  const handleAddApi = async (isBaseApi: boolean) => {
    // TODO: Implement add API feature
  };

  return (
    <>
      <DialogModal
        open={showDeleteVapiDialog}
        setOpen={setShowDeleteVapiDialog}
        title="VAPI를 삭제하시겠습니까?"
        type="confirm"
        confirmText="Delete"
        onConfirm={async () => {
          await handleUninstallVapi();
        }}
        cancelText="Cancel"
      />
      <div className="flex w-full mt-5 justify-between">
        <div className="w-[25%] flex flex-col gap-y-12">
          <StackFeatures
            stack={stack}
            onClickVapiBtn={handleClickVapi}
            onClickAddApiBtn={handleAddApi}
          />
        </div>
        <div className="flex flex-col w-[calc(75%-100px)]">
          <VapiDetail
            loading={isVapiDocsloading}
            docsUrl={vapiDocsUrl ?? null}
            vapi={selectedVapi}
            onClickUninstallVapiBtn={() => setShowDeleteVapiDialog(true)}
          />
        </div>
      </div>
    </>
  );
}
