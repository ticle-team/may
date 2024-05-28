'use client';

import React, { useEffect, useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Button from '@/app/_components/Button';
import classNames from 'classnames';
import {
  ClipboardDocumentIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import StackList from './StackList';
import Modal from '@/app/_components/Modal';
import CreateProjectModal from '@/app/projects/CreateProjectModal';
import useToast from '@/app/_hooks/useToast';

export default function Page() {
  const [selectedTab, setSelectedTab] = useState('전체');
  const utils = trpc.useUtils();
  // TODO : orgID must be changed.
  const { data: { projects, after } = {}, error } =
    trpc.org.projects.list.useQuery({ orgId: 1, limit: 10 });

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [showCreateProjectDialog, setShowCreateProjectDialog] =
    useState<boolean>(false);
  const { renderToastContents, showErrorToast } = useToast();

  const tabs = [{ name: '전체' }, { name: '관심' }, { name: '아카이브' }];

  const handleClickProject = (projectId: number) => {
    if (selectedProjectId === projectId) {
      return setSelectedProjectId(null);
    }
    setSelectedProjectId(projectId);
  };

  const onProjectCreated = () => {
    // TODO: Implement on project created
  };

  const handleClickTab = async (tabName: string) => {
    if (selectedTab === tabName) return;
    setSelectedTab(tabName);

    await utils.org.projects.list.invalidate();
  };

  useEffect(() => {
    if (error)
      showErrorToast('프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
  }, [error]);

  return (
    <>
      {renderToastContents()}
      <Modal
        open={showCreateProjectDialog}
        setOpen={setShowCreateProjectDialog}
        contents={
          <CreateProjectModal
            onCancel={() => {
              setShowCreateProjectDialog(false);
            }}
            onCreated={onProjectCreated}
          />
        }
      />
      <div className="flex flex-col min-w-[800px] max-w-7xl py-24 items-center">
        <div className="w-full flex flex-col">
          <div className="w-full flex justify-between border-b border-gray-200">
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
                    handleClickTab(tab.name);
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className="flex items-center">
              <Button
                color="primary"
                onClick={() => setShowCreateProjectDialog(true)}
              >
                프로젝트 생성
              </Button>
            </div>
          </div>
          <div>
            <div role="list">
              {projects?.map((project) => (
                <div key={`project-${project.id}`}>
                  <div
                    className="relative flex justify-between gap-x-6 px-4 py-5 border-y border-gray-100 hover:bg-gray-50 sm:px-6 lg:px-8"
                    onClick={() => {
                      handleClickProject(project.id);
                    }}
                  >
                    <div className="flex min-w-0 items-center">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {project.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-x-4">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <StarIcon className="h-5 w-5 text-primary-500" />
                      <ClipboardDocumentIcon className="h-5 w-5 text-primary-500" />
                    </div>
                  </div>
                  {project.id === selectedProjectId && (
                    <StackList rows={project.stacks} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
