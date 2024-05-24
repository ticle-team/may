'use client';

import React from 'react';
import classNames from 'classnames';
import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import StackInfo from './StackInfo';
import StackStructure from './StackStructure';

export default function Page() {
  const { stack_id: stackIdStr } = useParams<{
    stack_id: string;
  }>();
  const stackId = parseInt(stackIdStr);
  const [selectedTab, setSelectedTab] = React.useState('Info');
  const { data: stack, isLoading } = trpc.stack.get.useQuery({
    stackId: stackId,
  });

  const tabs = [
    { name: 'Info' },
    { name: 'Structure' },
    { name: 'Editor' },
    { name: 'Settings' },
  ];

  return (
    <div className="flex flex-col min-w-[800px] max-w-7xl py-24 items-center">
      {isLoading ? (
        <div>{/* TODO: Implement Loading */}</div>
      ) : (
        <>
          <div className="w-full flex justify-start">
            <div className="font-bold text-3xl my-6">{stack?.name}</div>
          </div>
          <div className="w-full flex flex-col">
            <div className="w-full flex">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
              </nav>
            </div>
            {selectedTab === 'Info' && <StackInfo stack={stack!} />}
            {selectedTab === 'Structure' && <StackStructure stack={stack!} />}
          </div>
        </>
      )}
    </div>
  );
}
