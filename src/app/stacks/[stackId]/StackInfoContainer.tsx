'use client';

import React, { useEffect, useState } from 'react';
import { Stack } from '@/models/stack';
import DialogModal from '@/app/_components/Dialog';
import StackReference from './StackReference';
import StackDescription from './StackDescription';
import StackInstances from './StackInstances';
import { trpc } from '@/app/_trpc/client';
import Modal from '@/app/_components/Modal';
import AddInstanceModal from './AddInstanceModal';
import useToast from '@/app/_hooks/useToast';
import AddReferenceModal from './AddReferenceModal';

type Props = {
  stack: Stack;
};

export default function StackInfoContainer({ stack }: Props) {
  const { renderToastContents, showErrorToast } = useToast();
  const [stackDescription, setStackDescription] = useState<string>(
    stack.description,
  );

  const [showAddReferenceDialog, setShowAddReferenceDialog] =
    useState<boolean>(false);
  const [showAddInstanceDialog, setShowAddInstanceDialog] =
    useState<boolean>(false);
  const [showEditDescriptionDialog, setShowEditDescriptionDialog] =
    useState<boolean>(false);

  const {
    data: { instances, after } = {},
    isLoading: isInstancesQueryLoading,
    error: instancesQueryError,
  } = trpc.stack.instances.list.useQuery({
    stackId: stack.id,
  });

  useEffect(() => {
    if (instancesQueryError) showErrorToast('Failed to load stack instances.');
  }, [instancesQueryError]);

  const handleAddReference = async (title: string, url: string) => {
    // TODO: Implement on reference added
  };

  const handleAddInstance = async (
    zone: string | null,
    name: string | null,
  ) => {
    // TODO: Implement on instance added
  };

  const handleEditDescription = async () => {
    // TODO: Implement edit description feature
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
        open={showEditDescriptionDialog}
        setOpen={setShowEditDescriptionDialog}
        title="Would you like to edit the description?"
        type="confirm"
        confirmText="OK"
        onConfirm={() => handleEditDescription()}
        cancelText="No"
      />
      <div className="mt-5 flex flex-col gap-x-6 gap-y-12">
        <StackDescription
          stack={stack}
          setStackDescription={setStackDescription}
          onClickEditDescBtn={() => setShowEditDescriptionDialog(true)}
        />
        <StackReference
          onClickAddRefBtn={() => setShowAddReferenceDialog(true)}
        />
        <StackInstances
          instances={instances ?? []}
          loading={isInstancesQueryLoading}
          onClickAddInstanceBtn={() => setShowAddInstanceDialog(true)}
        />
      </div>
    </>
  );
}
