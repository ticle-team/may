'use client';

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import useToast from '@/app/_hooks/useToast';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import StackInfoContainer from './StackInfoContainer';
import StackStructureContainer from './StackStructureContainer';

export default function Page() {
  const { renderToastContents, showErrorToast } = useToast();
  const { stackId: stackIdStr } = useParams<{
    stackId: string;
  }>();
  const stackId = parseInt(stackIdStr);
  const [selectedTab, setSelectedTab] = useState('Info');

  const tabs = [
    { name: 'Info' },
    { name: 'Structure' },
    { name: 'Editor' },
    { name: 'Settings' },
  ];

  const {
    data: stack,
    isLoading: loading,
    error: error,
  } = trpc.stack.get.useQuery({
    stackId: stackId,
  });

  useEffect(() => {
    if (error) showErrorToast('스택 정보를 불러오는 중 오류가 발생했습니다.');
  }, [error]);

  return (
    <>
      {renderToastContents()}
      {loading || (!loading && error) ? (
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
              <StackStructureContainer stack={stack!} />
            )}
          </div>
        </div>
      )}
    </>
  );
}