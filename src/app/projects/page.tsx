'use client';

import React, { useEffect, useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Button from '@/app/_components/Button';
import classNames from 'classnames';
import Modal from '@/app/_components/Modal';
import CreateProjectModal from '@/app/projects/CreateProjectModal';
import useToast from '@/app/_hooks/useToast';
import { Project } from '@/models/project';
import ProjectList from '@/app/projects/ProjectList';
import { TRPCClientErrorLike } from '@trpc/client';

export default function Page() {
  const tabs = [{ name: '전체' }, { name: '관심' }, { name: '아카이브' }];
  // TODO : orgID must be changed.
  const organizationId = 1;
  const [selectedTab, setSelectedTab] = useState('전체');
  const { renderToastContents, showErrorToast } = useToast();
  const utils = trpc.useUtils();
  const [showCreateProjectDialog, setShowCreateProjectDialog] =
    useState<boolean>(false);

  const { data: { projects, after } = {}, error } =
    trpc.org.projects.list.useQuery({
      orgId: organizationId,
      page: 1,
      perPage: 10,
    });

  const createProjectMutation = trpc.project.create.useMutation({
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      console.error(error);
      showErrorToast('프로젝트 생성 중 오류가 발생했습니다.');
    },
  });

  const handleCreateProject = async (name: string, description: string) => {
    // TODO: Implement create project feature
    const createResult = await createProjectMutation.mutateAsync({
      orgId: organizationId,
      name: name,
      description: description,
    });
    if (!createResult) return;

    projects?.push(createResult);
    setShowCreateProjectDialog(false);
  };

  const handleClickTab = async (tabName: string) => {
    if (selectedTab === tabName) return;
    setSelectedTab(tabName);

    await utils.org.projects.list.invalidate();
  };

  const handleThreadCreateError = (error: TRPCClientErrorLike<any>) => {
    showErrorToast('스택 생성 중 오류가 발생했습니다.');
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
            organizationId={organizationId}
            onCancel={() => {
              setShowCreateProjectDialog(false);
            }}
            onCreate={handleCreateProject}
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
          <ProjectList
            rows={projects ?? []}
            handleThreadCreateError={handleThreadCreateError}
          />
        </div>
      </div>
    </>
  );
}
