import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { PaperAirplaneIcon, StopCircleIcon } from '@heroicons/react/24/outline';

export default function UserMessageForm({
  answering,
  onSubmit,
  onStopAnswering,
  color = 'secondary',
}: {
  answering: boolean;
  onSubmit: (message: string) => Promise<void>;
  onStopAnswering: () => Promise<void> | void;
  color: 'primary' | 'secondary';
}) {
  const [userMessage, setUserMessage] = useState('');
  const [enabled, setEnabled] = useState(true);
  const userInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!answering) {
      setEnabled(true);
    }
  }, [answering]);

  useEffect(() => {
    if (enabled) {
      userInputRef.current?.focus();
    }
  }, [enabled]);

  return (
    <form
      className="flex flex-col w-full"
      onSubmit={(e) => {
        if (answering || userMessage == '') {
          return;
        }

        e.preventDefault();
        setEnabled(false);
        onSubmit(userMessage).finally(() => {
          setUserMessage('');
        });
      }}
    >
      <div className="relative">
        <input
          type="text"
          className={classNames(
            'flex flex-row w-full px-6 py-5 border-none rounded placeholder:text-white text-base',
            {
              'text-gray-400': !enabled,
              'text-white': enabled,
              'bg-secondary-700': color === 'secondary',
              'bg-primary-500 focus:ring-primary-600 focus:ring-1':
                color === 'primary',
            },
          )}
          placeholder="Type a message"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={!enabled}
          ref={userInputRef}
        />
        {enabled ? (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer"
            type="submit"
          >
            <PaperAirplaneIcon
              className={classNames(
                'h-7.5 w-7.5 text-white opacity-75 hover:opacity-100 active:opacity-50',
              )}
            />
          </button>
        ) : (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer"
            type="button"
            onClick={() => {
              onStopAnswering();
            }}
          >
            <StopCircleIcon className="h-7.5 w-7.5 text-white opacity-75 hover:opacity-100 active:opacity-50" />
          </button>
        )}
      </div>
    </form>
  );
}
