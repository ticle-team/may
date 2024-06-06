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
    <div className="flex flex-col w-full overflow-y-auto gap-4" ref={chatRef}>
      {hasNotHistory && (
        <div className="flex flex-row w-full h-full justify-center">
          <div className="flex flex-col justify-center h-full">
            <div className="relative -top-1/4 prose prose-base">
              <h2>
                Hello.
                <br />
                <br />
                What kind of service do you want to create!
              </h2>
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
          color="secondary"
        />
      ))}
      {children}
    </div>
  );
}
