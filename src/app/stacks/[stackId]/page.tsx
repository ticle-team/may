'use client';

import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import StackStructure from '@/app/stacks/[stackId]/StackStructure';
import useToast from '@/app/_hooks/useToast';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import { VapiRelease } from '@/models/vapi';
import VapiDetail from '@/app/stacks/[stackId]/VapiDetail';
import { getVapiDocs } from '@/util/utils';
import { shapleClient } from '@/app/_services/shapleClient';
import StackInfoContainer from './StackInfoContainer';

export default function Page() {
  const { renderToastContents, showErrorToast } = useToast();
  const { stackId: stackIdStr } = useParams<{
    stackId: string;
  }>();
  const stackId = parseInt(stackIdStr);
  const [selectedTab, setSelectedTab] = useState('Info');
  const [selectedVapi, setSelectedVapi] = useState<VapiRelease | null>(null);
  const [vapiDocsContent, setVapiDocsContent] = useState<string | null>(null);
  const [isVapiDocsloading, setVapiDocsLoading] = useState<boolean>(false);

  const tabs = [
    { name: 'Info' },
    { name: 'Structure' },
    { name: 'Editor' },
    { name: 'Settings' },
  ];

  const {
    data: stack,
    isLoading: isStackQueryLoading,
    error: stackQueryError,
  } = trpc.stack.get.useQuery({
    stackId: stackId,
  });

  useEffect(() => {
    if (stackQueryError)
      showErrorToast('스택 정보를 불러오는 중 오류가 발생했습니다.');
  }, [stackQueryError]);

  useEffect(() => {
    setVapiDocsContent(null);
    if (!selectedVapi) return;
    fetchVapiDocs();
  }, [selectedVapi]);

  const handleClickVapi = (vapi: VapiRelease | null) => {
    if (selectedVapi === vapi) {
      return setSelectedVapi(null);
    }
    setSelectedVapi(vapi);
  };

  const fetchVapiDocs = useCallback(async () => {
    if (isVapiDocsloading || !selectedVapi || !selectedVapi.pkg || !stack)
      return;

    try {
      setVapiDocsLoading(true);
      const { data, error } = await shapleClient.auth.getSession();
      if (!data) throw error;
      const githubAccessToken = data?.session?.provider_token;
      // TODO: Implement open guthub Oauth login modal when providerToken is not available

      // TODO: In this function, 'vapi docs' that are inquired through github api must be modified to look up the archived 'vapi docs' later.
      const result = await getVapiDocs({
        vapiName: selectedVapi.pkg.name,
        githubRepo: selectedVapi.pkg.gitRepo,
        githubBranch: selectedVapi.pkg.gitBranch ?? 'main',
        githubAccessToken: githubAccessToken ?? '',
      });

      if (!result) return;
      setVapiDocsContent(result);
    } catch (error) {
      console.error(error);
    } finally {
      setVapiDocsLoading(false);
    }
  }, [selectedVapi]);

  const handleUninstallVapi = async (vapiId: number) => {
    // TODO: Implement VAPI uninstall feature
  };

  return (
    <>
      {renderToastContents()}
      {isStackQueryLoading || (!isStackQueryLoading && stackQueryError) ? (
        <div className="flex flex-col justify-center w-[800px] min-h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex flex-col min-w-[800px] max-w-7xl py-24 items-center">
          <div className="w-full flex justify-start">
            <div className="font-bold text-3xl my-6">{stack?.name}</div>
          </div>
          <div className="w-full flex flex-col">
            <div className="w-full flex">
              <div className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={classNames(
                      selectedTab == tab.name
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                    )}
                    aria-current={selectedTab == tab.name ? 'page' : undefined}
                    onClick={() => {
                      setSelectedTab(tab.name);
                    }}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
            {selectedTab === 'Info' && <StackInfoContainer stack={stack!} />}
            {selectedTab === 'Structure' && (
              <StackStructure stack={stack!} onClickVapi={handleClickVapi}>
                <VapiDetail
                  docsLoading={isVapiDocsloading}
                  docsContent={vapiDocsContent ?? null}
                  vapi={selectedVapi}
                  onUninstallVapi={handleUninstallVapi}
                />
              </StackStructure>
            )}
          </div>
        </div>
      )}
    </>
  );
}
