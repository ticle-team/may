'use client';

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import StackInfo from '@/app/projects/stack/[stack_id]/StackInfo';
import StackStructure from '@/app/projects/stack/[stack_id]/StackStructure';
import useToast from '@/app/_hooks/useToast';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import Modal from '@/app/_components/Modal';
import AddReferenceModal from '@/app/projects/stack/[stack_id]/AddReferenceModal';
import AddInstanceModal from '@/app/projects/stack/[stack_id]/AddInstanceModal';
import DialogModal from '@/app/_components/Dialog';
import { VapiRelease } from '@/models/vapi';
import VapiDetail from '@/app/projects/stack/[stack_id]/VapiDetail';
import { getVapiDocs } from '@/util/utils';

export default function Page() {
  const { renderToastContents, showErrorToast } = useToast();
  const { stack_id: stackIdStr } = useParams<{
    stack_id: string;
  }>();
  const stackId = parseInt(stackIdStr);
  const [selectedTab, setSelectedTab] = useState('Info');
  const [selectedVapi, setSelectedVapi] = useState<VapiRelease | null>(null);
  const [vapiDocsContent, setVapiDocsContent] = useState<string | null>(null);
  const [isVapiDocsloading, setIsVapiDocsLoading] = useState<boolean>(false);
  const [showAddInstanceDialog, setShowAddInstanceDialog] =
    useState<boolean>(false);
  const [showAddReferenceDialog, setShowAddReferenceDialog] =
    useState<boolean>(false);
  const [confirmDialogType, setConfirmDialogType] = useState<string>('');
  const [confirmDialogTitle, setConfirmDialogTitle] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
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

  const {
    data: { instances, after } = {},
    isLoading: isInstancesQueryLoading,
    error: instancesQueryError,
  } = trpc.stack.instances.list.useQuery({
    stackId: stackId,
  });

  useEffect(() => {
    if (stackQueryError)
      showErrorToast('스택 정보를 불러오는 중 오류가 발생했습니다.');
  }, [stackQueryError]);

  useEffect(() => {
    if (instancesQueryError)
      showErrorToast('인스턴스 목록을 불러오는 중 오류가 발생했습니다.');
  }, [instancesQueryError]);

  const handleClickVapi = (vapi: VapiRelease | null) => {
    setVapiDocsContent(null);
    if (selectedVapi === vapi) {
      return setSelectedVapi(null);
    }
    setSelectedVapi(vapi);

    if (!vapi) return;
    fetchVapiDocs(vapi);
  };

  const fetchVapiDocs = async (vapi: VapiRelease) => {
    if (isVapiDocsloading || !vapi.pkg || !stack) return;

    try {
      setIsVapiDocsLoading(true);
      const result = await getVapiDocs({
        vapiName: vapi.pkg.name,
        githubRepo: stack.githubRepo,
        githubBranch: stack.githubBranch ?? 'main',
        // TODO: Implement githubAccessToken fetch feature
        githubAccessToken: '',
      });

      if (!result) return;
      setVapiDocsContent(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVapiDocsLoading(false);
    }
  };

  const handleAddInstance = async (zone: string, name: string) => {
    // TODO: Implement on instance added
  };

  const handleAddReference = async (title: string, url: string) => {
    // TODO: Implement on reference added
  };

  const handleEditDescription = async () => {
    // TODO: Implement edit description feature
  };

  const handleVapiUninstall = () => {
    // TODO: Implement VAPI uninstall feature
  };

  const openConfirmDialog = (type: string) => {
    switch (type) {
      case 'editDesc':
        setConfirmDialogType('editDesc');
        setConfirmDialogTitle('Description을 수정하시겠습니까?');
        setShowConfirmDialog(true);
        break;
      case 'deleteVapi':
        setConfirmDialogType('deleteVapi');
        setConfirmDialogTitle('VAPI를 삭제하시겠습니까?');
        setShowConfirmDialog(true);
        break;
    }
  };

  const handleConfirmDialog = () => {
    switch (confirmDialogType) {
      case 'editDesc':
        handleEditDescription();
        break;
      case 'deleteVapi':
        handleVapiUninstall();
        break;
    }
  };

  return (
    <>
      {renderToastContents()}
      <Modal
        open={showAddReferenceDialog}
        setOpen={setShowAddReferenceDialog}
        contents={
          <AddReferenceModal
            onCancel={() => {
              setShowAddReferenceDialog(false);
            }}
            onAdd={handleAddReference}
          />
        }
      />
      <Modal
        open={showAddInstanceDialog}
        setOpen={setShowAddInstanceDialog}
        contents={
          <AddInstanceModal
            onCancel={() => {
              setShowAddInstanceDialog(false);
            }}
            onAdd={handleAddInstance}
          />
        }
      />
      <DialogModal
        open={showConfirmDialog}
        setOpen={setShowConfirmDialog}
        title={confirmDialogTitle}
        type="confirm"
        confirmText="Confirm"
        onConfirm={() => handleConfirmDialog()}
        cancelText="Cancel"
      />
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
            {selectedTab === 'Info' && (
              <StackInfo
                stack={stack!}
                instances={instances ?? []}
                loading={isInstancesQueryLoading}
                onClickAddInstanceBtn={() => setShowAddInstanceDialog(true)}
                onClickAddRefBtn={() => setShowAddReferenceDialog(true)}
                onClickEditDescBtn={() => openConfirmDialog('editDesc')}
              />
            )}
            {selectedTab === 'Structure' && (
              <StackStructure stack={stack!} onClickVapi={handleClickVapi}>
                <VapiDetail
                  loading={isVapiDocsloading}
                  docsContent={vapiDocsContent ?? null}
                  vapi={selectedVapi}
                  onClickUninstallVapiBtn={() =>
                    openConfirmDialog('deleteVapi')
                  }
                />
              </StackStructure>
            )}
          </div>
        </div>
      )}
    </>
  );
}
