'use client';

import ChatBubble from '@/app/_components/ChatBubble';
import { PaperAirplaneIcon, StopCircleIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState, Suspense } from 'react';
import { trpc } from '@/app/_trpc/client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useToast from '@/app/_hooks/useToast';
import { TRPCError } from '@trpc/server';
import { skipToken } from '@tanstack/react-query';
import { ChatMessage, ChatRole } from '@/models/ai';
import _ from 'lodash';

type PageState = 'initializing' | 'generating' | 'idle';

function UserMessageForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (message: string) => Promise<void>;
}) {
  const [userMessage, setUserMessage] = useState('');
  return (
    <form
      className="flex flex-col w-full"
      onSubmit={(e) => {
        if (disabled || userMessage == '') {
          return;
        }

        e.preventDefault();
        onSubmit(userMessage).then(() => {
          setUserMessage('');
        });
      }}
    >
      <div className="relative mt-2 rounded-md shadow-sm border-none">
        <input
          type="text"
          className="flex flex-row w-full p-4 pr-10 text-white border-none bg-secondary-700 rounded-xl"
          placeholder="Type a message"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={disabled}
        />
        {!disabled && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer disabled:cursor-not-allowed"
            type="submit"
            disabled={disabled}
          >
            <PaperAirplaneIcon
              className="h-5 w-5 text-secondary-400 hover:text-secondary-300 active:text-secondary-500 disabled:text-secondary-400"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </form>
  );
}

function Conversation({
  history: threadMessages,
  assistantText,
}: {
  history: ChatMessage[];
  assistantText: string;
}) {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chatRef.current) {
      return;
    }

    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [threadMessages, assistantText]);

  let history = threadMessages;
  if (assistantText != '' && history.length > 0) {
    history = history.slice(0, history.length - 1);
  }

  return (
    <div className="flex flex-col w-full overflow-y-auto" ref={chatRef}>
      {history.map(({ role, text }, i) => (
        <>
          <ChatBubble
            key={`chat-bubble-${i}`}
            name={role == 'user' ? 'You' : 'Assistant'}
            message={text}
            markdown={role == 'assistant'}
            self={role == 'user'}
            color="secondary"
          />
          <br key={`chat-bubble-blank-${i}`} />
        </>
      ))}
      {assistantText != '' && (
        <ChatBubble
          name="Assistant"
          message={assistantText}
          markdown={true}
          self={false}
          color="secondary"
        />
      )}
    </div>
  );
}

export default function Page() {
  const { thread_id: threadIdStr } = useParams<{
    thread_id: string;
  }>();
  const threadId = parseInt(threadIdStr);

  const { renderToastContents, showErrorToast, hideToast } = useToast();

  const [cancelled, setCancelled] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [assistantTextPieces, setAssistantTextPieces] = useState<
    (string | null)[]
  >([]);

  const listMessages = trpc.thread.messages.list.useInfiniteQuery(
    { threadId, limit: 50 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  if (listMessages.error) {
    showErrorToast('', listMessages.error.message);
    hideToast(1500);
  }

  const getThread = trpc.thread.get.useQuery({
    threadId,
  });
  if (getThread.error) {
    showErrorToast('', getThread.error.message);
    hideToast(1500);
  }

  const run = trpc.thread.runForStackCreation.useQuery(
    userMessage != ''
      ? {
          threadId,
        }
      : skipToken,
  );
  if (run.error) {
    showErrorToast('', run.error.message);
    hideToast(1500);
  }

  const cancelThread = trpc.thread.cancel.useMutation();

  const addUserMessage = trpc.thread.messages.add.useMutation();
  if (addUserMessage.error) {
    showErrorToast('', addUserMessage.error.message);
    hideToast(1500);
  }

  useEffect(() => {
    (async () => {
      try {
        await cancelThread.mutateAsync({ threadId });
      } finally {
        setCancelled(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (assistantTextPieces.length == 0) {
      return;
    }

    if (assistantTextPieces[assistantTextPieces.length - 1] != null) {
      return;
    }

    listMessages.refetch({
      throwOnError: true,
    });

    setUserMessage('');
    setAssistantTextPieces([]);
  }, [assistantTextPieces]);

  useEffect(() => {
    if (!run.data) return;

    let interrupt = false;
    (async () => {
      interrupt = false;
      try {
        for await (const t of run.data) {
          if (interrupt) {
            break;
          }
          switch (t.event) {
            case 'created':
              await listMessages.refetch();
              break;
            case 'text':
              setAssistantTextPieces((val) => {
                return [...val, t.text];
              });
              break;
            default:
              console.log('Not supported event', t);
              break;
          }
        }
      } finally {
        setAssistantTextPieces((val) => [...val, null]);
      }
    })();

    return () => {
      interrupt = true;
    };
  }, [run.data]);

  const handleSubmitUserMessage = async (message: string) => {
    if (message === '') {
      return;
    }

    await addUserMessage.mutateAsync({
      threadId,
      message,
    });
    setUserMessage(message);
  };

  return (
    <>
      {renderToastContents()}
      <br />
      {cancelled && getThread.isSuccess ? (
        <main className="flex flex-col w-11/12 h-full">
          <div className="flex flex-row w-full h-5/6">
            <Suspense fallback={<p>Generating...</p>}>
              <Conversation
                history={[...(listMessages.data?.pages ?? [])]
                  .flatMap((page) => page.messages ?? [])
                  .reverse()}
                assistantText={assistantTextPieces.join('')}
              />
            </Suspense>
          </div>
          <br />
          <div className="flex flex-row w-full">
            <UserMessageForm
              disabled={run.isFetching || run.isLoading}
              onSubmit={handleSubmitUserMessage}
            />
          </div>
        </main>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
