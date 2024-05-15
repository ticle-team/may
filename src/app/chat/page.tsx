'use client';

import ChatBubble from '@/app/_components/ChatBubble';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/20/solid';
import { trpc } from '@/app/_trpc/client';
import { useEffect, useRef, useState } from 'react';
import { RecommendFunctionsSummary } from '@/types';
import Badge from '@/app/_components/Badge';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import useToast from '@/app/_hooks/useToast';

const STORAGE_KEY_ROOM_ID = 'shaple-builder-web.room-id';

export default function Page() {
  const [serviceDetail, setServiceDetail] = useState('');
  const [serviceSummary, setServiceSummary] =
    useState<RecommendFunctionsSummary | null>(null);
  const [userInput, setUserInput] = useState('');
  const questionRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const { renderToastContents, showErrorToast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [roomId, setRoomId] = useState(0);

  const room = trpc.conversation.getRoom.useQuery({ roomId });
  const openRoom = trpc.conversation.openRoom.useMutation({
    onSuccess: ({ roomId }) => {
      if (window !== undefined) {
        window.localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId.toString());
      }
      setRoomId(roomId);
    },
    onError: (err) => {
      showErrorToast('failed to open room', err.message);
    },
  });

  trpc.conversation.recommendServices.useSubscription(
    { roomId, userInput },
    {
      enabled: roomId !== 0 && userInput !== '',
      onData: (data) => {
        switch (data.type) {
          case 'summary':
            setServiceSummary(data);
            break;
          case 'detail':
            setServiceDetail((prevState) => {
              return prevState + data.chunk;
            });
            break;
          case 'end':
            room
              .refetch()
              .then(() => {
                setServiceDetail('');
                setUserInput(''); // reset userInput
              })
              .catch((err) => {
                console.error(err);
              });
            break;
        }
        questionRef.current?.scrollIntoView({
          behavior: 'auto',
        });
      },
      onError: (err) => {
        showErrorToast('Websocket Error', err.message);
      },
      onStarted: () => {
        console.log('onStarted');
        setServiceSummary(null);
        setServiceDetail('');
      },
    },
  );

  useEffect(() => {
    const doIt = async () => {
      const roomIdStr = localStorage.getItem(STORAGE_KEY_ROOM_ID);
      if (roomIdStr) {
        setRoomId(Number.parseInt(roomIdStr, 10));
      } else {
        await openRoom.mutateAsync();
      }
      setInitialized(true);
    };
    doIt().catch((err) => {
      console.error(err);
    });
  }, []);

  useEffect(() => {
    if (!room.isSuccess) {
      return;
    }
    const { history } = room.data!;
    if (history.length === 0) {
      return;
    }

    const lastTurn = history[history.length - 1];
    if (lastTurn.recommendFunctionsSummary) {
      setServiceSummary(lastTurn.recommendFunctionsSummary);
    }
  }, [room]);

  return (
    <>
      {renderToastContents()}
      <div className="flex flex-col w-full h-full justify-center">
        <header className="flex flex-row h-16 w-full bg-gray-100 dark:bg-gray-800 px-8">
          <h1 className="flex flex-row items-center text-2xl font-bold text-gray-800 dark:text-gray-200">
            Shaple Builder
            {roomId != 0 && <> - Room #{roomId}</>}
          </h1>
          <div className="flex flex-row items-center ml-auto gap-2 dark:text-white">
            <button
              className="flex flex-1 items-center rounded-lg bg-indigo-300 hover:bg-indigo-200 hover:dark:bg-indigo-600 dark:bg-indigo-700 py-2 px-4 gap-2"
              onClick={() => {
                openRoom.mutate();
              }}
            >
              Create Room
              <PlusIcon
                className="h-5 w-5 rounded-full dark:text-black dark:bg-white"
                aria-hidden="true"
              />
            </button>
          </div>
        </header>
        <main className="flex flex-row h-full md:container gap-5 p-2">
          <div className="flex flex-col justify-center w-1/2 gap-2.5 border px-4 py-2 rounded-lg border-gray-100 shadow-md h-full overflow-y-auto">
            <ChatBubble
              name="assistant"
              message="만들고자 하는 서비스를 한줄로 설명하세요. API를 만들어드릴게요."
              self={false}
              markdown={false}
            />
            {room.isSuccess &&
              (room.data?.history ?? []).map(({ userInput, botAnswer }, i) => (
                <>
                  <ChatBubble
                    key={`chat-${i}-user`}
                    name="user"
                    message={userInput}
                    self={true}
                    markdown={false}
                  />
                  {botAnswer && (
                    <ChatBubble
                      key={`chat-${i}-assistant`}
                      name="assistant"
                      message={botAnswer ?? ''}
                      self={false}
                      markdown={true}
                    />
                  )}
                </>
              ))}
            {!initialized && <LoadingSpinner />}
            {userInput !== '' && (
              <ChatBubble
                name="user"
                message={userInput}
                self={true}
                markdown={false}
              />
            )}
            {serviceDetail !== '' && (
              <ChatBubble
                name="assistant"
                message={serviceDetail}
                self={false}
                markdown={true}
              />
            )}

            <form
              className="flex flex-col justify-end h-full"
              onSubmit={(e) => {
                e.preventDefault();
                if (message === '') {
                  return;
                }

                setMessage('');
                setUserInput(message);
              }}
            >
              <div className="relative mt-2 rounded-md shadow-sm border-none">
                <input
                  type="text"
                  className="flex flex-row w-full p-4 pr-10 text-white border-none bg-gray-100 dark:bg-gray-700 rounded-xl"
                  placeholder="Type a message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  ref={questionRef}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer"
                  type="submit"
                  disabled={userInput !== ''}
                >
                  <PaperAirplaneIcon
                    className="h-5 w-5 text-gray-400 hover:text-gray-300 active:text-gray-500"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>
          </div>
          <div className="flex flex-col justify-center w-1/2 gap-2.5 border p-4 rounded-lg border-gray-100 shadow-md">
            {serviceSummary !== null && (
              <>
                <div className="flex flex-row gap-2.5">
                  <span>function groups: </span>
                  <span className="flex flex-row gap-2">
                    {serviceSummary.functionGroups.map((fg, i) => (
                      <Badge key={`fg-${i}`}>{fg}</Badge>
                    ))}
                  </span>
                </div>
                <div className="flex flex-row gap-2.5">
                  <span>functions: </span>
                  <span className="flex flex-row gap-2 w-full flex-wrap">
                    {serviceSummary.functions.map((f, i) => (
                      <Badge key={`f-${i}`} className="max-w-sm">
                        {f}
                      </Badge>
                    ))}
                  </span>
                </div>
              </>
            )}
            {!initialized && <LoadingSpinner />}
          </div>
        </main>
      </div>
    </>
  );
}
