import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

type Props = {
  hidden?: boolean;
  hideSideMenu?: boolean;
};

export default function ChatBar({ hidden = true, hideSideMenu = true }: Props) {
  const chatBarClass = classNames({
    'flex w-full justify-center mt-5': true,
    'fixed bottom-5 left-0 right-0 z-40': true,
    'pl-72': !hideSideMenu,
    hidden: hidden,
  });

  return (
    <div className={chatBarClass}>
      <div className="flex w-full max-w-[1000px] mt-2 mx-10 rounded-md shadow-sm border-none relative">
        <input
          type="text"
          className="flex w-full p-4 pr-10 text-white border-none bg-gray-100 dark:bg-gray-700 rounded-xl"
          placeholder="Type a message"
        />
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer"
          type="submit"
        >
          <PaperAirplaneIcon
            className="h-5 w-5 text-gray-400 hover:text-gray-300 active:text-gray-500"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
