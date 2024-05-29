import { useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';
import { Stack } from '@/models/stack';
import Badge from '@/app/_components/Badge';
import { TRPCClientErrorLike } from '@trpc/client';
import DialogModal from '../_components/Dialog';
import { useState } from 'react';

type Props = {
  projectId: number;
  rows: Stack[];
  handleThreadCreateError: (error: TRPCClientErrorLike<any>) => void;
};

const StackList = ({ projectId, rows, handleThreadCreateError }: Props) => {
  const [showCreateStackDialog, setShowCreateStackDialog] =
    useState<boolean>(false);
  const router = useRouter();
  const createThreadMutation = trpc.thread.create.useMutation({
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      console.error(error);
      handleThreadCreateError(error);
    },
  });

  const handleCreateStack = async () => {
    const { id: threadId } = await createThreadMutation.mutateAsync({
      projectId: projectId,
    });

    router.push(`/threads/${threadId}`);
  };

  const handleStackClick = (stackId: number) => {
    router.push(`/projects/stack/${stackId}`);
  };

  return (
    <>
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
      <div role="list">
        <div
          className="relative flex justify-center gap-x-6 px-4 py-2 ml-20 hover:bg-gray-50 sm:px-6 lg:px-8 hover:cursor-pointer"
          onClick={() => setShowCreateStackDialog(true)}
        >
          <div className="font-normal text-sm text-primary-500">
            Create Stack
          </div>
        </div>
        {rows.map((stack) => (
          <div
            key={`stack-${stack.id}`}
            className="relative flex justify-between gap-x-6 px-4 py-5 ml-20 border-t border-gray-100 hover:bg-gray-50 sm:px-6 lg:px-8  hover:cursor-pointer"
            onClick={() => {
              handleStackClick(stack.id);
            }}
          >
            <div className="flex gap-x-5">
              <div>{stack.name}</div>
              <div>{stack.description}</div>
            </div>
            <Badge color="blue">Blue</Badge>
          </div>
        ))}
      </div>
    </>
  );
};

export default StackList;
