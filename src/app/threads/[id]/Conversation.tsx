'use client';

import { ChatMessage } from '@/models/ai';
import { PropsWithChildren, useEffect, useRef } from 'react';
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

  return (
    <div className="flex flex-col w-full overflow-y-auto gap-4" ref={chatRef}>
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
