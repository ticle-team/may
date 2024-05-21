'use client';

import React from 'react';
import { Button } from '@/app/_components/Button';
import { useRouter } from 'next/navigation';
import { trpc } from '@/app/_trpc/client';

export default function Page() {
  const router = useRouter();
  const createThread = trpc.thread.create.useMutation();

  return (
    <div className="flex flex-col w-4/6 items-center">
      <br />
      <div className="prose">
        <h1>Projects</h1>
      </div>
      <br />

      <Button
        color="primary"
        onClick={async () => {
          const { id: threadId } = await createThread.mutateAsync({
            projectId: BigInt(1),
          });
          router.push(`/threads/${threadId}`);
        }}
      >
        Create Thread
      </Button>
    </div>
  );
}
