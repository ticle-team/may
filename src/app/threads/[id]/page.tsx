'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import { useParams, useRouter } from 'next/navigation';
import useToast from '@/app/_hooks/useToast';
import { ChatMessage } from '@/models/ai';
import {
  StackCreationEventText,
  StackCreationEventTextCreated,
} from '@/models/assistant';
import UserMessageForm from './UserMessageForm';
import Conversation from './Conversation';
import Button from '@/app/_components/Button';
import { StopIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import StackContainer from './StackContainer';
import { CreatingStackStateInfoJson } from '@/models/thread';

export default function Page() {
  const router = useRouter();
  const { id: threadIdStr } = useParams<{
    id: string;
  }>();
  const threadId = parseInt(threadIdStr);
  const { renderToastContents, showErrorToast, hideToast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [enabledChat, setEnabledChat] = useState(false);
  const utils = trpc.useUtils();

  const thread = trpc.thread.get.useQuery(
    {
      threadId,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );
  if (thread.error) {
    console.error(thread.error);
    showErrorToast('', thread.error.message);
    hideToast(1500);
  }

  const allMessages = trpc.thread.messages.list.useQuery(
    {
      threadId,
      limit: 100,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );
  if (allMessages.error) {
    console.error(allMessages.error);
    showErrorToast('', allMessages.error.message);
    hideToast(1500);
  }

  const run = trpc.thread.runForStackCreation.useQuery(
    {
      threadId,
    },
    {
      enabled: enabledChat,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
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
        switch (event) {
          case 'deploy': {
            await thread.refetch();
            break;
          }
          case 'end': {
            await thread.refetch();
            await allMessages.refetch();
            break;
          }
        }
      }
    })();
  }, [run.data]);

  const cancelThread = trpc.thread.cancel.useMutation({
    onSuccess: async () => {
      await allMessages.refetch();
    },
  });

  const addUserMessage = trpc.thread.messages.add.useMutation({
    onSuccess: async () => {
      await allMessages.refetch();
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
    [threadId, addUserMessage],
  );

  const handleStopAnswering = useCallback(async () => {
    await cancelThread.mutateAsync({ threadId });
  }, [threadId, cancelThread]);

  const { answering, conversation } = useMemo(() => {
    let answering = !addUserMessage.isIdle || run.isLoading;
    const conversation = allMessages.data?.messages.toReversed() || [];

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
  }, [allMessages.data, run.data, addUserMessage.isIdle, run.isLoading]);

  const goToStack = useCallback(() => {
    if (!thread.data) {
      return;
    }

    router.push(`/stacks/${thread.data.shapleStackId}`);
  }, [router, thread.data]);

  const stateInfo = useMemo<CreatingStackStateInfoJson>(() => {
    const defaultStateInfo = {
      current_step: 0,
      name: '',
      description: '',
      dependencies: {
        base_apis: [],
        vapis: [],
      },
    };

    return {
      ...defaultStateInfo,
      ...(thread.data?.stateInfo ?? {}),
    };
  }, [thread.data]);

  return (
    <>
      {renderToastContents()}
      <br />
      {initialized ? (
        <div className="flex flex-row gap-2 px-1 w-full h-full">
          <div className="flex flex-col w-6/12 h-full">
            <div className="flex flex-row w-full h-5/6">
              <Conversation history={conversation}>
                {!answering && thread.data?.shapleStackId && (
                  <div className="flex flex-row -mt-2.5 justify-center">
                    <Button color="success" size="lg" onClick={goToStack}>
                      Go to stack
                    </Button>
                  </div>
                )}
              </Conversation>
            </div>
            <br />
            <div className="flex flex-row w-full">
              <UserMessageForm
                answering={answering}
                onSubmit={handleSubmitUserMessage}
                onStopAnswering={handleStopAnswering}
              />
            </div>
          </div>
          <div className="flex flex-col w-6/12 h-full">
            <div className="flex flex-row w-full h-full justify-center">
              <StackContainer
                showError={(message: string) => showErrorToast('', message)}
                progress={stateInfo.current_step}
                name={stateInfo.name}
                description={stateInfo.description}
                baseApis={stateInfo.dependencies.base_apis}
                vapis={stateInfo.dependencies.vapis}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
