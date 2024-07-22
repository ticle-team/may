'use client';

import { ChatMessage } from '@/models/ai';
import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import ChatBubble from '@/app/_components/ChatBubble';

export default function Conversation({
  history: threadMessages,
  children,
}: PropsWithChildren<{
  history: ChatMessage[];
}>) {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chatRef.current) {
      return;
    }

    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [threadMessages]);

  const hasNotHistory = useMemo(
    () => threadMessages.length === 0,
    [threadMessages],
  );

  return (
    <div
      className="flex flex-col w-full h-full overflow-y-auto gap-6 px-4 py-12"
      ref={chatRef}
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
    </div>
  );
}
