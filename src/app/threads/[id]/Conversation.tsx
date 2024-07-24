'use client';

import { ChatMessage } from '@/models/ai';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import ChatBubble from '@/app/_components/ChatBubble';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

export default ({
  history: threadMessages,
  children,
}: PropsWithChildren<{
  history: ChatMessage[];
}>) => {
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  useEffect(() => {
    const { current: $chat } = scrollTargetRef;
    if (!$chat || !autoScroll) {
      return;
    }

    $chat.scroll({ top: $chat.scrollHeight });
  }, [scrollTargetRef, threadMessages, autoScroll]);

  const hasNotHistory = useMemo(
    () => threadMessages.length === 0,
    [threadMessages],
  );

  return (
    <div className="relative flex flex-1 w-full h-full">
      <div
        className="flex flex-col w-full h-full overflow-y-auto gap-6 px-4 py-12"
        ref={scrollTargetRef}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          const isAtBottom =
            Math.ceil(scrollTop + clientHeight) >= scrollHeight;
          setAutoScroll((_) => {
            return isAtBottom;
          });
        }}
      >
        {hasNotHistory && (
          <div className="flex flex-row w-full h-full justify-center">
            <div className="flex flex-col justify-center h-full">
              <div className="relative text-semiblack text-center space-y-2">
                <div className="font-semibold text-3xl">Hello Builder!</div>
                <div className="text-lg">What would you like to build?</div>
              </div>
            </div>
          </div>
        )}
        {threadMessages.map(({ role, text }, i) => (
          <ChatBubble
            key={`chat-bubble-${i}`}
            name={role == 'user' ? 'You' : 'Assistant'}
            message={text}
            markdown={role == 'assistant'}
            self={role == 'user'}
            color="primary"
          />
        ))}
        {children}
        {!autoScroll && (
          <button
            className="absolute top-[calc(100%-3rem)] left-1/2 flex flex-1 w-7 h-7 text-secondary-500 hover:text-secondary-400 focus:text-secondary-600"
            onClick={() => {
              setAutoScroll((_) => {
                return true;
              });
            }}
          >
            <ArrowDownTrayIcon />
          </button>
        )}
      </div>
    </div>
  );
};
