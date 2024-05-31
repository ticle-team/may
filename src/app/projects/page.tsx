'use client';

import React, { useEffect, useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import Button from '@/app/_components/Button';
import classNames from 'classnames';
import Modal from '@/app/_components/Modal';
import CreateProjectModal from '@/app/projects/CreateProjectModal';
import useToast from '@/app/_hooks/useToast';
import DialogModal from '@/app/_components/Dialog';
import { useRouter } from 'next/navigation';
import StackItem from '@/app/projects/StackItem';
import ProjectItem from '@/app/projects/ProjectItem';

export default function Page() {
  const tabs = [{ name: '전체' }, { name: '관심' }, { name: '아카이브' }];
  // TODO : orgID must be changed.
  const organizationId = 1;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const { renderToastContents, showErrorToast } = useToast();
  const utils = trpc.useUtils();
  const router = useRouter();

  const [showCreateProjectDialog, setShowCreateProjectDialog] =
    useState<boolean>(false);
  const [showCreateStackDialog, setShowCreateStackDialog] =
    useState<boolean>(false);

  const { data: { projects, after } = {}, error } =
    trpc.org.projects.list.useQuery({
      orgId: organizationId,
      page: 1,
      perPage: 10,
    });

  const createProjectMutation = trpc.project.create.useMutation();
  const createThreadMutation = trpc.thread.create.useMutation();

  const handleCreateProject = async (name: string, description: string) => {
    if (createProjectMutation.isPending || !name || !description) return;
    try {
      await createProjectMutation.mutateAsync({
        orgId: organizationId,
        name: name,
        description: description,
      });
      setShowCreateProjectDialog(false);

      utils.org.projects.list.invalidate();
    } catch (error) {
      console.error(error);
      showErrorToast('프로젝트 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCreateStack = async () => {
    if (createThreadMutation.isPending || !selectedProjectId) return;
    try {
      const { id: threadId } = await createThreadMutation.mutateAsync({
        projectId: selectedProjectId,
      });

      router.push(`/threads/${threadId}`);
    } catch (error) {
      console.error(error);
      showErrorToast('스택 생성 중 오류가 발생했습니다.');
    }
  };

  const handleClickTab = async (tabName: string) => {
    if (selectedTab === tabName) return;
    setSelectedTab(tabName);

    await utils.org.projects.list.invalidate();
  };

  const handleClickProject = (projectId: number) => {
    if (selectedProjectId === projectId) {
      return setSelectedProjectId(null);
    }
    setSelectedProjectId(projectId);
  };

  const handleClickStack = (stackId: number) => {
    router.push(`/projects/stack/${stackId}`);
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
      <DialogModal
        open={showCreateStackDialog}
        setOpen={() => {
          setShowCreateStackDialog(false);
        }}
        title="스택을 생성하시겠습니까?"
        type="confirm"
        confirmText="Create"
        onConfirm={handleCreateStack}
        cancelText="Cancel"
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
          <div className="flex flex-col" role="list">
            {projects?.map((project) => (
              <ProjectItem
                key={`project-${project.id}`}
                project={project}
                expand={selectedProjectId === project.id}
                onClick={handleClickProject}
              >
                <div className="flex flex-col" role="list">
                  <div
                    className="relative flex justify-center gap-x-6 px-4 py-2 ml-20 hover:bg-gray-50 sm:px-6 lg:px-8 hover:cursor-pointer"
                    onClick={() => setShowCreateStackDialog(true)}
                  >
                    <div className="font-normal text-sm text-primary-500">
                      Create Stack
                    </div>
                  </div>
                  {project?.stacks?.map((stack) => (
                    <StackItem
                      key={`stack-${stack.id}`}
                      stack={stack}
                      onClick={handleClickStack}
                    />
                  ))}
                </div>
              </ProjectItem>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
