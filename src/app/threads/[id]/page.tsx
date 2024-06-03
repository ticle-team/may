'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { trpc } from '@/app/_trpc/client';
import { useParams } from 'next/navigation';
import useToast from '@/app/_hooks/useToast';
import { ChatMessage, ChatRole } from '@/models/ai';
import {
  StackCreationEventText,
  StackCreationEventTextCreated,
} from '@/models/assistant';
import UserMessageForm from './UserMessageForm';
import Conversation from './Conversation';

export default function Page() {
  const { id: threadIdStr } = useParams<{
    id: string;
  }>();
  const threadId = parseInt(threadIdStr);
  const { renderToastContents, showErrorToast, hideToast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [enabledChat, setEnabledChat] = useState(false);

  const getAllMessages = trpc.thread.messages.list.useQuery({
    threadId,
    limit: 100,
  });
  if (getAllMessages.error) {
    console.error(getAllMessages.error);
    showErrorToast('', getAllMessages.error.message);
    hideToast(1500);
  }

  const run = trpc.thread.runForStackCreation.useQuery(
    {
      threadId,
    },
    {
      enabled: enabledChat,
    },
  );
  if (run.error) {
    console.error(run.error);
    showErrorToast('', run.error.message);
    hideToast(1500);
  }

  useEffect(() => {
    // run.data is an array of events
    // for example:
    //   events: begin -> text.created -> text -> text -> text.done -> end
    //   server sent events: begin, text.created, ...
    //   client states: [begin], [begin, text.created], [begin, text.created, text], ...
    if (!run.data) return;

    (async () => {
      for (const { event } of run.data) {
        if (event == 'end') {
          await getAllMessages.refetch();
          break;
        }
      }
    })();
  }, [run.data]);

  const cancelThread = trpc.thread.cancel.useMutation({
    onSuccess: async () => {
      await getAllMessages.refetch();
    },
  });

  const addUserMessage = trpc.thread.messages.add.useMutation({
    onSuccess: async () => {
      await getAllMessages.refetch();
      setEnabledChat(true);
      await run.refetch();
    },
    onError: (error) => {
      showErrorToast('', error.message);
      hideToast(1500);
    },
  });

  useEffect(() => {
    (async () => {
      await cancelThread.mutateAsync({ threadId });
      setInitialized(true);
    })();
  }, [threadId]);

  const handleSubmitUserMessage = useCallback(
    async (message: string) => {
      if (message === '') {
        return;
      }

      await addUserMessage.mutateAsync({
        threadId,
        message,
      });
    },
    [threadId],
  );

  const handleStopAnswering = useCallback(async () => {
    await cancelThread.mutateAsync({ threadId });
  }, [threadId]);

  const { answering, conversation } = useMemo(() => {
    let answering = !addUserMessage.isIdle || run.isLoading;
    const conversation = getAllMessages.data?.messages.toReversed() || [];

    if (!run.data) {
      return {
        answering,
        conversation,
      };
    }

    let lastMessages: ChatMessage[] = [];
    for (const t of run.data) {
      switch (t.event) {
        case 'text.created': {
          const { id } = t as StackCreationEventTextCreated;
          lastMessages = [
            ...lastMessages,
            { id: id, role: 'assistant', text: '' },
          ];
          break;
        }
        case 'text': {
          const { id, text } = t as StackCreationEventText;
          const lastMsg = lastMessages[lastMessages.length - 1];
          if (lastMsg.id != id) {
            throw new Error(
              `Unexpected message ID: ${id}, lastMsg.id: ${lastMsg.id}`,
            );
          }
          lastMsg.text += text;
          answering = true;
          break;
        }
        case 'end': {
          answering = false;
          break;
        }
      }
    }

    conversation.push(
      ...lastMessages.filter(({ id }) => {
        return conversation.findIndex((msg) => msg.id === id) === -1;
      }),
    );

    return {
      answering,
      conversation,
    };
  }, [getAllMessages.data, run.data, addUserMessage.isIdle, run.isLoading]);

  return (
    <>
      {renderToastContents()}
      <br />
      {initialized ? (
        <main className="flex flex-col w-11/12 h-full">
          <div className="flex flex-row w-full h-5/6">
            <Conversation history={conversation} />
          </div>
          <br />
          <div className="flex flex-row w-full">
            <UserMessageForm
              answering={answering}
              onSubmit={handleSubmitUserMessage}
              onStopAnswering={handleStopAnswering}
            />
          </div>
        </main>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
