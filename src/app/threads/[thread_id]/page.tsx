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
import delay from 'delay';

type PageState = 'initializing' | 'generating' | 'idle';

function UserMessageForm({
  answering,
  onSubmit,
  onStopAnswering,
}: {
  answering: boolean;
  onSubmit: (message: string) => Promise<void>;
  onStopAnswering: () => Promise<void>;
}) {
  const [userMessage, setUserMessage] = useState('');
  const userInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!answering) {
      userInputRef.current?.focus();
    }
  }, [answering]);

  return (
    <form
      className="flex flex-col w-full"
      onSubmit={(e) => {
        if (answering || userMessage == '') {
          return;
        }

        e.preventDefault();
        onSubmit(userMessage).finally(() => {
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
          disabled={answering}
          ref={userInputRef}
        />
        {!answering ? (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer disabled:cursor-not-allowed"
            type="submit"
          >
            <PaperAirplaneIcon
              className="h-5 w-5 text-secondary-400 hover:text-secondary-300 active:text-secondary-500 disabled:text-secondary-400"
              aria-hidden="true"
            />
          </button>
        ) : (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer disabled:cursor-not-allowed"
            type="button"
            onClick={() => {
              onStopAnswering();
            }}
          >
            <StopCircleIcon
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
  answering = false,
}: {
  history: ChatMessage[];
  assistantText: string;
  answering: boolean;
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
      {answering && (
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

  const [Initialized, setInitialized] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answering, setAnswering] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const getAllMessages = trpc.thread.messages.list.useQuery({
    threadId,
    limit: 100,
  });
  if (getAllMessages.error) {
    showErrorToast('', getAllMessages.error.message);
    hideToast(1500);
  }
  useEffect(() => {
    if (!getAllMessages.data) {
      return;
    }

    setChatMessages(getAllMessages.data.messages);
  }, [getAllMessages.data]);

  const getThread = trpc.thread.get.useQuery({
    threadId,
  });
  if (getThread.error) {
    showErrorToast('', getThread.error.message);
    hideToast(1500);
  }

  const run = trpc.thread.runForStackCreation.useQuery(
    answering
      ? {
          threadId,
        }
      : skipToken,
  );
  if (run.error) {
    showErrorToast('', run.error.message);
    hideToast(1500);
  }

  useEffect(() => {
    if (!run.data) return;

    let interrupt = false;
    (async () => {
      try {
        interrupt = false;
        for await (const t of run.data) {
          if (interrupt) {
            break;
          }
          switch (t.event) {
            case 'text':
              setAnswer((val) => {
                return val + t.text;
              });
              break;
          }
        }
      } finally {
        setAnswer('');
        setAnswering(false);
      }
    })();

    return () => {
      interrupt = true;
    };
  }, [run.data]);

  const cancelThread = trpc.thread.cancel.useMutation();

  const addUserMessage = trpc.thread.messages.add.useMutation();
  if (addUserMessage.error) {
    showErrorToast('', addUserMessage.error.message);
    hideToast(1500);
  }

  useEffect(() => {
    cancelThread.mutateAsync({ threadId }).finally(() => {
      setInitialized(true);
    });
  }, []);

  const handleSubmitUserMessage = async (message: string) => {
    if (message === '') {
      return;
    }

    await addUserMessage.mutateAsync({
      threadId,
      message,
    });
    setAnswering(true);
  };

  const handleStopAnswering = async () => {
    await cancelThread.mutateAsync({ threadId });
    setAnswering(false);
  };

  return (
    <>
      {renderToastContents()}
      <br />
      {Initialized && getThread.isSuccess ? (
        <main className="flex flex-col w-11/12 h-full">
          <Suspense fallback={<p>Generating...</p>}>
            <div className="flex flex-row w-full h-5/6">
              <Conversation
                history={[...(getAllMessages.data?.pages ?? [])]
                  .flatMap((page) => page.messages ?? [])
                  .reverse()}
                assistantText={answer}
                answering={answering}
              />
            </div>
            <br />
            <div className="flex flex-row w-full">
              <UserMessageForm
                answering={answering}
                onSubmit={handleSubmitUserMessage}
                onStopAnswering={handleStopAnswering}
              />
            </div>
          </Suspense>
        </main>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
