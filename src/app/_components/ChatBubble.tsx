import classNames from 'classnames';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIBotIcon, UserIcon } from '@/app/_components/Icons';

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
  const Icon = self ? UserIcon : AIBotIcon;

  return (
    <div
      className={classNames('flex gap-2 w-full items-start', {
        'flex-row': !self,
        'flex-row-reverse': self,
      })}
    >
      <Icon className="flex flex-col w-8 h-8" />
      <div
        className={classNames(`flex flex-col p-6 w-fit max-w-full`, {
          'rounded-e-xl rounded-es-xl': !self,
          'rounded-s-xl rounded-ee-xl': self,
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
