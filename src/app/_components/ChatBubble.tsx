import classNames from 'classnames';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserIcon, GlobeAltIcon } from '@heroicons/react/20/solid';

type ChatBubbleProps = {
  self?: boolean;
  name: string;
  time?: string;
  message: string;
  markdown: boolean;
  color: 'primary' | 'secondary';
};

function ChatBubble({
  self = false,
  name,
  time,
  message,
  markdown = false,
  color = 'primary',
}: ChatBubbleProps) {
  const Icon = self ? UserIcon : GlobeAltIcon;
  if (!self) {
    message = message == '' ? '...' : message;
  }

  return (
    <div
      className={classNames('flex gap-2.5 w-full', {
        'flex-row items-start': !self,
        'flex-row-reverse items-end': self,
      })}
    >
      <Icon className="flex flex-col w-8 h-8 rounded-full" />
      <div
        className={classNames(
          `flex flex-col leading-1.5 p-4 border-${color}-200 bg-${color}-700 w-fit max-w-full`,
          {
            'rounded-e-xl rounded-es-xl': !self,
            'rounded-s-xl rounded-se-xl': self,
          },
        )}
      >
        <div className="flex flex-row items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-white">{name}</span>
          {time && (
            <time className="text-sm font-normal text-gray-400">{time}</time>
          )}
        </div>
        <div className="prose prose-invert prose-sm w-fit max-w-full">
          {markdown ? (
            <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
              {message}
            </Markdown>
          ) : (
            <p>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;
