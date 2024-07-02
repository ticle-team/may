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

export function icon() {}

function ChatBubble({
  self = false,
  name,
  time,
  message,
  markdown = false,
  color = 'primary',
}: ChatBubbleProps) {
  const Icon = self ? UserIcon : GlobeAltIcon;

  return (
    <div
      className={classNames('flex gap-2.5 w-full', {
        'flex-row items-start': !self,
        'flex-row-reverse items-end': self,
      })}
    >
      <Icon className="flex flex-col w-8 h-8 rounded-full" />
      <div
        className={classNames(`flex flex-col p-6 w-fit max-w-full`, {
          'rounded-e-xl rounded-es-xl': !self,
          'rounded-s-xl rounded-se-xl': self,
          'border-secondary-200 bg-secondary-700': color === 'secondary',
          'border-primary-200 bg-primary-200': color === 'primary',
        })}
      >
        <article className="prose prose-sm w-fit max-w-full">
          {markdown ? (
            <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
              {message}
            </Markdown>
          ) : (
            <p>{message}</p>
          )}
        </article>
      </div>
    </div>
  );
}

export default ChatBubble;
