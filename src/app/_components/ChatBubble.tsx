import classNames from "classnames";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {UserIcon, GlobeAltIcon} from '@heroicons/react/20/solid';

type ChatBubbleProps = {
  self?: boolean;
  name: string;
  time?: string;
  message: string;
  markdown: boolean;
}

function ChatBubble({
                      self = false,
                      name,
                      time,
                      message,
                      markdown = false,
                    }: ChatBubbleProps) {
  const Icon = self ? UserIcon : GlobeAltIcon;

  return (
    <div className={classNames("flex gap-2.5 w-full", {
      "flex-row items-start": !self,
      "flex-row-reverse items-end": self,
    })}>
      <Icon className="w-8 h-8 rounded-full" />
      <div
        className={classNames("flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 dark:bg-gray-700", {
          "rounded-e-xl rounded-es-xl": !self,
          "rounded-s-xl rounded-se-xl": self,
        })}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
          {time && <time className="text-sm font-normal text-gray-500 dark:text-gray-400">{time}</time>}
        </div>
        <div className="prose prose-invert">
        {
          markdown ?
          <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}]]}>
            {message}
          </Markdown> :
          <p>
            {message}
          </p>
        }
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;