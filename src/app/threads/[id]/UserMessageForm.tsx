'use client';
import { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon, StopCircleIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

export default function UserMessageForm({
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
          className={classNames(
            'flex flex-row w-full p-4 pr-10 border-none bg-secondary-700 rounded-xl',
            {
              'text-gray-400': answering,
              'text-white': !answering,
            },
          )}
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
