'use client';

import ChatBubble from "@/app/_components/ChatBubble";
import {PaperAirplaneIcon} from "@heroicons/react/20/solid";
import {trpc} from "@/app/_trpc/client";
import {useState} from "react";
import {ConversationChunk, ConversationHistory} from "@/types";

export default function Conversation() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([{
    role: 'system',
    text: 'Welcome to the chat!',
  }] as ConversationHistory);
  const [isStartedConversation, setIsStartedConversation] = useState(false);
  const [answer, setAnswer] = useState([] as ConversationChunk[]);
  const chat = trpc.conversation.chat.useMutation();

  trpc.conversation.onChat.useSubscription(undefined, {
    enabled: isStartedConversation,
    onData: ({type, chunk}) => {
      switch (type) {
        case 'continue':
          setAnswer((prev) => {
            return [...prev, chunk!]
              .sort((a, b) => a.sequence - b.sequence);
          })
          break;
        case 'end':
          setAnswer((ans) => {
            const answerText = ans.map(({text}) => text).join('');
            setConversation((prev) => {
              if (prev[prev.length - 1]?.role === 'system') {
                return prev;
              }
              return [...prev, {
                role: 'system',
                text: answerText,
              }];
            });
            return [];
          });
          setIsStartedConversation(false);
          break;
      }
    },
    onError: (err) => {
      console.error(err);
    },
    onStarted: () => {
      console.log('started');
      setAnswer([]);
    },
  });

  const onSendMsg = async () => {
    if (message === '') {
      return;
    }

    console.log('conversation: ', conversation);
    const {history} = await chat.mutateAsync({
      history: conversation,
      message,
    });
    setConversation(history);
    setMessage('');
    setIsStartedConversation(true);
  }

  return (
    <main className="flex flex-col md:container h-full items-center justify-center px-2 py-8">
      <div className="flex flex-row h-full w-full gap-5">
        <div className="flex flex-col justify-center w-1/2 gap-2.5 border p-4 rounded-lg border-gray-100 shadow-md">
          {conversation.map(({role, text}, i) => (
            <ChatBubble key={`history-${i}`} name={role}
                        avatar='/docs/images/people/profile-picture-3.jpg'
                        message={text} self={role != 'system'}/>
          ))}
          {answer.length > 0 && (
            <ChatBubble key={`answer-${answer[0].sequence}`} name='system'
                        avatar='/docs/images/people/profile-picture-3.jpg'
                        message={answer.map(({text}) => text).join('')} self={false}/>
          )}

          <form className="flex flex-col justify-end h-full" onSubmit={(e) => {
            e.preventDefault()
            onSendMsg()
          }}>
            <div className="relative mt-2 rounded-md shadow-sm border-none">
              <input type="text"
                     className="flex flex-row w-full p-4 text-white border-none bg-gray-100 dark:bg-gray-700 rounded-xl"
                     placeholder="Type a message"
                     onChange={(e) => setMessage(e.target.value)}
                     value={message}
              />
              <button className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer" type='submit'>
                <PaperAirplaneIcon className="h-5 w-5 text-gray-400 hover:text-gray-300 active:text-gray-500"
                                   aria-hidden="true"/>
              </button>
            </div>
          </form>
        </div>
        <div className="flex flex-col justify-center w-1/2 gap-2.5 border p-4 rounded-lg border-gray-100 shadow-md">
          Hello
        </div>
      </div>
    </main>
  );
}
